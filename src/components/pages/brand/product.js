"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import ProductSidebar from "@/components/partials/ProductSidebar";
import Button from "@/components/utility/Button";
import {
    brandProductGetAPI,
    nextPageGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { getBaseCurrency } from "@/components/utility/getBaseCurrency";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

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

function BrandProduct() {
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const [brandId, setBrandId] = useState(null);
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);

    const { baseCurrencySymbol } = getBaseCurrency(data);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
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

    useEffect(() => {
        if (idParam) {
            setBrandId(parseInt(idParam));
        }
    }, [idParam]);

    const formatPrice = (price) => {
        if (!price) return `${baseCurrencySymbol}0.00`;
        const numericValue =
            typeof price === "string" ? parseFloat(price) : price;
        return `${baseCurrencySymbol}${numericValue.toFixed(2)}`;
    };

    useEffect(() => {
        const fetchBrandProduct = async () => {
            if (!brandId) return;
            try {
                setLoading(true);
                const response = await brandProductGetAPI(brandId);
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
                                    ? `${backendBaseURL}/${response.data.data.main_image_path}/${product.main_image}`
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

                    if (response?.data?.data?.brand) {
                        setData(response.data.data);
                        setBrand({
                            id: response.data.data.brand.id,
                            title: response.data.data.brand.title,
                        });
                    }

                    setProducts(formattedProducts);
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchBrandProduct();
    }, [brandId]);

    const formatProduct = (product, responseData) => {
        const listPrice = parseFloat(product.product_prices?.list_price || 0);
        const salePrice = parseFloat(product.product_prices?.sale_price || 0);
        const flashPrice = parseFloat(
            product.product_additional_prices?.flash_price || 0,
        );
        const resellPrice = parseFloat(
            product.product_additional_prices?.resell_price || 0,
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
            ...product,
            id: product.id,
            slug: product.slug,
            image: product.main_image
                ? `${backendBaseURL}/${responseData.main_image_path}/${product.main_image}`
                : `${backendBaseURL}/${responseData.default_image_path}`,
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
            stock: product.product_stock?.product_quantity || 0,
            hasDiscount: discount > 0,
            isResellerPrice: isReseller && resellPrice > 0,
        };
    };

    const handleLoadMoreProducts = async () => {
        setLoadMoreLoading(true);
        try {
            const res = await nextPageGetAPI(
                `${data.products?.next_page_url}&brand_id=${brandId}`,
            );
            const newRaw = res.data.data.products?.data || [];
            const newFormatted = newRaw.map((p) =>
                formatProduct(p, res.data.data),
            );
            setProducts((prev) => [...prev, ...newFormatted]);
            setData((prev) => ({
                ...prev,
                products: {
                    ...prev.products,
                    next_page_url: res.data.data.products?.next_page_url,
                },
            }));
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] ||
                    "Failed to load more products",
            );
        } finally {
            setLoadMoreLoading(false);
        }
    };

    const t = useTranslations("HomePage.shopByBrand");
    const loadMore = t("loadMore");

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="hidden sm:block col-span-1  xl:p-0  xl:col-span-2 bg-white rounded-md p-2.5 relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            {brand && (
                                <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
                                    <h6>{brand.title}</h6>
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {loading ? (
                                    Array.from({ length: 10 }).map(
                                        (_, index) => (
                                            <ProductSkeleton
                                                key={`skeleton-${index}`}
                                            />
                                        ),
                                    )
                                ) : products.length === 0 ? (
                                    <div className="col-span-full text-center py-10">
                                        <p>{t("noProductsFound")}</p>
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
                                                        src={product.image}
                                                        fill
                                                        alt={product.title}
                                                        className="object-cover rounded-t-md"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                                {product.hasDiscount && (
                                                    <span className="absolute right-[8px] top-[8px] text-xs bg-red-500 text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                        {product.discount}{" "}
                                                        {t("off")}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-[10px] pt-[5px]">
                                                <h5 className="text-sm md:text-base font-normal text-[#4b5563] mb-2 sm:whitespace-normal truncate whitespace-nowrap overflow-hidden text-ellipsis">
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
                            {loadMoreLoading && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <ProductSkeleton
                                                key={`load-more-skeleton-${index}`}
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                            {data?.products?.next_page_url && (
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

export default function BrandProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BrandProduct />
        </Suspense>
    );
}
