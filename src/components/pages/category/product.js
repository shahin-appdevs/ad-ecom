"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import ProductSidebar from "@/components/partials/ProductSidebar";
import {
    categoryGetAPI,
    productGetAPI,
    nextPageGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";
import { Menu } from "@headlessui/react";
import { useTranslations } from "next-intl";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { getBaseCurrency } from "@/components/utility/getBaseCurrency";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const ProductSkeleton = () => (
    <div className="bg-gray-100 rounded-md animate-pulse">
        <div className="relative">
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

function CategoryProduct() {
    const t = useTranslations("Category.category"); // ← Added: category namespace

    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const [categoryId, setCategoryId] = useState(null);
    const [childCategoryId, setChildCategoryId] = useState(null);
    const [childSubCategoryId, setSubChildCategoryId] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);
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
            setCategoryId(parseInt(idParam));
            setChildCategoryId(parseInt(idParam));
            setSubChildCategoryId(parseInt(idParam));
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
        const fetchCategories = async () => {
            try {
                const response = await categoryGetAPI();
                if (response?.data?.data?.all_categories) {
                    if (idParam) {
                        const foundCategory =
                            response.data.data.all_categories.find(
                                (cat) => cat.id === parseInt(idParam),
                            );
                        if (foundCategory) {
                            setCurrentCategory(foundCategory);
                        }
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            }
        };

        fetchCategories();
    }, [idParam]);

    useEffect(() => {
        const fetchCategoryProduct = async () => {
            if (!categoryId) return;
            try {
                setLoading(true);
                const response = await productGetAPI(categoryId);

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
                `${data.products?.next_page_url}&category_id=${categoryId}`,
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
                    <div className="hidden sm:block col-span-1 xl:col-span-2 bg-white rounded-md  p-2.5  xl:p-0  relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            {loading && (
                                <div className="border-b pb-4 mb-4">
                                    <div className="flex items-center justify-between gap-3 sm:gap-0 ">
                                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            )}
                            {!loading && currentCategory && (
                                <div className="border-b pb-4 mb-4 flex items-center gap-2">
                                    <div className="flex items-center justify-between ">
                                        <h5 className="flex items-center gap-2 text-sm md:text-base">
                                            <span className=" ">
                                                {currentCategory.title}
                                            </span>
                                            {currentCategory.child_categories
                                                ?.length > 0 && (
                                                <ChevronRightIcon className="rtl:rotate-180 w-[16px] h-[16px]" />
                                            )}
                                        </h5>
                                    </div>

                                    {currentCategory.child_categories?.length >
                                        0 && (
                                        <Menu
                                            as="div"
                                            className="relative inline-block text-left"
                                        >
                                            {/* Button */}
                                            <Menu.Button className="flex items-center gap-2 text-sm md:text-base bg-white text-primary__color border py-1 px-4 rounded-2xl font-normal">
                                                {t("subCategories")}{" "}
                                                {/* ← Translated */}
                                                <ChevronRightIcon className="rtl:-rotate-180 w-[16px] h-[16px]" />
                                            </Menu.Button>

                                            {/* Dropdown */}
                                            <Menu.Items className="absolute left-0 mt-2 p-2 min-w-[220px] rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                                                {currentCategory.child_categories.map(
                                                    (child) => (
                                                        <Menu.Item
                                                            key={child.id}
                                                            className="rounded"
                                                        >
                                                            {({ active }) => (
                                                                <Link
                                                                    href={`/sub-categories/products?category-id=${idParam}&child-id=${child.id}`}
                                                                    className={`block px-4 py-2 text-xs md:text-sm ${
                                                                        active
                                                                            ? "bg-primary__color text-white"
                                                                            : "text-gray-700"
                                                                    }`}
                                                                >
                                                                    {
                                                                        child.title
                                                                    }
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    ),
                                                )}
                                            </Menu.Items>
                                        </Menu>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
                                {loading ? (
                                    <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                                ) : (
                                    <h6>
                                        {currentCategory?.title ||
                                            t("products")}{" "}
                                        {/* ← Translated fallback */}
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
                                        {/* ← Translated */}
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
                                                        className="object-cover  rounded-t-md group-hover:scale-105 transition-transform duration-200"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                                {product.hasDiscount && (
                                                    <span className="absolute top-[8px] right-[8px] text-xs bg-red-500 text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                        {product.discount}{" "}
                                                        {t("off")}{" "}
                                                        {/* ← Translated */}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-[10px] ">
                                                <h5 className="text-sm md:text-base font-normal text-[#4b5563] mb-2 sm:whitespace-normal truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {product.title}
                                                </h5>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-base md:text-lg font-semibold text-primary__color">
                                                        {formatPrice(
                                                            product.displayPrice,
                                                        )}
                                                    </span>
                                                    {product.hasDiscount && (
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

export default function CategoryProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CategoryProduct />
        </Suspense>
    );
}
