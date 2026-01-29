"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { useCart } from "@/components/context/CartContext";
import { useHomeData } from "@/components/context/HomeContext";
import { profiledGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const NewArrivalSkeleton = () => {
    return (
        <div className="xl:max-w-[1530px] container mx-auto sm:px-4 pt-4">
            <div className="bg-white p-4 sm:rounded-md">
                <div className="flex sm:gap-3 md:gap-0 items-center justify-between mb-4">
                    <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    breakpoints={{
                        0: { slidesPerView: 2 },
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                        1280: { slidesPerView: 6 },
                    }}
                >
                    {[...Array(6)].map((_, index) => (
                        <SwiperSlide key={index}>
                            <div className="bg-[#f1f5f9] rounded-md">
                                <div className="relative p-[10px]">
                                    <div className="w-full h-[150px] sm:h-[215px] bg-gray-300 rounded-md animate-pulse"></div>
                                </div>
                                <div className="p-[10px] pt-[5px]">
                                    <div className="flex items-center gap-1 mb-1">
                                        <div className="h-5 w-16 bg-gray-300 rounded animate-pulse"></div>
                                        <div className="h-4 w-10 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                    <div className="h-4 w-full bg-gray-300 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 bg-gray-300 rounded-md animate-pulse"></div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default function NewArrival() {
    const { homeData, loading } = useHomeData();
    const {
        new_arrival_products = [],
        base_curr_symbol,
        product_image_path,
    } = homeData || {};
    const [userProfile, setUserProfile] = useState(null);
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { incrementCart, decrementCart } = useCart();
    const [states, setStates] = useState(
        new_arrival_products.map(() => ({
            showQuantity: false,
            quantity: 1,
        })),
    );

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
        (product, quantity) => {
            const savedCart = localStorage.getItem("newArrivalCart");
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
            localStorage.setItem("newArrivalCart", JSON.stringify(cartItems));
        },
        [
            product_image_path,
            base_curr_symbol,
            homeData?.default_image_path,
            isReseller,
        ],
    );

    useEffect(() => {
        if (new_arrival_products.length === 0) return;

        const savedCart = localStorage.getItem("newArrivalCart");
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setStates(
                new_arrival_products.map((product) => {
                    const cartItem = parsedCart.find(
                        (item) => item.id === product.id,
                    );
                    return {
                        showQuantity: !!cartItem,
                        quantity: cartItem?.quantity || 1,
                    };
                }),
            );
        }
    }, [new_arrival_products]);

    const handleToggle = (index) => {
        setStates((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, showQuantity: true } : item,
            ),
        );
        incrementCart();
        saveToLocalStorage(new_arrival_products[index], 1);
    };

    const increaseQuantity = (index, value) => {
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
            new_arrival_products[index],
            states[index].quantity + value,
        );
    };

    const decreaseQuantity = (index, value) => {
        const currentQty = states[index]?.quantity;

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
            new_arrival_products[index],
            states[index].quantity - value,
        );
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
        return <NewArrivalSkeleton />;
    }

    if (!new_arrival_products || new_arrival_products.length === 0) {
        return null;
    }

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white p-4 sm:rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h6>New Arrival</h6>
                        <div>
                            <Link href="/product/new" className="font-semibold">
                                See More →
                            </Link>
                        </div>
                    </div>
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={10}
                        autoplay={{ delay: 2000, disableOnInteraction: false }}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                            1280: { slidesPerView: 6 },
                        }}
                        modules={[Autoplay]}
                    >
                        {new_arrival_products.map((product, index) => {
                            const {
                                discount,
                                displayPrice,
                                originalPrice,
                                hasDiscount,
                                isResellerPrice,
                                stock,
                            } = calculateDiscount(product);

                            return (
                                <SwiperSlide key={product.id}>
                                    <Link
                                        href={`/product/details?id=${product.id}`}
                                        className="group/card bg-[#f1f5f9] rounded-md hover:shadow-md transition-shadow block"
                                    >
                                        <div className="relative p-[10px] ">
                                            <div className="w-full h-[150px] sm:h-[215px] overflow-hidden">
                                                <Image
                                                    src={
                                                        product.main_image
                                                            ? `${backendBaseURL}/${product_image_path}/${product.main_image}`
                                                            : `${backendBaseURL}/${homeData.default_image_path}`
                                                    }
                                                    width={100}
                                                    height={100}
                                                    alt={product.title}
                                                    className="group-hover/card:scale-105 transition-transform duration-300 w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                            <span className="absolute right-[8px] top-[8px] text-xs bg-primary__color text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                {discount} off
                                            </span>
                                        </div>
                                        <div className="p-[10px] pt-[5px]">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-base font-semibold text-primary__color">
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
                                            <h5 className="text-sm font-normal text-[#4b5563] mb-2 sm:whitespace-normal truncate whitespace-nowrap overflow-hidden text-ellipsis">
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
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
