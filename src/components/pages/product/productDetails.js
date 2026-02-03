"use client";
import { Fragment, Suspense, useCallback } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    Dialog,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
} from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import {
    FacebookIcon,
    XIcon,
    WhatsappIcon,
    LinkedinIcon,
} from "@/components/icons/CustomIcons";
import {
    HeartIcon,
    StarIcon,
    PlusIcon,
    MinusIcon,
    CheckIcon,
    ClipboardIcon,
} from "@heroicons/react/24/outline";
import {
    StarIcon as SolidStarIcon,
    HeartIcon as SolidHeartIcon,
} from "@heroicons/react/24/solid";
import Button from "@/components/utility/Button";
import {
    productDetailsGetAPI,
    productReviewAPI,
    addWishlistAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";

import chatUserThree from "@public/images/user/chatUserThree.png";
import ProductZoomImage from "./productDetails/ProductZoomImage";
import ProductThumbnails from "./productDetails/ProductThumbnails";
import VerticalProductGallery from "./productDetails/VerticalSlider";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const ProductImageSkeleton = () => (
    <div className="border rounded-lg overflow-hidden w-[100%] h-[300px] md:h-[449px] aspect-square bg-gray-200 animate-pulse"></div>
);

const ThumbnailSkeleton = () => (
    <div className="w-16 h-16 md:w-20 md:h-20 border border-gray-300 rounded-md bg-gray-200 animate-pulse"></div>
);

const TextSkeleton = ({ width = "full", height = "h-4" }) => (
    <div
        className={`${width} ${height} bg-gray-200 rounded animate-pulse`}
    ></div>
);

const ButtonSkeleton = () => (
    <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse"></div>
);

const ReviewSkeleton = () => (
    <div className="border-b pb-6">
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <TextSkeleton width="w-32" />
                    <TextSkeleton width="w-20" />
                </div>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"
                        ></div>
                    ))}
                </div>
                <TextSkeleton width="w-full" height="h-3" />
                <TextSkeleton width="w-3/4" height="h-3" />
            </div>
        </div>
    </div>
);

const ProductDetailsSkeleton = () => (
    <section className="sm:pt-8">
        <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
            <div className="bg-white rounded-md p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8">
                    <div className="md:col-span-4">
                        <ProductImageSkeleton />
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {[...Array(4)].map((_, i) => (
                                <ThumbnailSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-12">
                            <div className="lg:col-span-7 space-y-4">
                                <TextSkeleton width="w-3/4" height="h-8" />
                                <TextSkeleton width="w-1/4" height="h-6" />
                                <div className="space-y-2">
                                    <TextSkeleton width="w-1/6" height="h-5" />
                                    <div className="flex gap-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-16 h-10 bg-gray-200 rounded animate-pulse"
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <ButtonSkeleton />
                                    <ButtonSkeleton />
                                </div>
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <TextSkeleton
                                            key={i}
                                            width="w-full"
                                            height="h-4"
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                        <TextSkeleton
                                            width="w-32"
                                            height="h-4"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <TextSkeleton
                                            width="w-12"
                                            height="h-4"
                                        />
                                        <div className="flex gap-3">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-5 mt-8 lg:mt-0 flex flex-col gap-2">
                                <TextSkeleton width="w-24" height="h-6" />
                                <div className="border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="w-[47px] h-[60px] bg-gray-200 animate-pulse rounded-md"></div>
                                    <div className="md:w-[calc(100%-65px)] space-y-2">
                                        <TextSkeleton
                                            width="w-3/4"
                                            height="h-5"
                                        />
                                        <TextSkeleton
                                            width="w-1/3"
                                            height="h-4"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 sm:mt-16 space-y-4">
                    <TextSkeleton width="w-48" height="h-6" />
                    {[...Array(5)].map((_, i) => (
                        <TextSkeleton key={i} width="w-full" height="h-4" />
                    ))}
                </div>
            </div>
        </div>
    </section>
);

function ProductDetails() {
    const [data, setData] = useState(null);
    const [product, setProduct] = useState(null);
    const [recentlyViewedProduct, setRecentlyViewedProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");
    const [showReviews, setShowReviews] = useState(false);
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const [productId, setProductId] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const { incrementCart, decrementCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [showQuantity, setShowQuantity] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);
    const { wishlistItems, updateWishlist } = useWishlist();
    const [isInWishlist, setIsInWishlist] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isAffiliate, setIsAffiliate] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const referCodeFromUrl = searchParams.get("referCode");
    const [storedReferCode, setStoredReferCode] = useState("");
    const [hasAddedToCart, setHasAddedToCart] = useState(false);

    useEffect(() => {
        const referCode = localStorage.getItem("product_refer_code");
        if (referCode) {
            setStoredReferCode(referCode);
        }
    }, []);

    useEffect(() => {
        if (referCodeFromUrl) {
            console.log("Referral code from URL:", referCodeFromUrl);
            // Store the referral code for use in checkout
            localStorage.setItem("product_refer_code", referCodeFromUrl);
        }
    }, [referCodeFromUrl]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        // const fetchUserProfile = async () => {
        //     if (!isLoggedIn) return;

        //     try {
        //         // const response = await profiledGetAPI();
        //         // setUserProfile(response.data.data);
        //     } catch (error) {
        //         console.error("Failed to fetch user profile:", error);
        //     }
        // };

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (userInfo) {
            setIsAffiliate(userInfo?.affiliate_status);
            setReferralCode(userInfo?.referral_code || "");
        }

        // fetchUserProfile();
    }, [isLoggedIn]);

    const getReferralLink = () => {
        if (!isAffiliate || !referralCode || !productId) return null;

        return `${window.location.origin}/product/details?id=${productId}&referCode=${referralCode}`;
    };

    const copyReferralLink = () => {
        const referralLink = getReferralLink();
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            toast.success("Referral link copied to clipboard!");
        }
    };

    useEffect(() => {
        if (idParam) {
            setProductId(parseInt(idParam));
        }
    }, [idParam]);

    useEffect(() => {
        if (productId) {
            const isInWishlist = wishlistItems.some(
                (item) => item.id === productId,
            );
            setIsInWishlist(isInWishlist);
        }
    }, [productId, wishlistItems]);

    const saveToLocalStorage = useCallback(
        (product, quantity) => {
            if (!data) return;

            const savedCart = localStorage.getItem("productDetailsCart");
            let cartItems = savedCart ? JSON.parse(savedCart) : [];

            const referCode =
                referCodeFromUrl || localStorage.getItem("product_refer_code");

            // Create a unique identifier that includes product ID, color, and size
            const itemUniqueId = `${product.id}-${selectedColor || "no-color"}-${selectedSize || "no-size"}`;

            const existingIndex = cartItems.findIndex(
                (item) => item.uniqueId === itemUniqueId,
            );

            if (existingIndex >= 0) {
                // Update existing item with same product ID, color, and size
                cartItems[existingIndex].quantity = quantity;
                if (referCode) {
                    cartItems[existingIndex].product_refer_code = referCode;
                }
            } else {
                // Add new item with unique combination
                cartItems.push({
                    id: product.id,
                    uniqueId: itemUniqueId, // Add unique identifier
                    title: product.title,
                    price: product.sale_price || product.list_price,
                    quantity: quantity,
                    image: product.main_image
                        ? `${backendBaseURL}/${data.main_image_path}/${product.main_image}`
                        : `${backendBaseURL}/${data.default_image_path}`,
                    base_curr_symbol: data.base_curr_symbol,
                    product_refer_code: referCode || "",
                    color: selectedColor || null,
                    size: selectedSize || null,
                    source: "productDetails",
                });
            }

            cartItems = cartItems.filter((item) => item.quantity > 0);
            localStorage.setItem(
                "productDetailsCart",
                JSON.stringify(cartItems),
            );

            console.log("Saved cart items:", cartItems);
        },
        [data, referCodeFromUrl, selectedColor, selectedSize],
    );

    useEffect(() => {
        if (!data?.product) return;

        const savedCart = localStorage.getItem("productDetailsCart");
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            // Check if current product with current color/size is in cart
            const currentUniqueId = `${data.product.id}-${selectedColor || "no-color"}-${selectedSize || "no-size"}`;
            const cartItem = parsedCart.find(
                (item) => item.uniqueId === currentUniqueId,
            );

            if (cartItem) {
                setShowQuantity(true);
                setQuantity(cartItem.quantity);
            } else {
                setShowQuantity(false);
                setQuantity(1);
            }
        }
    }, [data, selectedColor, selectedSize]);

    const handleAddToCart = () => {
        if (!showQuantity) {
            setShowQuantity(true);
            incrementCart();
            saveToLocalStorage(product, 1);
        }
    };

    // product fetch
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId) return;
            try {
                setLoading(true);
                const response = await productDetailsGetAPI(productId);
                if (response.data.data && response.data.data.product) {
                    setData(response.data.data);
                    setProduct(response.data.data.product);
                    setRecentlyViewedProduct(
                        response.data.data.recently_viewed_products,
                    );
                    console.log(response.data.data.product);
                } else {
                    toast.error(response?.data?.message?.error?.[0]);
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        setIsLoggedIn(!!token);

        const sellerToken = localStorage.getItem("jwtSellerToken");
        setIsSellerLoggedIn(!!sellerToken);
    }, []);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isLoggedIn && !isSellerLoggedIn) {
            sessionStorage.setItem(
                "redirectAfterLogin",
                window.location.pathname + window.location.search,
            );
            window.location.href = "/user/auth/login";
            return;
        }
        const localUrl = `/product/details?id=${product.id}`;
        localStorage.setItem("intendedUrl", localUrl);
        try {
            setReviewLoading(true);
            const response = await productReviewAPI(productId, rating, review);
            if (response.data.message?.success) {
                toast.success(response.data.message.success[0]);
                const newReview = {
                    id: reviews.length + 1,
                    name: "You",
                    avatar: chatUserThree,
                    rating,
                    comment: review,
                    date: new Date().toISOString().split("T")[0],
                };
                const updatedReviews = [...reviews, newReview];
                setReviews(updatedReviews);

                localStorage.setItem(
                    `product_reviews_${productId}`,
                    JSON.stringify(updatedReviews),
                );

                setRating(0);
                setReview("");
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setReviewLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            const savedReviews = localStorage.getItem(
                `product_reviews_${productId}`,
            );
            if (savedReviews) {
                try {
                    const parsedReviews = JSON.parse(savedReviews);
                    setReviews(parsedReviews);
                } catch (error) {
                    console.error("Error parsing saved reviews:", error);
                    setReviews([]);
                }
            }
        }
    }, [productId]);

    const currencySymbol = data?.base_curr_symbol || "৳";

    const toggleReviews = () => {
        setShowReviews(!showReviews);
    };

    const handleWishlist = async (e) => {
        if (!isLoggedIn && !isSellerLoggedIn) {
            e.preventDefault();
            sessionStorage.setItem(
                "redirectAfterLogin",
                window.location.pathname + window.location.search,
            );
            window.location.href = "/user/auth/login";
        }
        const localUrl = `/product/details?id=${product.id}`;
        localStorage.setItem("intendedUrl", localUrl);
        try {
            const response = await addWishlistAPI(productId);
            if (response.data.message?.success) {
                toast.success(response.data.message.success[0]);

                let newWishlist;
                if (isInWishlist) {
                    newWishlist = wishlistItems.filter(
                        (item) => item.id !== productId,
                    );
                } else {
                    newWishlist = [
                        ...wishlistItems,
                        {
                            id: product.id,
                            title: product.title,
                            price: product.sale_price || product.list_price,
                            image: product.main_image
                                ? `${backendBaseURL}/${data.main_image_path}/${product.main_image}`
                                : `${backendBaseURL}/${data.default_image_path}`,
                            base_curr_symbol: data.base_curr_symbol,
                        },
                    ];
                }

                updateWishlist(newWishlist);
                setIsInWishlist(!isInWishlist);
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        }
    };

    const handleThumbnailClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size === selectedSize ? null : size);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color === selectedColor ? null : color);
    };

    if (loading) {
        return <ProductDetailsSkeleton />;
    }

    if (!product) {
        return <div className="text-center py-10">Product not found</div>;
    }

    const productData = {
        id: product.id,
        title: product.title,
        description: product.description,
        category:
            product.category_item?.map((cat) => cat.title).join(", ") ||
            "Uncategorized",
        stock: product.product_quantity,
        sku: product.product_sku,
        newPrice: product.sale_price
            ? `${currencySymbol}${parseFloat(product.sale_price).toFixed(2)}`
            : `${currencySymbol}0.00`,
        oldPrice: product.list_price
            ? `${currencySymbol}${parseFloat(product.list_price).toFixed(2)}`
            : null,
        image: product.main_image
            ? `${backendBaseURL}/${data.main_image_path}/${product.main_image}`
            : `${backendBaseURL}/${data.default_image_path}`,
        thumbnails: [
            product.image_1
                ? `${backendBaseURL}/${data.images_path}/${product.image_1}`
                : null,
            product.image_2
                ? `${backendBaseURL}/${data.images_path}/${product.image_2}`
                : null,
            product.image_3
                ? `${backendBaseURL}/${data.images_path}/${product.image_3}`
                : null,
            product.image_4
                ? `${backendBaseURL}/${data.images_path}/${product.image_4}`
                : null,
            product.image_5
                ? `${backendBaseURL}/${data.images_path}/${product.image_5}`
                : null,
            product.image_6
                ? `${backendBaseURL}/${data.images_path}/${product.image_6}`
                : null,
            product.image_7
                ? `${backendBaseURL}/${data.images_path}/${product.image_7}`
                : null,
        ].filter(Boolean),
        sizes:
            product.variant_items.find((v) => v.title === "Size")?.values || [],
        colors:
            product.variant_items.find((v) => v.title === "Color")?.values ||
            [],
        features: product.features,
        variants: product.variant_items,
        warranty_status: product.warranty_status,
        warranty_days: product.warranty_days,
        tab_description: product.tab_description,
    };

    const isOutOfStock = productData?.stock === 0;

    const recentlyViewedProductsData = data.recently_viewed_products.map(
        (product) => ({
            id: product.id,
            title: product.title,
            newPrice: product.product_prices?.sale_price
                ? `${currencySymbol}${parseFloat(product.product_prices.sale_price).toFixed(2)}`
                : `${currencySymbol}0.00`,
            oldPrice: product.product_prices?.list_price
                ? `${currencySymbol}${parseFloat(product.product_prices.list_price).toFixed(2)}`
                : null,
            image: product.main_image
                ? `${backendBaseURL}/${data.main_image_path}/${product.main_image}`
                : `${backendBaseURL}/${data.default_image_path}`,
        }),
    );

    const getShareUrls = (product) => {
        const currentUrl =
            typeof window !== "undefined" ? window.location.href : "";
        const productTitle = product?.title || "";
        const productImage = product?.image || "";

        return {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(productTitle)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(`${productTitle} - ${currentUrl}`)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(productImage)}&description=${encodeURIComponent(productTitle)}`,
            linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(productTitle)}`,
        };
    };

    const handleCheckoutClick = (e) => {
        if (!showQuantity) {
            setShowQuantity(true);
            setHasAddedToCart(true);
            incrementCart();
            saveToLocalStorage(product, 1);
        }
        if (!isLoggedIn && !isSellerLoggedIn) {
            e.preventDefault();
            const storedReferCode = localStorage.getItem("product_refer_code");
            sessionStorage.setItem(
                "redirectAfterLogin",
                storedReferCode
                    ? "/checkout"
                    : `/checkout?referCode=${storedReferCode}`,
            );
            window.location.href = "/user/auth/login";
        }
        const localUrl = storedReferCode
            ? "/checkout"
            : `/checkout?referCode=${storedReferCode}`;
        localStorage.setItem("intendedUrl", localUrl);
    };

    return (
        <section className="sm:pt-8">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white rounded-md p-6 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8">
                        <div className="md:col-span-6">
                            <div>
                                <div className="flex gap-2">
                                    <div className="hidden lg:block">
                                        <VerticalProductGallery
                                            productData={productData}
                                            selectedImage={selectedImage}
                                            handleThumbnailClick={
                                                handleThumbnailClick
                                            }
                                        />
                                    </div>
                                    <div className="relative  rounded-lg overflow-hidden h-full aspect-square">
                                        <ProductZoomImage
                                            selectedImage={selectedImage}
                                            productData={productData}
                                        />
                                    </div>
                                </div>
                                {/* {[productData.image, ...productData.thumbnails]
                                    .length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                                        {[
                                            productData.image,
                                            ...productData.thumbnails,
                                        ].map((thumb, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-16 h-16 md:w-20 md:h-20 border rounded-md cursor-pointer ${
                                                    (selectedImage ||
                                                        productData.image) ===
                                                    thumb
                                                        ? "border-2 border-primary__color"
                                                        : "border-gray-300"
                                                }`}
                                                onClick={() =>
                                                    handleThumbnailClick(thumb)
                                                }
                                            >
                                                <Image
                                                    src={thumb}
                                                    alt={`${productData.title} thumbnail ${idx + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full rounded-md object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )} */}

                                <div className="lg:hidden">
                                    <ProductThumbnails
                                        productData={productData}
                                        selectedImage={selectedImage}
                                        handleThumbnailClick={
                                            handleThumbnailClick
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-6">
                            <div className="grid grid-cols-1 lg:grid-cols-7 gap-0 sm:gap-12">
                                <div className="lg:col-span-7">
                                    <div className="flex items-start md:items-center gap-2 flex-col-reverse md:flex-row">
                                        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
                                            {productData.title}{" "}
                                        </h1>
                                        <span className="text-green-500  bg-green-50 px-3 border-green-300 text-xs border py-1 rounded-full font-medium">
                                            {isOutOfStock
                                                ? "Out of Stock"
                                                : "In Stock"}
                                        </span>
                                    </div>
                                    <div className="text-primary__color text-lg md:text-2xl font-bold mb-2">
                                        {productData.newPrice}{" "}
                                        {productData.oldPrice && (
                                            <span className="line-through text-gray-400 text-sm md:text-base font-medium ml-2">
                                                {productData.oldPrice}
                                            </span>
                                        )}
                                    </div>
                                    {productData.sizes.length > 0 && (
                                        <div className="mb-4">
                                            <p className="font-semibold mb-2">
                                                SIZE
                                            </p>
                                            <div className="flex gap-2">
                                                {productData.sizes.map(
                                                    (size) => (
                                                        <button
                                                            key={size}
                                                            onClick={() =>
                                                                handleSizeSelect(
                                                                    size,
                                                                )
                                                            }
                                                            className={`relative px-4 py-2 w-[60px] h-[40px] border rounded-full font-semibold transition-all ${
                                                                selectedSize ===
                                                                size
                                                                    ? "bg-primary__color text-white border-primary__color"
                                                                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {size}
                                                            {/* {selectedSize ===
                                                                size && (
                                                                <CheckIcon className="w-4 h-4 absolute -top-1 -right-1 bg-white text-primary__color rounded-full" />
                                                            )} */}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {productData.colors.length > 0 && (
                                        <div className="mb-4">
                                            <p className="font-semibold mb-2">
                                                COLOR
                                            </p>
                                            <div className="flex gap-2">
                                                {productData.colors.map(
                                                    (color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() =>
                                                                handleColorSelect(
                                                                    color,
                                                                )
                                                            }
                                                            className={`relative px-4 py-2 border rounded-full font-semibold transition-all ${
                                                                selectedColor ===
                                                                color
                                                                    ? "bg-primary__color text-white border-primary__color"
                                                                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {color}
                                                            {selectedColor ===
                                                                color && (
                                                                <CheckIcon className="w-4 h-4 absolute -top-1 -right-1 bg-white text-primary__color rounded-full" />
                                                            )}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        {isOutOfStock ? (
                                            <div className="w-full">
                                                <div className="bg-gray-100 rounded-md py-3 px-4 text-center">
                                                    <span className="font-semibold">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                                <div>
                                                    <Button
                                                        title="Add to cart"
                                                        variant="primary"
                                                        size="md"
                                                        className="w-full !bg-[#f5f5f5] !text-color__heading !rounded-full"
                                                        onClick={
                                                            handleAddToCart
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center  gap-2">
                                                    <Button
                                                        href={
                                                            referralCode
                                                                ? "/checkout"
                                                                : `/checkout?referCode=${storedReferCode}`
                                                        }
                                                        onClick={
                                                            handleCheckoutClick
                                                        }
                                                        title="Buy Now"
                                                        variant="primary"
                                                        size="md"
                                                        className="w-full !rounded-full "
                                                    />
                                                    <div
                                                        onClick={handleWishlist}
                                                        className={`${isInWishlist ? "border-primary__color" : "bg-white"} w-[60px] h-full border  border-gray-300 rounded-full flex items-center justify-center cursor-pointer`}
                                                    >
                                                        <button>
                                                            {isInWishlist ? (
                                                                <SolidHeartIcon className="w-5 h-5 text-primary__color " />
                                                            ) : (
                                                                <HeartIcon className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid bg-gray-100 rounded-md p-3 grid-cols-1 gap-2 text-sm md:text-base text-gray-600 border-l-[5px] border-primary__color pl-3">
                                        <p>
                                            <strong>Category:</strong>{" "}
                                            <span className="font-medium">
                                                {productData.category}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Stock:</strong>{" "}
                                            <span className="font-medium">
                                                {productData.stock}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>SKU:</strong>{" "}
                                            <span className="font-medium">
                                                {productData.sku}
                                            </span>
                                        </p>
                                        {productData.warranty_status && (
                                            <p>
                                                <strong>Warranty:</strong>{" "}
                                                <span className="font-medium">
                                                    {parseInt(
                                                        productData.warranty_days,
                                                    )}{" "}
                                                    days
                                                </span>
                                            </p>
                                        )}
                                        {isAffiliate && referralCode && (
                                            <div className="flex gap-2">
                                                <strong>Referral Link:</strong>{" "}
                                                <div className="flex items-center gap-2">
                                                    {/* <Link href={getReferralLink()} className="text-primary__color text-sm font-medium underline">Share</Link> */}
                                                    <button
                                                        onClick={() =>
                                                            setIsReferralModalOpen(
                                                                true,
                                                            )
                                                        }
                                                        className="text-primary__color font-medium underline"
                                                    >
                                                        Share
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-3 md:gap-0">
                                        <div className="flex items-center gap-4 text-gray-600">
                                            <span className="text-sm md:text-base font-semibold">
                                                Share:
                                            </span>
                                            <ul className="flex gap-3">
                                                <li className="">
                                                    <Link
                                                        href={
                                                            getShareUrls(
                                                                productData,
                                                            ).facebook
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-primary__color"
                                                        aria-label="Share on Facebook"
                                                    >
                                                        <FacebookIcon className="w-5 h-5" />
                                                    </Link>
                                                </li>
                                                <li className="">
                                                    <Link
                                                        href={
                                                            getShareUrls(
                                                                productData,
                                                            ).twitter
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-primary__color"
                                                        aria-label="Share on Twitter"
                                                    >
                                                        <XIcon className="w-5 h-5" />
                                                    </Link>
                                                </li>
                                                <li className="">
                                                    <Link
                                                        href={
                                                            getShareUrls(
                                                                productData,
                                                            ).whatsapp
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-primary__color"
                                                        aria-label="Share on WhatsApp"
                                                    >
                                                        <WhatsappIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                                                    </Link>
                                                </li>
                                                <li className="">
                                                    <Link
                                                        href={
                                                            getShareUrls(
                                                                productData,
                                                            ).linkedin
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-primary__color"
                                                        aria-label="Share on LinkedIn"
                                                    >
                                                        <LinkedinIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 my-6 lg:my-8"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <TabGroup className="lg:col-span-8">
                            <TabList
                                className={"flex items-center gap-0 md:gap-4"}
                            >
                                <Tab
                                    as={Fragment}
                                    className={
                                        "px-2 md:px-4 py-2 text-xs md:text-base font-semibold shrink-0"
                                    }
                                >
                                    {({ hover, selected }) => (
                                        <button
                                            className={` focus:outline-none  ${hover && "text-primary__color"} ${selected && "text-primary__color border-b-2 border-primary__color"}`}
                                        >
                                            Description
                                        </button>
                                    )}
                                </Tab>

                                <Tab
                                    as={Fragment}
                                    className={
                                        "px-2 md:px-4 py-2 text-xs md:text-base font-semibold shrink-0"
                                    }
                                >
                                    {({ hover, selected }) => (
                                        <button
                                            className={` focus:outline-none ${hover && "text-primary__color"} ${selected && "text-primary__color border-b-2 border-primary__color"}`}
                                        >
                                            Details
                                        </button>
                                    )}
                                </Tab>

                                <Tab
                                    as={Fragment}
                                    className={
                                        "px-2 md:px-4 py-2 text-xs md:text-base font-semibold shrink-0"
                                    }
                                >
                                    {({ hover, selected }) => (
                                        <button
                                            className={` focus:outline-none ${hover && "text-primary__color"} ${selected && "text-primary__color border-b-2 border-primary__color"}`}
                                        >
                                            Customer Review
                                        </button>
                                    )}
                                </Tab>
                            </TabList>
                            <TabPanels>
                                {/* tab 1 product details */}
                                <TabPanel>
                                    <div className="mt-6 lg:mt-12">
                                        <h5 className="mb-3">
                                            Product Description
                                        </h5>
                                        <div className="overflow-x-auto">
                                            <p
                                                className="text-color__heading text-sm md:text-base font-medium leading-[28px]"
                                                dangerouslySetInnerHTML={{
                                                    __html: productData.description,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </TabPanel>
                                {/* tab 2 product description */}
                                <TabPanel>
                                    <div className="mt-6 lg:mt-12 ">
                                        <h5 className="mb-3">
                                            Product Details
                                        </h5>
                                        <div className="overflow-x-auto">
                                            <p
                                                className="text-color__heading text-sm md:text-base font-medium leading-[28px]"
                                                dangerouslySetInnerHTML={{
                                                    __html: productData.tab_description,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </TabPanel>
                                {/* tab 3 customer review */}
                                <TabPanel>
                                    <div className="mt-6 lg:mt-12">
                                        <h3 className="text-lg md:text-xl font-bold mb-6">
                                            Customer Reviews
                                        </h3>
                                        <div className="space-y-6 mb-8">
                                            {reviews.length > 0 ? (
                                                reviews.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="border-b pb-6 last:border-0"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                                                <Image
                                                                    src={
                                                                        item.avatar
                                                                    }
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h6 className="font-semibold">
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </h6>
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            {[
                                                                                ...Array(
                                                                                    5,
                                                                                ),
                                                                            ].map(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) =>
                                                                                    i <
                                                                                    div >
                                                                                    item.rating ? (
                                                                                        <SolidStarIcon
                                                                                            key={
                                                                                                i
                                                                                            }
                                                                                            className="w-4 h-4 text-yellow-500"
                                                                                        />
                                                                                    ) : (
                                                                                        <StarIcon
                                                                                            key={
                                                                                                i
                                                                                            }
                                                                                            className="w-4 h-4 text-yellow-500"
                                                                                        />
                                                                                    ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-500">
                                                                        {
                                                                            item.date
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p className="mt-2 text-gray-700">
                                                                    {
                                                                        item.comment
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="py-4">
                                                    No reviews yet. Be the first
                                                    to review this product!
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:bg-gray-50 sm:p-6 rounded-lg">
                                            <h4 className="text-lg font-semibold mb-4">
                                                Write a Review
                                            </h4>
                                            <form onSubmit={handleSubmitReview}>
                                                <div className="mb-4">
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map(
                                                            (_, i) => {
                                                                const ratingValue =
                                                                    i + 1;
                                                                return (
                                                                    <button
                                                                        type="button"
                                                                        key={i}
                                                                        className="focus:outline-none"
                                                                        onClick={() =>
                                                                            setRating(
                                                                                ratingValue,
                                                                            )
                                                                        }
                                                                        onMouseEnter={() =>
                                                                            setHover(
                                                                                ratingValue,
                                                                            )
                                                                        }
                                                                        onMouseLeave={() =>
                                                                            setHover(
                                                                                0,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            reviewLoading
                                                                        }
                                                                    >
                                                                        {ratingValue <=
                                                                        (hover ||
                                                                            rating) ? (
                                                                            <SolidStarIcon className="w-6 h-6 text-yellow-500" />
                                                                        ) : (
                                                                            <StarIcon className="w-6 h-6 text-yellow-500" />
                                                                        )}
                                                                    </button>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <label
                                                        htmlFor="review"
                                                        className="block text-sm font-medium text-gray-700 mb-2"
                                                    >
                                                        Your Review
                                                    </label>
                                                    <textarea
                                                        id="review"
                                                        rows="4"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary__color focus:border-transparent"
                                                        placeholder="Share your thoughts about this product..."
                                                        value={review}
                                                        onChange={(e) =>
                                                            setReview(
                                                                e.target.value,
                                                            )
                                                        }
                                                        disabled={reviewLoading}
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="px-5 py-2 bg-primary__color text-white font-semibold rounded-md hover:bg-opacity-90 transition"
                                                    disabled={reviewLoading}
                                                >
                                                    {reviewLoading
                                                        ? "Submitting..."
                                                        : "Submit Review"}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        </TabGroup>
                        <div className="border-b border-gray-200 my-6 lg:my-8 lg:hidden"></div>
                        <div className="lg:col-span-4 ">
                            <h6 className="border-b-4 pb-2 mb-3 inline-flex justify-center">
                                Recent View
                            </h6>
                            <div className="max-h-[600px] overflow-y-auto pr-4 divide-y">
                                {recentlyViewedProductsData.length > 0 ? (
                                    recentlyViewedProductsData.map(
                                        (product, index) => (
                                            <Link
                                                href={`/product/details?id=${product.id}`}
                                                key={index}
                                                className="  bg-gray-100 p-4 flex  md:items-center gap-4 "
                                            >
                                                <div className="w-[60px] h-[60px] aspect-square">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.title}
                                                        width={47}
                                                        height={60}
                                                        className="w-full h-full object-cover shadow-sm border rounded-md"
                                                    />
                                                </div>
                                                <div className="md:w-[calc(100%-65px)]">
                                                    <h6 className="text-base font-medium mb-1">
                                                        {product.title}
                                                    </h6>
                                                    <div className="text-color__heading text-sm font-semibold mb-2">
                                                        {product.newPrice}{" "}
                                                        {product.oldPrice && (
                                                            <span className="line-through text-gray-400 text-sm font-medium ml-2">
                                                                {
                                                                    product.oldPrice
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ),
                                    )
                                ) : (
                                    <p className="text-gray-500">
                                        No recently viewed products
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                open={isReferralModalOpen}
                onClose={() => setIsReferralModalOpen(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto w-[700px] rounded bg-white p-6">
                        <Dialog.Title className="text-lg font-bold mb-4">
                            Share Referral Link
                        </Dialog.Title>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Share this link with your friends to earn
                                commissions:
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={getReferralLink() || ""}
                                    readOnly
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                />
                                <button
                                    onClick={copyReferralLink}
                                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                                    title="Copy to clipboard"
                                >
                                    <ClipboardIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Share via:
                            </p>
                            <div className="flex gap-3">
                                <Link
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getReferralLink())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    <FacebookIcon className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getReferralLink())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    <XIcon className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={`https://wa.me/?text=${encodeURIComponent(getReferralLink())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    <WhatsappIcon className="w-5 h-5" />
                                </Link>
                                <Link
                                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(getReferralLink())}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    <LinkedinIcon className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsReferralModalOpen(false)}
                                className="px-4 py-2 bg-primary__color text-white rounded hover:bg-opacity-90"
                            >
                                Close
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </section>
    );
}

export default function ProductDetailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductDetails />
        </Suspense>
    );
}
