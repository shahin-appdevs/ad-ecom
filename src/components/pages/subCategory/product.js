"use client";
import { Suspense, useCallback } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import ProductSidebar from "@/components/partials/ProductSidebar";
import {
    childCategoryGetAPI,
    productGetAPI,
    childSubCategoryGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const SubCategoriesNavSkeleton = () => (
    <div className="border-b pb-4 mb-4">
        <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
            <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
        </div>
        <ul className="flex items-center gap-4 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
                <li key={i}>
                    <div className="bg-gray-200 h-9 w-24 rounded-[16px] animate-pulse"></div>
                </li>
            ))}
        </ul>
    </div>
);

const ProductSkeleton = () => (
    <div className="bg-[#f1f5f9] rounded-md animate-pulse">
        <div className="relative p-[10px]">
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
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { incrementCart, decrementCart } = useCart();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const categoryId = searchParams.get("category-id");
    const childCategoryId = searchParams.get("child-id");

    // const [categoryId, setCategoryId] = useState(null);
    // const [childCategoryId, setChildCategoryId] = useState(null);
    const [childSubCategoryId, setSubChildCategoryId] = useState(null);
    const [states, setStates] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [childSubCategories, setChildSubCategories] = useState([]);
    const [currentSubCategory, setCurrentSubCategory] = useState(null);
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
            // setCategoryId(parseInt(idParam));
            // setChildCategoryId(parseInt(idParam));
            setSubChildCategoryId(parseInt(idParam));
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

            const savedCart = localStorage.getItem("subCategoryCart");
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
                        ? `${backendBaseURL}/${data.main_image_path}/${product.main_image}`
                        : `${backendBaseURL}/${data.default_image_path}`,
                    base_curr_symbol: data.base_curr_symbol,
                });
            }

            cartItems = cartItems.filter((item) => item.quantity > 0);
            localStorage.setItem("subCategoryCart", JSON.stringify(cartItems));
        },
        [data, isReseller],
    );

    useEffect(() => {
        if (!data?.products?.data) return;

        const savedCart = localStorage.getItem("subCategoryCart");
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
        const fetchSubCategories = async () => {
            try {
                if (!categoryId) return;
                const response = await childCategoryGetAPI(categoryId);
                if (response?.data?.data?.all_child_categories) {
                    setSubCategories(response.data.data.all_child_categories);
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

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="hidden sm:block col-span-1 xl:col-span-2 bg-white rounded-md  relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            {loading && (
                                <div className="border-b pb-4 mb-4">
                                    <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
                                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                    <ul className="flex items-center gap-4 overflow-x-auto pb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <li key={i}>
                                                <div className="bg-gray-200 h-9 w-24 rounded-[16px] animate-pulse"></div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!loading && currentSubCategory && (
                                <div className="border-b pb-4 mb-4">
                                    <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
                                        <h5>
                                            Sub Child Categories of{" "}
                                            <span className="text-primary__color">
                                                {currentSubCategory.title}
                                            </span>
                                        </h5>
                                    </div>
                                    <ul className="flex items-center gap-4 overflow-x-auto pb-2">
                                        <li>
                                            <Link
                                                href={`/categories/products?id=${categoryId}`}
                                                className="bg-[#dcfce7] shadow-md py-[8px] px-[12px] rounded-[16px] text-color__heading font-medium"
                                            >
                                                All
                                            </Link>
                                        </li>
                                        {childSubCategories?.map(
                                            (childSubCategory) => (
                                                <li key={childSubCategory.id}>
                                                    <Link
                                                        href={`/child-sub-categories/products?category-id=${categoryId}&child-id${currentSubCategory.id}&sub-child-id=${childSubCategory.id}`}
                                                        className="bg-white shadow-md py-[8px] px-[12px] rounded-[16px] text-color__heading font-medium"
                                                    >
                                                        {childSubCategory.title}
                                                    </Link>
                                                </li>
                                            ),
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
                                            "Products"}
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
                                        <p>No products found</p>
                                    </div>
                                ) : (
                                    products.map((product, index) => (
                                        <Link
                                            href={`/product/details?id=${product.id}`}
                                            key={`${product.id}-${index}`}
                                            className="bg-[#f1f5f9] rounded-md hover:shadow-md transition-shadow block"
                                        >
                                            <div className="relative p-[10px]">
                                                <div className="w-full h-[150px] sm:h-[215px] relative">
                                                    <Image
                                                        src={product.image}
                                                        fill
                                                        alt={product.title}
                                                        className="object-cover rounded-md"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                                {product.hasDiscount && (
                                                    <span className="absolute top-[8px] right-[8px] text-xs bg-primary__color text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                        {product.discount} off
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-[10px] pt-[5px]">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-base font-semibold text-primary__color">
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
                                                <h5 className="text-sm font-normal text-[#4b5563] mb-2 sm:whitespace-normal truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {product.title}
                                                </h5>
                                                {/* <div className="relative">
                                                    {!states[index]?.showQuantity ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleToggle(index);
                                                            }}
                                                            className="bg-white shadow-sm text-gray-800 text-xs px-4 py-2 rounded-md font-medium flex items-center justify-between w-full"
                                                            disabled={product.stock <= 0}
                                                        >
                                                            <PlusIcon className="h-5 w-5" />
                                                            {product.stock <= 0 ? (
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
                                                                {states[index]?.quantity || 1}
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
                                                                disabled={states[index]?.quantity >= product.stock}
                                                            >
                                                                <PlusIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div> */}
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
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
