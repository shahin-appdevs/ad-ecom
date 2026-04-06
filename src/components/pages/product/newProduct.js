"use client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import ProductSidebar from "@/components/partials/ProductSidebar";
import Button from "@/components/utility/Button";
import {
    newArrivalGetAPI,
    nextPageGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const ProductSkeleton = () => {
    return (
        <div className="bg-gray-100 rounded-md animate-pulse">
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
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [newArrivalProducts, setNewArrivalProducts] = useState([]);
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);

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
                setNewArrivalProducts(
                    response.data.data?.new_arrival_products?.data || [],
                );
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
                setIsReseller(
                    response.data.data?.user?.reseller_verified === "1",
                );
            } catch (error) {
                toast.error("Failed to fetch user profile:", error);
            }
        };
        fetchUserProfile();
    }, [isLoggedIn]);

    // Price calculation
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

    const formatPrice = (price) => {
        if (!price || !newArrivalData?.base_curr_symbol)
            return `${newArrivalData?.base_curr_symbol || ""}0`;
        return `${newArrivalData.base_curr_symbol}${parseFloat(price).toFixed(2)}`;
    };

    const handleLoadMoreProducts = async () => {
        setLoadMoreLoading(true);
        try {
            const res = await nextPageGetAPI(
                newArrivalData.new_arrival_products?.next_page_url,
            );
            const newProducts = res.data.data.new_arrival_products?.data || [];

            setNewArrivalProducts((prev) => [...prev, ...newProducts]);
            setNewArrivalData((prev) => ({
                ...prev,
                new_arrival_products: {
                    ...prev.new_arrival_products,
                    next_page_url:
                        res.data.data.new_arrival_products?.next_page_url,
                },
            }));
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] ||
                    "Failed to fetch new arrival products",
            );
        } finally {
            setLoadMoreLoading(false);
        }
    };

    const t = useTranslations("HomePage.newArrival");
    const newArrivalTitle = t("newArrivalTitle");
    const loadMore = t("loadMore");
    const off = t("off");

    if (loading) {
        return (
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                        <div className="hidden p-2.5 xl:p-0 sm:block col-span-1 xl:col-span-2 rounded-md relative w-full h-full">
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
                                <h6>{newArrivalTitle}</h6>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {newArrivalProducts?.map((product, index) => {
                                    const {
                                        discount,
                                        displayPrice,
                                        originalPrice,
                                        hasDiscount,
                                        isResellerPrice,
                                    } = calculateDiscount(product);

                                    return (
                                        <Link
                                            href={`/product/details?id=${product.id}`}
                                            key={index}
                                            className="group bg-gray-100 rounded-md hover:shadow-md transition-shadow block"
                                        >
                                            <div className="relative">
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
                                                    <span className="absolute top-[8px] right-[8px] text-xs bg-red-500 text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                        {discount} {off}
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
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            {loadMoreLoading && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {[...Array(5)].map((_, index) => (
                                        <ProductSkeleton key={index} />
                                    ))}
                                </div>
                            )}

                            {newArrivalData?.new_arrival_products
                                ?.next_page_url && (
                                <div className="text-center mt-10">
                                    <Button
                                        title={loadMore}
                                        variant="primary"
                                        size="md"
                                        className="!px-8"
                                        onClick={handleLoadMoreProducts}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
