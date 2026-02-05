"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import { useHomeData } from "@/components/context/HomeContext";
import { profiledGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { ArrowRightIcon } from "lucide-react";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const SkeletonProductCard = () => (
    <div className="bg-gray-100 rounded-md">
        <div className="relative p-[10px]">
            <div className="w-full h-[150px] sm:h-[215px] bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="p-[10px] pt-[5px]">
            <div className="flex items-center gap-1 mb-1">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
    </div>
);

const SkeletonCategorySection = () => (
    <div className="bg-white p-4 pt-0 sm:pt-4 sm:rounded-md mb-6">
        <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-1/6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
                <SkeletonProductCard key={index} />
            ))}
        </div>
    </div>
);

export default function CategoryProducts() {
    const { homeData, loading } = useHomeData();
    const {
        products_under_category = [],
        base_curr_symbol,
        product_image_path,
    } = homeData || {};
    const [userProfile, setUserProfile] = useState(null);
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { incrementCart, decrementCart } = useCart();

    // State management for each product
    const [states, setStates] = useState(() => {
        const initialState = {};
        products_under_category.forEach((category) => {
            category.products?.forEach((product) => {
                initialState[`${category.id}-${product.id}`] = {
                    showQuantity: false,
                    quantity: 1,
                };
            });
        });
        return initialState;
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
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
                console.error("Failed to fetch user profile:", error);
            }
        };

        fetchUserProfile();
    }, [isLoggedIn]);

    const saveToLocalStorage = useCallback(
        (categoryId, product, quantity) => {
            const savedCart = localStorage.getItem("categoryProductsCart");
            let cartItems = savedCart ? JSON.parse(savedCart) : [];

            const existingIndex = cartItems.findIndex(
                (item) => item.id === product.id,
            );

            const price =
                isReseller && product.product_additional_prices?.resell_price
                    ? product.product_additional_prices.resell_price
                    : product.product_additional_prices?.flash_price ||
                      product.product_prices?.sale_price ||
                      product.product_prices?.list_price;

            if (existingIndex >= 0) {
                cartItems[existingIndex].quantity = quantity;
                cartItems[existingIndex].price = price;
            } else {
                cartItems.push({
                    id: product.id,
                    title: product.title,
                    price: price,
                    quantity: quantity,
                    image: product.main_image
                        ? `${backendBaseURL}/${product_image_path}/${product.main_image}`
                        : `${backendBaseURL}/${homeData.default_image_path}`,
                    base_curr_symbol: base_curr_symbol,
                });
            }

            cartItems = cartItems.filter((item) => item.quantity > 0);
            localStorage.setItem(
                "categoryProductsCart",
                JSON.stringify(cartItems),
            );
        },
        [
            product_image_path,
            base_curr_symbol,
            homeData?.default_image_path,
            isReseller,
        ],
    );

    useEffect(() => {
        if (products_under_category.length === 0) return;

        const savedCart = localStorage.getItem("categoryProductsCart");
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            const newStates = {};

            products_under_category.forEach((category) => {
                category.products?.forEach((product) => {
                    const cartItem = parsedCart.find(
                        (item) => item.id === product.id,
                    );
                    newStates[`${category.id}-${product.id}`] = {
                        showQuantity: !!cartItem,
                        quantity: cartItem?.quantity || 1,
                    };
                });
            });

            setStates(newStates);
        }
    }, [products_under_category]);

    const handleToggle = (categoryId, product) => {
        setStates((prev) => ({
            ...prev,
            [`${categoryId}-${product.id}`]: {
                ...prev[`${categoryId}-${product.id}`],
                showQuantity: true,
            },
        }));
        incrementCart();
        saveToLocalStorage(categoryId, product, 1);
    };

    const increaseQuantity = (categoryId, product, value) => {
        const newQuantity =
            (states[`${categoryId}-${product.id}`]?.quantity || 1) + value;
        setStates((prev) => ({
            ...prev,
            [`${categoryId}-${product.id}`]: {
                ...prev[`${categoryId}-${product.id}`],
                quantity: Math.max(1, newQuantity),
            },
        }));
        incrementCart();
        saveToLocalStorage(categoryId, product, newQuantity);
    };

    const decreaseQuantity = (categoryId, product, value) => {
        const currentQty = states[`${categoryId}-${product.id}`]?.quantity || 1;

        if (currentQty <= 1) {
            return;
        }

        const newQuantity = currentQty - value;
        setStates((prev) => ({
            ...prev,
            [`${categoryId}-${product.id}`]: {
                ...prev[`${categoryId}-${product.id}`],
                quantity: newQuantity,
            },
        }));

        decrementCart();
        saveToLocalStorage(categoryId, product, newQuantity);
    };

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
        if (!price) return `${base_curr_symbol}0`;
        return `${base_curr_symbol}${parseFloat(price).toFixed(2)}`;
    };

    if (loading) {
        return (
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonCategorySection key={i} />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="sm:pt-4 ">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4 ">
                {products_under_category.map((category) => (
                    <div
                        key={category.id}
                        className="bg-white p-4 pt-0 sm:pt-4 sm:rounded-md mb-6"
                    >
                        <div className="flex items-center justify-between mb-4 pt-4 md:pt-0">
                            <h6>{category.title}</h6>
                            <div>
                                <Link
                                    href={`/categories/products?id=${category.id}`}
                                    className="text-[#4b5563] font-semibold flex items-center gap-1"
                                >
                                    <span>View More</span>
                                    <ArrowRightIcon
                                        size={18}
                                        className="w-4 h-4"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {category.products?.map((product) => {
                                const {
                                    discount,
                                    displayPrice,
                                    originalPrice,
                                    hasDiscount,
                                    isResellerPrice,
                                    stock,
                                } = calculateDiscount(product);
                                const productState = states[
                                    `${category.id}-${product.id}`
                                ] || {
                                    showQuantity: false,
                                    quantity: 1,
                                };

                                return (
                                    <Link
                                        href={`/product/details?id=${product.id}`}
                                        key={product.id}
                                        className="group bg-gray-100 rounded-md hover:shadow-md transition-shadow block"
                                    >
                                        <div className="relative ">
                                            <div className="w-full h-[150px] sm:h-[215px] rounded-t-md overflow-hidden">
                                                <Image
                                                    src={
                                                        product.main_image
                                                            ? `${backendBaseURL}/${product_image_path}/${product.main_image}`
                                                            : `${backendBaseURL}/${homeData.default_image_path}`
                                                    }
                                                    width={100}
                                                    height={100}
                                                    alt={
                                                        product.title ||
                                                        "Product"
                                                    }
                                                    className="w-full group-hover:scale-105 duration-200 h-full object-cover rounded-t-md"
                                                />
                                            </div>
                                            <span className="absolute right-[8px] top-[8px] text-xs bg-red-500 text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                {discount} off
                                            </span>
                                        </div>
                                        <div className="p-[10px]">
                                            <h5 className="text-sm md:text-base font-normal text-[#4b5563] mb-2 truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                {product.title}
                                            </h5>
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-base md:text-lg font-semibold text-primary__color">
                                                    {formatPrice(displayPrice)}
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
                                                {!productState.showQuantity ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleToggle(category.id, product);
                                                        }}
                                                        className="bg-white shadow-sm text-gray-800 text-xs px-4 py-2 rounded-md font-medium flex items-center justify-between w-full"
                                                        disabled={stock <= 0}
                                                    >
                                                        <PlusIcon className="h-5 w-5" />
                                                        {stock <= 0 ? (
                                                            <span>Out of Stock</span>
                                                        ) : (
                                                            <span className="flex items-center gap-2">Buy Now <span className="hidden sm:block">→</span></span>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full bg-white shadow-sm rounded-md overflow-hidden">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                decreaseQuantity(category.id, product, 1);
                                                            }}
                                                            className="text-gray-800 px-4 py-2"
                                                        >
                                                            <MinusIcon className="h-4 w-4" />
                                                        </button>
                                                        <span className="px-3 py-1 bg-white text-gray-800">
                                                            {productState.quantity}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                increaseQuantity(category.id, product, 1);
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
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
