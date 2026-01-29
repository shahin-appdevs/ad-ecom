"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import ProductSidebar from "@/components/partials/ProductSidebar";
import Button from "@/components/utility/Button";
import {
    flashGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const ProductSkeleton = () => {
    return (
        <div className="bg-[#f1f5f9] rounded-md animate-pulse">
            <div className="relative">
                <div className="w-full h-[150px] sm:h-[215px] bg-gray-300 rounded-t-md"></div>
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

const CountdownSkeleton = () => {
    return (
        <div className="flex gap-3 text-sm sm:text-xl font-semibold text-color__heading">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center flex flex-col">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-300 rounded"></div>
                    <span className="text-xs mt-1 h-3 w-full bg-gray-300 rounded"></span>
                </div>
            ))}
        </div>
    );
};

export default function FlashProduct() {
    const [flashData, setFlashData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const fetchFlashData = async () => {
            setLoading(true);
            try {
                const response = await flashGetAPI();
                setFlashData(response.data.data);
            } catch (error) {
                toast.error(
                    error.response?.data?.message?.error?.[0] ||
                        "Failed to fetch flash products",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchFlashData();
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

    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
    });
    const { incrementCart, decrementCart } = useCart();
    const [states, setStates] = useState([]);

    // Add the comprehensive price calculation function
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
        if (!price || !flashData?.base_curr_symbol)
            return `${flashData?.base_curr_symbol || ""}0`;
        return `${flashData.base_curr_symbol}${parseFloat(price).toFixed(2)}`;
    };

    const saveToLocalStorage = useCallback(
        (product, quantity) => {
            if (!flashData) return;

            const savedCart = localStorage.getItem("flashSaleCart");
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
                        ? `${backendBaseURL}/${flashData.product_image_path}/${product.main_image}`
                        : `${backendBaseURL}/${flashData.default_image_path}`,
                    base_curr_symbol: flashData.base_curr_symbol,
                });
            }

            cartItems = cartItems.filter((item) => item.quantity > 0);
            localStorage.setItem("flashSaleCart", JSON.stringify(cartItems));
        },
        [flashData, isReseller],
    );

    useEffect(() => {
        if (!flashData?.flash_products) return;

        const savedCart = localStorage.getItem("flashSaleCart");
        const initialStates = flashData.flash_products.map((product) => {
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
        });

        setStates(initialStates);
    }, [flashData]);

    const handleToggle = (index) => {
        setStates((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, showQuantity: true } : item,
            ),
        );
        incrementCart();
        saveToLocalStorage(flashData.flash_products[index], 1);
    };

    const increaseQuantity = (index, value) => {
        if (!flashData?.flash_products) return;

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
            flashData.flash_products[index],
            states[index].quantity + value,
        );
    };

    const decreaseQuantity = (index, value) => {
        if (!flashData?.flash_products) return;

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
            flashData.flash_products[index],
            states[index].quantity - value,
        );
    };

    useEffect(() => {
        if (!flashData?.flash_sale_end_date) return;
        const endTime = new Date(flashData.flash_sale_end_date).getTime();

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance > 0) {
                setTimeLeft({
                    days: String(
                        Math.floor(distance / (1000 * 60 * 60 * 24)),
                    ).padStart(2, "0"),
                    hours: String(
                        Math.floor((distance / (1000 * 60 * 60)) % 24),
                    ).padStart(2, "0"),
                    minutes: String(
                        Math.floor((distance / 1000 / 60) % 60),
                    ).padStart(2, "0"),
                    seconds: String(
                        Math.floor((distance / 1000) % 60),
                    ).padStart(2, "0"),
                });
            } else {
                setTimeLeft({
                    days: "00",
                    hours: "00",
                    minutes: "00",
                    seconds: "00",
                });
            }
        };

        const timer = setInterval(updateCountdown, 1000);
        updateCountdown();
        return () => clearInterval(timer);
    }, [flashData?.flash_sale_end_date]);

    if (loading) {
        return (
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                        <div className="hidden sm:block p-2.5  xl:p-0 col-span-1 xl:col-span-2 bg-white rounded-md relative w-full h-full">
                            <ProductSidebar />
                        </div>
                        <div className="col-span-1 xl:col-span-10">
                            <div className="bg-white p-4 rounded-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-6 w-24 bg-gray-300 rounded"></div>
                                    <CountdownSkeleton />
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
                    <div className="hidden p-2.5 xl:p-0 sm:block col-span-1 xl:col-span-2 bg-white rounded-md  relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            <div className="flex items-center justify-between mb-4">
                                <h6>Flash Sale</h6>
                                <div className="flex gap-3 text-sm sm:text-xl font-semibold text-color__heading">
                                    <div className="text-center flex flex-col">
                                        <p>{timeLeft.days}</p>
                                        <span className="text-xs">days</span>
                                    </div>
                                    <div className="text-center flex flex-col">
                                        <p>{timeLeft.hours}</p>
                                        <span className="text-xs">hours</span>
                                    </div>
                                    <div className="text-center flex flex-col">
                                        <p>{timeLeft.minutes}</p>
                                        <span className="text-xs">min</span>
                                    </div>
                                    <div className="text-center flex flex-col">
                                        <p>{timeLeft.seconds}</p>
                                        <span className="text-xs">sec</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {flashData?.flash_products?.map(
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
                                                <div className="relative">
                                                    <div className="w-full h-[150px] sm:h-[215px] rounded-t-md overflow-hidden">
                                                        <Image
                                                            src={
                                                                product.main_image
                                                                    ? `${backendBaseURL}/${flashData.product_image_path}/${product.main_image}`
                                                                    : `${backendBaseURL}/${flashData.default_image_path}`
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
                                                    <h5 className="text-sm md:text-base font-normal text-[#4b5563] mb-2 sm:whitespace-normal truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {product.title}
                                                    </h5>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <span className="text-base md:text-lg font-semibold text-primary__color">
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
                            <div className="text-center mt-10">
                                <Button
                                    title="Load More"
                                    variant="primary"
                                    size="md"
                                    className="!px-8"
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
