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
    categoryGetAPI,
    productGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import getImageUrl from "@/components/utility/getImageUrl";
import { Menu } from "@headlessui/react";
import { ChevronRight } from "lucide-react";

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
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { incrementCart, decrementCart } = useCart();
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const [categoryId, setCategoryId] = useState(null);
    const [childCategoryId, setChildCategoryId] = useState(null);
    const [childSubCategoryId, setSubChildCategoryId] = useState(null);
    const [states, setStates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
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
            setCategoryId(parseInt(idParam));
            setChildCategoryId(parseInt(idParam));
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

            const savedCart = localStorage.getItem("categoryCart");
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
            localStorage.setItem("categoryCart", JSON.stringify(cartItems));
        },
        [data, isReseller],
    );

    useEffect(() => {
        if (!data?.products?.data) return;

        const savedCart = localStorage.getItem("categoryCart");
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
        const fetchCategories = async () => {
            try {
                const response = await categoryGetAPI();
                if (response?.data?.data?.all_categories) {
                    setCategories(response.data.data.all_categories);
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
                                                <ChevronRight size={18} />
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
                                                Sub Categories
                                                <ChevronRight size={16} />
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
                                        {currentCategory?.title || "Products"}
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
                                                        {product.discount} off
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

export default function CategoryProductPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CategoryProduct />
        </Suspense>
    );
}
