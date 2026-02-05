"use client";
import { Suspense, useCallback } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import {
    campaignProductGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const CampaignSkeleton = () => (
    <div className="animate-pulse">
        {/* Banner skeleton */}
        <div className="w-full relative h-[200px] lg:h-[300px] mb-4 rounded-md overflow-hidden bg-gray-300">
            {/* Timer skeleton (top-right) */}
            <div className="absolute top-3 right-3 z-10">
                <div className="flex items-center gap-2 bg-gray-400/80 px-3 py-2 rounded-full">
                    <div className="h-3 w-10 bg-gray-500 rounded"></div>
                    <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={`timer-skeleton-${i}`}
                                className="h-6 w-8 bg-gray-500 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom content skeleton */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="h-6 w-1/3 bg-gray-400 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-400 rounded"></div>
            </div>
        </div>
    </div>
);

const ProductSkeleton = () => (
    <div className="bg-gray-100 rounded-md animate-pulse">
        <div className="relative ">
            <div className="w-full h-[150px] sm:h-[215px] bg-gray-300 rounded-md"></div>
        </div>
        <div className="p-[10px] pt-[5px]">
            <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
            <div className="flex items-center gap-1 mb-3">
                <div className="h-5 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded-md"></div>
        </div>
    </div>
);

function CampaignProduct() {
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const { incrementCart, decrementCart } = useCart();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const [campaignId, setCampaignId] = useState(null);
    const [timeLeft, setTimeLeft] = useState({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
    });
    const [states, setStates] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    useEffect(() => {
        if (idParam) {
            setCampaignId(parseInt(idParam));
        }
    }, [idParam]);

    const formatPrice = (price) => {
        if (!price) return "৳0.00";
        const numericValue =
            typeof price === "string" ? parseFloat(price) : price;
        return `৳${numericValue.toFixed(2)}`;
    };

    const saveToLocalStorage = useCallback(
        (product, quantity) => {
            if (!data?.products?.data) return;

            const savedCart = localStorage.getItem("campaignCart");
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
                        ? `${backendBaseURL}/${data.product_image_path}/${product.main_image}`
                        : `${backendBaseURL}/${data.default_image_path}`,
                    base_curr_symbol: data.base_curr_symbol,
                });
            }

            cartItems = cartItems.filter((item) => item.quantity > 0);
            localStorage.setItem("campaignCart", JSON.stringify(cartItems));
        },
        [data, isReseller],
    );

    useEffect(() => {
        if (!data?.products?.data) return;

        const savedCart = localStorage.getItem("campaignCart");
        const initialStates = data.products.data.map((product) => {
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
    }, [data]);

    useEffect(() => {
        const fetchCampaignProduct = async () => {
            if (!campaignId) return;
            try {
                setLoading(true);
                const response = await campaignProductGetAPI(campaignId);
                if (response?.data?.data?.products) {
                    setData(response.data.data);

                    const formattedProducts =
                        response.data.data.products.data.map((product) => {
                            const listPrice = parseFloat(
                                product.product_prices?.list_price || 0,
                            );
                            const salePrice = parseFloat(
                                product.product_prices?.sale_price || 0,
                            );
                            const flashPrice = parseFloat(
                                product.product_additional_prices
                                    ?.flash_price || 0,
                            );
                            const resellPrice = parseFloat(
                                product.product_additional_prices
                                    ?.resell_price || 0,
                            );

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
                                          (((flashPrice > 0
                                              ? flashPrice
                                              : listPrice) -
                                              resellPrice) /
                                              (flashPrice > 0
                                                  ? flashPrice
                                                  : listPrice)) *
                                              100,
                                      )
                                    : flashPrice && listPrice
                                      ? Math.round(
                                            ((listPrice - flashPrice) /
                                                listPrice) *
                                                100,
                                        )
                                      : salePrice && listPrice
                                        ? Math.round(
                                              ((listPrice - salePrice) /
                                                  listPrice) *
                                                  100,
                                          )
                                        : 0;

                            return {
                                ...product,
                                id: product.id,
                                slug: product.slug,
                                image: product.main_image
                                    ? `${backendBaseURL}/${response.data.data.product_image_path}/${product.main_image}`
                                    : `${backendBaseURL}/${response.data.data.default_image_path}`,
                                title: product.title,
                                discount: discount > 0 ? `${discount}%` : null,
                                displayPrice: displayPrice,
                                originalPrice:
                                    flashPrice > 0
                                        ? flashPrice
                                        : salePrice > 0
                                          ? salePrice
                                          : listPrice,
                                listPrice: listPrice,
                                stock:
                                    product.product_stock?.product_quantity ||
                                    0,
                                hasDiscount: discount > 0,
                                isResellerPrice: isReseller && resellPrice > 0,
                            };
                        });

                    if (response?.data?.data?.campaign) {
                        setData(response.data.data);
                        setCampaign({
                            id: response.data.data.campaign.id,
                            title: response.data.data.campaign.title,
                            description:
                                response.data.data.campaign.description,
                            image: response.data.data.campaign.image
                                ? `${backendBaseURL}/${response.data.data.campaign_image_path}/${response.data.data.campaign.image}`
                                : `${backendBaseURL}/${response.data.data.default_image_path}`,
                        });
                    }

                    setProducts(formattedProducts);
                    setStates(
                        formattedProducts.map(() => ({
                            showQuantity: false,
                            quantity: 1,
                        })),
                    );
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaignProduct();
    }, [campaignId]);

    const handleToggle = (index) => {
        setStates((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, showQuantity: true } : item,
            ),
        );
        incrementCart();
        saveToLocalStorage(products[index], 1);
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
        saveToLocalStorage(products[index], states[index].quantity + value);
    };

    const decreaseQuantity = (index, value) => {
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
        saveToLocalStorage(products[index], states[index].quantity - value);
    };

    useEffect(() => {
        if (!data?.campaign?.ends_at) return;
        const endTime = new Date(data.campaign.ends_at).getTime();

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
    }, [data?.campaign?.ends_at]);

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="col-span-1 xl:col-span-12">
                        <div className="bg-white p-4 rounded-md">
                            {loading ? (
                                <>
                                    <CampaignSkeleton />
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                        {Array.from({ length: 10 }).map(
                                            (_, index) => (
                                                <ProductSkeleton
                                                    key={`skeleton-${index}`}
                                                />
                                            ),
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {campaign && (
                                        <div className="w-full relative h-[200px] lg:h-[300px] group mb-4 rounded-md overflow-hidden">
                                            <div className="w-full h-full bg-gray-100 rounded-md overflow-hidden">
                                                <Image
                                                    src={campaign.image}
                                                    alt={campaign.title}
                                                    className="w-full h-full object-cover"
                                                    width={1470}
                                                    height={300}
                                                />

                                                {/* TIMER — absolute top-right (unchanged logic) */}
                                                <div className="absolute top-3 right-3 z-10">
                                                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full text-white text-xs sm:text-sm">
                                                        <span className="font-semibold">
                                                            Ends in
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="bg-red-500 px-2 py-1 rounded-full">
                                                                {timeLeft.days}d
                                                            </span>
                                                            <span className="bg-red-500 px-2 py-1 rounded-full">
                                                                {timeLeft.hours}
                                                                h
                                                            </span>
                                                            <span className="bg-red-500 px-2 py-1 rounded-full">
                                                                {
                                                                    timeLeft.minutes
                                                                }
                                                                m
                                                            </span>
                                                            <span className="bg-red-500 px-2 py-1 rounded-full">
                                                                {
                                                                    timeLeft.seconds
                                                                }
                                                                s
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Banner overlay (collection-style) */}
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t h-full from-black/80 via-black/10 to-transparent">
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                                                        <h3 className="text-2xl md:text-3xl font-medium truncate text-white">
                                                            {campaign.title}
                                                        </h3>
                                                        <p
                                                            dangerouslySetInnerHTML={{
                                                                __html: campaign.description,
                                                            }}
                                                            className="text-sm md:text-base truncate"
                                                        ></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                        {products.length === 0 ? (
                                            <div className="col-span-full text-center py-10">
                                                <p>No products found</p>
                                            </div>
                                        ) : (
                                            products.map((product, index) => (
                                                <Link
                                                    href={`/product/details?id=${product.id}`}
                                                    key={`${product.id}-${index}`}
                                                    className="bg-gray-100 rounded-md hover:shadow-md transition-shadow block"
                                                >
                                                    <div className="relative">
                                                        <div className="w-full h-[150px] sm:h-[215px] relative">
                                                            <Image
                                                                src={
                                                                    product.image
                                                                }
                                                                fill
                                                                alt={
                                                                    product.title
                                                                }
                                                                className="object-cover rounded-t-md"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            />
                                                        </div>

                                                        {product.hasDiscount && (
                                                            <span className="absolute top-[8px] right-[8px] text-xs bg-primary__color text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                                {
                                                                    product.discount
                                                                }{" "}
                                                                off
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="p-[10px]">
                                                        <h5 className="text-sm md:text-base font-normal text-[#4b5563] mb-2 truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {product.title}
                                                        </h5>

                                                        <div className="flex items-center gap-1 mb-1">
                                                            <span className="text-base md:text-lg font-semibold text-primary__color">
                                                                {formatPrice(
                                                                    product.displayPrice,
                                                                )}
                                                            </span>

                                                            {(product.hasDiscount ||
                                                                product.isResellerPrice) && (
                                                                <span className="text-xs text-[#4b5563] line-through">
                                                                    {formatPrice(
                                                                        product.isResellerPrice
                                                                            ? product.originalPrice
                                                                            : product.listPrice,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function CampaignProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CampaignProduct />
        </Suspense>
    );
}
