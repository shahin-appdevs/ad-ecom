"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
    collectionProductGetAPI,
    nextPageGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl"; // ← Added
import { getBaseCurrency } from "@/components/utility/getBaseCurrency";
import { handleApiError } from "@/components/utility/handleApiError";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const CollectionSkeleton = () => (
    <div className="animate-pulse">
        <div className="w-full sm:h-[175px] relative mb-4 bg-gray-300 rounded-md"></div>
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

function CollectionProduct() {
    const t = useTranslations("Collection.collectionProduct"); // ← Added as requested

    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const [collectionId, setCollectionId] = useState(null);
    const [isReseller, setIsReseller] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);

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
                handleApiError(error, t("failedFetchProfile"));
            }
        };

        fetchUserProfile();
    }, [isLoggedIn]);

    useEffect(() => {
        if (idParam) {
            setCollectionId(parseInt(idParam));
        }
    }, [idParam]);

    const { baseCurrencySymbol } = getBaseCurrency(data);

    const formatPrice = (price) => {
        if (!price) return `${baseCurrencySymbol}0.00`;
        const numericValue =
            typeof price === "string" ? parseFloat(price) : price;
        return `${baseCurrencySymbol}${numericValue.toFixed(2)}`;
    };

    useEffect(() => {
        const fetchCollectionProduct = async () => {
            if (!collectionId) return;
            try {
                setLoading(true);
                const response = await collectionProductGetAPI(collectionId);
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

                    if (response?.data?.data?.collection) {
                        setData(response.data.data);
                        setCollection({
                            id: response.data.data.collection.id,
                            title: response.data.data.collection.title,
                            description:
                                response.data.data.collection.description,
                            image: response.data.data.collection.image
                                ? `${backendBaseURL}/${response.data.data.collection_image_path}/${response.data.data.collection.image}`
                                : `${backendBaseURL}/${response.data.data.default_image_path}`,
                            coverImage: response.data.data.collection
                                .cover_image
                                ? `${backendBaseURL}/${response.data.data.collection_image_path}/${response.data.data.collection.cover_image}`
                                : `${backendBaseURL}/${response.data.data.default_image_path}`,
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

        fetchCollectionProduct();
    }, [collectionId, isReseller]);

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
                ? `${backendBaseURL}/${responseData.product_image_path}/${product.main_image}`
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
                `${data.products?.next_page_url}&collection_id=${collectionId}`,
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
            handleApiError(error, t("failedToLoad"));
        } finally {
            setLoadMoreLoading(false);
        }
    };

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="col-span-1 xl:col-span-12">
                        <div className="bg-white p-4 rounded-md">
                            {loading ? (
                                <>
                                    <CollectionSkeleton />
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
                                    {collection && (
                                        <div className="w-full relative h-[200px] lg:h-[300px] group mb-4 rounded-md overflow-hidden">
                                            <div className="w-full h-full bg-gray-100 rounded-md overflow-hidden">
                                                <Image
                                                    src={collection.coverImage}
                                                    alt={collection.title}
                                                    className="w-full h-full object-cover"
                                                    width={1470}
                                                    height={300}
                                                />

                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t h-full from-black/80 via-black/10 to-transparent">
                                                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white ">
                                                        <h3 className=" text-2xl md:text-3xl font-medium truncate text-white">
                                                            {collection.title}
                                                        </h3>
                                                        <p
                                                            dangerouslySetInnerHTML={{
                                                                __html: collection.description,
                                                            }}
                                                        ></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                        {products.length === 0 ? (
                                            <div className="col-span-full text-center py-10">
                                                <p>{t("noProductsFound")}</p>{" "}
                                                {/* Translated */}
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
                                                            <span className="absolute top-[8px] right-[8px] text-xs bg-red-500 text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                                {
                                                                    product.discount
                                                                }{" "}
                                                                {t("off")}{" "}
                                                                {/* Translated */}
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
                                    {loadMoreLoading && (
                                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                            {Array.from({ length: 6 }).map(
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
                                                title={t("loadMore")}
                                                variant="primary"
                                                size="md"
                                                className="!px-8"
                                                onClick={handleLoadMoreProducts}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function CollectionProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CollectionProduct />
        </Suspense>
    );
}
