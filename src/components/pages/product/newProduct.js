"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import ProductSidebar from "@/components/partials/ProductSidebar";
import Button from "@/components/utility/Button";
import {
    newArrivalGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const ProductSkeleton = () => {
    return (
        <div className="bg-[#f1f5f9] rounded-md animate-pulse">
            <div className="relative">
                <div className="w-full h-[150px] sm:h-[215px] bg-gray-300 rounded-md"></div>
            </div>
            <div className="p-[10px] pt-[5px]">
                <div className="flex items-center gap-1 mb-1">
                    <div className="h-6 w-20 bg-gray-300 rounded"></div>
                </div>
                <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                <div className="h-10 bg-gray-300 rounded-md"></div>
            </div>
        </div>
    );
};

export default function NewProduct() {
    const [newArrivalData, setNewArrivalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const fetchNewArrivalData = async () => {
            setLoading(true);
            try {
                const response = await newArrivalGetAPI();
                setNewArrivalData(response.data.data);
            } catch (error) {
                toast.error(
                    error.response?.data?.message?.error?.[0] ||
                        "Failed to fetch new arrival products",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchNewArrivalData();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!isLoggedIn) return;

            try {
                const response = await profiledGetAPI();
                setUserProfile(response.data.data);
                setIsReseller(
                    response.data.data?.user?.reseller_verified === "1",
                );
            } catch (error) {
                toast.error("Failed to fetch user profile:", error);
            }
        };

        fetchUserProfile();
    }, [isLoggedIn]);

    const { incrementCart, decrementCart } = useCart();
    const [states, setStates] = useState([]);

    // Add the comprehensive price calculation function from New Arrival
    const calculateDiscount = (product) => {
        const listPrice = parseFloat(product.product_prices?.list_price || 0);
        const salePrice = parseFloat(product.product_prices?.sale_price || 0);
        const flashPrice = parseFloat(
            product.product_additional_prices?.flash_price || 0,
        );
        const resellPrice = parseFloat(
            product.product_additional_prices?.resell_price || 0,
        );

        const originalPrice =
            isReseller && resellPrice > 0
                ? flashPrice > 0
                    ? flashPrice
                    : listPrice
                : flashPrice > 0
                  ? listPrice
                  : salePrice > 0
                    ? listPrice
                    : listPrice;

        const displayPrice =
            isReseller && resellPrice > 0
                ? resellPrice
                : flashPrice > 0
                  ? flashPrice
                  : salePrice > 0
                    ? salePrice
                    : listPrice;

        const discount =
            isReseller && resellPrice > 0
                ? Math.round(
                      (((flashPrice > 0 ? flashPrice : listPrice) -
                          resellPrice) /
                          (flashPrice > 0 ? flashPrice : listPrice)) *
                          100,
                  )
                : flashPrice && listPrice
                  ? Math.round(((listPrice - flashPrice) / listPrice) * 100)
                  : salePrice && listPrice
                    ? Math.round(((listPrice - salePrice) / listPrice) * 100)
                    : 0;

        return {
            discount: discount > 0 ? `${discount}%` : null,
            displayPrice: displayPrice,
            originalPrice: originalPrice,
            hasDiscount: discount > 0,
            isResellerPrice: isReseller && resellPrice > 0,
            stock: product.product_stock?.product_quantity || 0,
        };
    };

    // Format price with currency symbol
    const formatPrice = (price) => {
        if (!price || !newArrivalData?.base_curr_symbol)
            return `${newArrivalData?.base_curr_symbol || ""}0`;
        return `${newArrivalData.base_curr_symbol}${parseFloat(price).toFixed(2)}`;
    };

    const saveToLocalStorage = useCallback(
        (product, quantity) => {
            if (!newArrivalData?.new_arrival_products?.data) return;

            const savedCart = localStorage.getItem("newArrivalCart");
            let cartItems = savedCart ? JSON.parse(savedCart) : [];

            const existingIndex = cartItems.findIndex(
                (item) => item.id === product.id,
            );

            // Use the same price calculation logic for consistency
            const { displayPrice } = calculateDiscount(product);

            if (existingIndex >= 0) {
                cartItems[existingIndex].quantity = quantity;
                cartItems[existingIndex].price = displayPrice;
            } else {
                cartItems.push({
                    id: product.id,
                    title: product.title,
                    price: displayPrice,
                    quantity: quantity,
                    image: product.main_image
                        ? `${backendBaseURL}/${newArrivalData.product_image_path}/${product.main_image}`
                        : `${backendBaseURL}/${newArrivalData.default_image_path}`,
                    base_curr_symbol: newArrivalData.base_curr_symbol,
                    isResellerPrice: isReseller,
                });
            }

            cartItems = cartItems.filter((item) => item.quantity > 0);
            localStorage.setItem("newArrivalCart", JSON.stringify(cartItems));
        },
        [newArrivalData, isReseller],
    );

    useEffect(() => {
        if (!newArrivalData?.new_arrival_products?.data) return;

        const savedCart = localStorage.getItem("newArrivalCart");
        const initialStates = newArrivalData.new_arrival_products.data.map(
            (product) => {
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    const cartItem = parsedCart.find(
                        (item) => item.id === product.id,
                    );
                    return {
                        showQuantity: !!cartItem,
                        quantity: cartItem?.quantity || 1,
                    };
                }
                return {
                    showQuantity: false,
                    quantity: 1,
                };
            },
        );

        setStates(initialStates);
    }, [newArrivalData]);

    const handleToggle = (index) => {
        setStates((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, showQuantity: true } : item,
            ),
        );
        incrementCart();
        saveToLocalStorage(newArrivalData.new_arrival_products.data[index], 1);
    };

    const increaseQuantity = (index, value) => {
        if (!newArrivalData?.new_arrival_products) return;

        setStates((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          quantity: Math.max(1, item.quantity + value),
                      }
                    : item,
            ),
        );
        incrementCart();
        saveToLocalStorage(
            newArrivalData.new_arrival_products.data[index],
            states[index].quantity + value,
        );
    };

    const decreaseQuantity = (index, value) => {
        if (!newArrivalData?.new_arrival_products) return;

        const currentQty = states[index].quantity;

        if (currentQty <= 1) {
            return;
        }

        setStates((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          quantity: item.quantity - value,
                      }
                    : item,
            ),
        );
        decrementCart();
        saveToLocalStorage(
            newArrivalData.new_arrival_products.data[index],
            states[index].quantity - value,
        );
    };

    if (loading) {
        return (
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                        <div className="hidden p-2.5 xl:p-0  sm:block col-span-1 xl:col-span-2 bg-white rounded-md  relative w-full h-full">
                            <ProductSidebar />
                        </div>
                        <div className="col-span-1 xl:col-span-10">
                            <div className="bg-white p-4 rounded-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-6 w-24 bg-gray-300 rounded"></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {[...Array(10)].map((_, index) => (
                                        <ProductSkeleton key={index} />
                                    ))}
                                </div>
                                <div className="text-center mt-10">
                                    <div className="h-10 w-32 bg-gray-300 rounded-md inline-block"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="hidden p-2.5 xl:p-0 sm:block col-span-1 xl:col-span-2 bg-white rounded-md relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            <div className="flex items-center justify-between mb-4">
                                <h6>New Arrival</h6>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {newArrivalData?.new_arrival_products?.data?.map(
                                    (product, index) => {
                                        const {
                                            discount,
                                            displayPrice,
                                            originalPrice,
                                            hasDiscount,
                                            isResellerPrice,
                                            stock,
                                        } = calculateDiscount(product);

                                        return (
                                            <Link
                                                href={`/product/details?id=${product.id}`}
                                                key={index}
                                                className="group bg-[#f1f5f9] rounded-md hover:shadow-md transition-shadow block"
                                            >
                                                <div className="relative ">
                                                    <div className="w-full h-[150px] sm:h-[215px] rounded-t-md overflow-hidden">
                                                        <Image
                                                            src={
                                                                product.main_image
                                                                    ? `${backendBaseURL}/${newArrivalData.product_image_path}/${product.main_image}`
                                                                    : `${backendBaseURL}/${newArrivalData.default_image_path}`
                                                            }
                                                            width={100}
                                                            height={100}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover rounded-t-md group-hover:scale-105 transition-transform duration-200"
                                                        />
                                                    </div>
                                                    {discount && (
                                                        <span className="absolute top-[8px] right-[8px] text-xs bg-primary__color text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                            {discount} off
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-[10px]">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <span className="text-base font-semibold text-primary__color">
                                                            {formatPrice(
                                                                displayPrice,
                                                            )}
                                                        </span>
                                                        {(hasDiscount ||
                                                            isResellerPrice) && (
                                                            <span className="text-xs text-[#4b5563] line-through">
                                                                {formatPrice(
                                                                    originalPrice,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h5 className="text-sm font-normal text-[#4b5563] mb-2 truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {product.title}
                                                    </h5>
                                                    {/* <div className="relative">
                                                    {!states[index]
                                                        ?.showQuantity ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleToggle(index);
                                                            }}
                                                            className="bg-white shadow-sm text-gray-800 text-xs px-4 py-2 rounded-md font-medium flex items-center justify-between w-full"
                                                            disabled={stock <= 0}
                                                        >
                                                            <PlusIcon className="h-5 w-5" />
                                                            {stock <= 0 ? (
                                                                <span>
                                                                    Out of Stock
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-2">
                                                                    Buy Now{" "}
                                                                    <span className="hidden sm:block">
                                                                        →
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center justify-between w-full bg-white shadow-sm rounded-md overflow-hidden">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    decreaseQuantity(
                                                                        index,
                                                                        1,
                                                                    );
                                                                }}
                                                                className="text-gray-800 px-4 py-2"
                                                            >
                                                                <MinusIcon className="h-4 w-4" />
                                                            </button>
                                                            <span className="px-3 py-1 bg-white text-gray-800">
                                                                {states[index]
                                                                    ?.quantity || 1}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    increaseQuantity(
                                                                        index,
                                                                        1,
                                                                    );
                                                                }}
                                                                className="text-gray-800 px-4 py-2"
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div> */}
                                                </div>
                                            </Link>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
