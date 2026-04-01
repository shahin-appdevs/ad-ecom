"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import ProductSidebar from "@/components/partials/ProductSidebar";
import {
    childCategoryGetAPI,
    productGetAPI,
    childSubCategoryGetAPI,
    nextPageGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";
import { Menu } from "@headlessui/react";

import { ChevronRightIcon } from "@heroicons/react/24/outline";

import { useTranslations } from "next-intl";

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

function SubCategoryProduct() {
    const t = useTranslations("Category.subCategory");

    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const categoryId = searchParams.get("category-id");
    const childCategoryId = searchParams.get("child-id");
    const [childSubCategoryId, setSubChildCategoryId] = useState(null);
    const [childSubCategories, setChildSubCategories] = useState([]);
    const [currentSubCategory, setCurrentSubCategory] = useState(null);
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
                console.error("Failed to fetch user profile:", error);
            }
        };

        fetchUserProfile();
    }, [isLoggedIn]);

    useEffect(() => {
        if (idParam) {
            setSubChildCategoryId(parseInt(idParam));
        }
    }, [idParam]);

    const formatPrice = (price) => {
        if (!price) return "৳0.00";
        const numericValue =
            typeof price === "string" ? parseFloat(price) : price;
        return `৳${numericValue.toFixed(2)}`;
    };

    useEffect(() => {
        const fetchSubCategories = async () => {
            try {
                if (!categoryId) return;
                const response = await childCategoryGetAPI(categoryId);
                if (response?.data?.data?.all_child_categories) {
                    if (childCategoryId) {
                        const foundCategory =
                            response.data.data.all_child_categories.find(
                                (cat) => cat.id === parseInt(childCategoryId),
                            );
                        if (foundCategory) {
                            setCurrentSubCategory(foundCategory);
                        }
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            }
        };

        fetchSubCategories();
    }, [childCategoryId]);

    useEffect(() => {
        const fetchCategoryProduct = async () => {
            if (!categoryId) return;
            try {
                setLoading(true);
                const response = await productGetAPI(
                    categoryId,
                    childCategoryId,
                );
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

                    setProducts(formattedProducts);
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProduct();
    }, [categoryId, childCategoryId, childSubCategoryId]);

    useEffect(() => {
        const fetchChildSubCategories = async () => {
            try {
                if (!childCategoryId) return;
                const response = await childSubCategoryGetAPI(childCategoryId);

                if (response?.data?.data?.all_child_sub_categories) {
                    setChildSubCategories(
                        response.data.data.all_child_sub_categories,
                    );
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            }
        };

        fetchChildSubCategories();
    }, [childCategoryId]);

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
                `${data.products?.next_page_url}&category_id=${categoryId}&child_category_id=${childCategoryId}`,
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

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="hidden sm:block p-2.5 xl:p-0 col-span-1 xl:col-span-2 bg-white rounded-md  relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            {loading && (
                                <div className="border-b  mb-4">
                                    <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
                                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            )}

                            {!loading && currentSubCategory && (
                                <div className="border-b mb-4 pb-4 flex items-center gap-2 flex-wrap md:flex-nowrap">
                                    <div className="flex  items-center gap-2 ">
                                        <h5 className="text-sm md:text-base flex items-center gap-2">
                                            <Link
                                                href={`/categories/products?id=${currentSubCategory.category.id}`}
                                                className="text-primary__color"
                                            >
                                                {
                                                    currentSubCategory.category
                                                        .title
                                                }
                                            </Link>

                                            <ChevronRightIcon className="w-[18px] h-[18px] rtl:rotate-180" />
                                            <span className="">
                                                {currentSubCategory.title}
                                            </span>
                                        </h5>
                                    </div>
                                    {childSubCategories?.length > 0 && (
                                        <ChevronRightIcon className="w-[18px] h-[18px] rtl:rotate-180" />
                                    )}
                                    <ul className="flex items-center gap-4">
                                        {childSubCategories?.length > 0 && (
                                            <li>
                                                <Menu
                                                    as="div"
                                                    className="relative inline-block text-left"
                                                >
                                                    <Menu.Button className="flex text-sm md:text-base items-center gap-2 bg-white border py-1 text-primary__color px-4 rounded-2xl  font-medium">
                                                        {t("moreCategories")}{" "}
                                                        {/* Translated */}
                                                        <ChevronRightIcon className="w-[18px] h-[18px] rtl:rotate-180" />
                                                    </Menu.Button>

                                                    <Menu.Items className="absolute p-2 left-0 mt-2 min-w-[240px] rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                                                        {childSubCategories.map(
                                                            (subChild) => (
                                                                <Menu.Item
                                                                    key={
                                                                        subChild.id
                                                                    }
                                                                >
                                                                    {({
                                                                        active,
                                                                    }) => (
                                                                        <Link
                                                                            href={`/child-sub-categories/products?category-id=${categoryId}&child-id=${currentSubCategory.id}&sub-child-id=${subChild.id}`}
                                                                            className={`block px-4 rounded py-2 text-xs md:text-sm ${
                                                                                active
                                                                                    ? "bg-primary__color text-white"
                                                                                    : "text-gray-700"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                subChild.title
                                                                            }
                                                                        </Link>
                                                                    )}
                                                                </Menu.Item>
                                                            ),
                                                        )}
                                                    </Menu.Items>
                                                </Menu>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
                                {loading ? (
                                    <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                                ) : (
                                    <h6>
                                        {currentSubCategory?.title ||
                                            t("products")}{" "}
                                        {/* Translated */}
                                    </h6>
                                )}
                            </div>
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
                                        <p>{t("noProductsFound")}</p>{" "}
                                        {/* Translated */}
                                    </div>
                                ) : (
                                    products.map((product, index) => (
                                        <Link
                                            href={`/product/details?id=${product.id}`}
                                            key={`${product.id}-${index}`}
                                            className="group bg-gray-100 rounded-md hover:shadow-md transition-shadow block"
                                        >
                                            <div className="relative ">
                                                <div className="w-full h-[150px] sm:h-[215px] relative rounded-t-md overflow-hidden">
                                                    <Image
                                                        src={product.image}
                                                        fill
                                                        alt={product.title}
                                                        className="object-cover rounded-t-md group-hover:scale-105 transition-transform duration-200"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                                {product.hasDiscount && (
                                                    <span className="absolute top-[8px] right-[8px] text-xs bg-red-500 text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                        {product.discount}{" "}
                                                        {t("off")}{" "}
                                                        {/* Translated */}
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
                                        title={t("loadMore")}
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

export default function SubCategoryProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SubCategoryProduct />
        </Suspense>
    );
}
