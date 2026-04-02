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
import { Link } from "@/i18n/navigation";
// ← adjust path if your setup is different
import {
    FacebookIcon,
    XIcon,
    WhatsappIcon,
    LinkedinIcon,
} from "@/components/icons/CustomIcons";
import {
    HeartIcon,
    StarIcon,
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
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";
import chatUserThree from "@public/images/user/chatUserThree.png";
import ProductZoomImage from "./productDetails/ProductZoomImage";
import ProductThumbnails from "./productDetails/ProductThumbnails";
import VerticalProductGallery from "./productDetails/VerticalSlider";
import { useTranslations } from "next-intl";
import { getBaseCurrency } from "@/components/utility/getBaseCurrency";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const TextSkeleton = ({ width = "full", height = "h-4" }) => (
    <div
        className={`${width} ${height} bg-gray-200 rounded animate-pulse`}
    ></div>
);
const ProductDetailsSkeleton = () => (
    <section className="sm:pt-8">
        <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
            <div className="bg-white rounded-md p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                    {/* LEFT SIDE - Image Section */}
                    <div className="flex flex-col-reverse gap-4  xl:flex-row">
                        {/* Thumbnails - Visible only on xl and above */}
                        <div className="flex xl:flex-col gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                            <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                        </div>

                        {/* Main Image */}
                        <div className="xl:flex-1 h-[250px] md:h-[350px] lg:h-[400px] bg-gray-200 rounded-xl" />
                    </div>

                    {/* RIGHT SIDE - Product Info */}
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="h-6 w-2/3 bg-gray-200 rounded" />

                        {/* Price */}
                        <div className="h-5 w-1/3 bg-gray-200 rounded" />

                        {/* Size Label */}
                        <div className="h-4 w-20 bg-gray-200 rounded mt-4" />

                        {/* Size Options */}
                        <div className="flex gap-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                            <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        </div>

                        {/* Color Label */}
                        <div className="h-4 w-20 bg-gray-200 rounded mt-4" />

                        {/* Color Options */}
                        <div className="flex gap-2">
                            <div className="w-16 h-8 bg-gray-200 rounded-full" />
                            <div className="w-16 h-8 bg-gray-200 rounded-full" />
                            <div className="w-16 h-8 bg-gray-200 rounded-full" />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mt-6">
                            <div className="h-12 w-40 bg-gray-200 rounded-full" />
                            <div className="h-12 w-40 bg-gray-200 rounded-full" />
                        </div>

                        {/* Meta Info */}
                        <div className="h-24 w-full bg-gray-200 rounded-lg mt-6" />
                    </div>
                </div>

                {/* Description Section */}
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
    const t = useTranslations("ProductDetails");

    // Translation variables (makes JSX much cleaner)
    const tAddToCart = t("addToCart");
    const tBuyNow = t("buyNow");
    const tOutOfStock = t("outOfStock");
    const tInStock = t("inStock");
    const tCategory = t("category");
    const tStock = t("stock");
    const tSku = t("sku");
    const tWarranty = t("warranty");
    const tDays = t("days");
    const tShare = t("share");
    const tDescription = t("tabs.description");
    const tDetails = t("tabs.details");
    const tReviews = t("tabs.reviews");
    const tProductDesc = t("productDescription");
    const tProductDetails = t("productDetails");
    const tCustomerReviews = t("customerReviews");
    const tNoReviewsYet = t("noReviewsYet");
    const tWriteReview = t("writeReview");
    const tYourReview = t("yourReview");
    const tSubmitReview = t("submitReview");
    const tSubmitting = t("submitting");
    const tRecentViewed = t("recentViewed");
    const tReferralTitle = t("referral.shareTitle");
    const tReferralText = t("referral.shareText");
    const tProductNotFound = t("productNotFound");
    const tReviewPlaceholder = t("reviewPlaceholder");

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
    const { incrementCart } = useCart();
    const [showQuantity, setShowQuantity] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);
    const { wishlistItems, updateWishlist } = useWishlist();
    const [isInWishlist, setIsInWishlist] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [userProfile, setUserProfile] = useState(null);
    const [isAffiliate, setIsAffiliate] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const referCodeFromUrl = searchParams.get("referCode");
    const [storedReferCode, setStoredReferCode] = useState("");

    // ────────────────────────────────────────────────
    //  All your useEffect hooks, functions, handlers remain 100% unchanged
    // ────────────────────────────────────────────────

    useEffect(() => {
        const referCode = localStorage.getItem("product_refer_code");
        if (referCode) {
            setStoredReferCode(referCode);
        }
    }, []);

    useEffect(() => {
        if (referCodeFromUrl) {
            localStorage.setItem("product_refer_code", referCodeFromUrl);
        }
    }, [referCodeFromUrl]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            setIsAffiliate(userInfo?.affiliate_status);
            setReferralCode(userInfo?.referral_code || "");
            setUserProfile(userInfo);
        }
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
            // Build a stable key from all selected variant values
            const variantKey =
                Object.entries(selectedVariants)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}:${v}`)
                    .join("||") || "no-variants";
            const itemUniqueId = `${product.id}-${variantKey}`;
            const existingIndex = cartItems.findIndex(
                (item) => item.uniqueId === itemUniqueId,
            );
            if (existingIndex >= 0) {
                cartItems[existingIndex].quantity = quantity;
                if (referCode) {
                    cartItems[existingIndex].product_refer_code = referCode;
                }
            } else {
                cartItems.push({
                    id: product.id,
                    uniqueId: itemUniqueId,
                    title: product.title,
                    price: product.sale_price || product.list_price,
                    quantity: quantity,
                    image: product.main_image
                        ? `${backendBaseURL}/${data.main_image_path}/${product.main_image}`
                        : `${backendBaseURL}/${data.default_image_path}`,
                    base_curr_symbol: data.base_curr_symbol,
                    product_refer_code: referCode || "",
                    variants: { ...selectedVariants },
                    source: "productDetails",
                });
            }
            cartItems = cartItems.filter((item) => item.quantity > 0);
            localStorage.setItem(
                "productDetailsCart",
                JSON.stringify(cartItems),
            );
        },
        [data, referCodeFromUrl, selectedVariants],
    );

    useEffect(() => {
        if (!data?.product) return;
        const savedCart = localStorage.getItem("productDetailsCart");
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            const variantKey =
                Object.entries(selectedVariants)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v]) => `${k}:${v}`)
                    .join("||") || "no-variants";
            const currentUniqueId = `${data.product.id}-${variantKey}`;
            const cartItem = parsedCart.find(
                (item) => item.uniqueId === currentUniqueId,
            );
            if (cartItem) {
                setShowQuantity(true);
            } else {
                setShowQuantity(false);
            }
        }
    }, [data, selectedVariants]);

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
                    // review
                    const reviewsData =
                        response.data.data.product_reviews || [];
                    const formattedReviews = reviewsData?.map((review) => ({
                        id: review.id,
                        name: review.review_user,
                        avatar: chatUserThree,
                        rating: review.rating,
                        comment: review.review,
                        date: review.updated_at.split("T")[0],
                    }));
                    setReviews(formattedReviews);
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
                    name: userProfile?.fullname,
                    avatar: chatUserThree,
                    rating,
                    comment: review,
                    date: new Date().toISOString().split("T")[0],
                };
                const updatedReviews = [...reviews, newReview];
                setReviews(updatedReviews);
                setRating(0);
                setReview("");
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setReviewLoading(false);
        }
    };
    const { baseCurrencySymbol } = getBaseCurrency(data);

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

    const handleVariantSelect = (title, value) => {
        setSelectedVariants((prev) => {
            if (prev[title] === value) {
                // toggle off
                const next = { ...prev };
                delete next[title];
                return next;
            }
            return { ...prev, [title]: value };
        });
    };

    if (loading) {
        return <ProductDetailsSkeleton />;
    }

    if (!product) {
        return <div className="text-center py-10">{tProductNotFound}</div>;
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
            ? `${baseCurrencySymbol}${parseFloat(product.sale_price).toFixed(2)}`
            : `${baseCurrencySymbol}0.00`,
        oldPrice: product.list_price
            ? `${baseCurrencySymbol}${parseFloat(product.list_price).toFixed(2)}`
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
                ? `${baseCurrencySymbol}${parseFloat(product.product_prices.sale_price).toFixed(2)}`
                : `${baseCurrencySymbol}0.00`,
            oldPrice: product.product_prices?.list_price
                ? `${baseCurrencySymbol}${parseFloat(product.product_prices.list_price).toFixed(2)}`
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
                                    <div className="hidden xl:block">
                                        <VerticalProductGallery
                                            productData={productData}
                                            selectedImage={selectedImage}
                                            handleThumbnailClick={
                                                handleThumbnailClick
                                            }
                                        />
                                    </div>
                                    <div className="relative rounded-lg overflow-hidden h-full aspect-square">
                                        <ProductZoomImage
                                            selectedImage={selectedImage}
                                            productData={productData}
                                        />
                                    </div>
                                </div>
                                <div className="xl:hidden">
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
                                        {!isOutOfStock && (
                                            <span className="text-green-500 bg-green-50 px-3 border-green-300 text-xs border py-1 rounded-full font-medium">
                                                {tInStock}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-primary__color text-lg md:text-2xl font-bold mb-2">
                                        {productData.newPrice}{" "}
                                        {productData.oldPrice && (
                                            <span className="line-through text-gray-400 text-sm md:text-base font-medium ml-2">
                                                {productData.oldPrice}
                                            </span>
                                        )}
                                    </div>
                                    {productData.variants?.map((variant) =>
                                        variant.values?.length > 0 ? (
                                            <div
                                                key={variant.title}
                                                className="mb-2 xl:mb-4"
                                            >
                                                <p className="font-semibold mb-2">
                                                    {variant.title}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {variant.values.map(
                                                        (value) => (
                                                            <button
                                                                key={value}
                                                                onClick={() =>
                                                                    handleVariantSelect(
                                                                        variant.title,
                                                                        value,
                                                                    )
                                                                }
                                                                className={`relative px-4 py-1 xl:py-2 border rounded-full font-semibold transition-all ${
                                                                    selectedVariants[
                                                                        variant
                                                                            .title
                                                                    ] === value
                                                                        ? "bg-primary__color text-white border-primary__color"
                                                                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                                                                }`}
                                                            >
                                                                {value}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ) : null,
                                    )}
                                    <div className="mb-6">
                                        {isOutOfStock ? (
                                            <div className="w-full">
                                                <div className="bg-gray-100 rounded-md py-3 px-4 text-center">
                                                    <span className="font-semibold">
                                                        {tOutOfStock}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                                <div>
                                                    <Button
                                                        title={tAddToCart}
                                                        variant="primary"
                                                        size="md"
                                                        className="w-full !bg-[#f5f5f5] !text-color__heading !rounded-full"
                                                        onClick={
                                                            handleAddToCart
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        href={
                                                            referralCode
                                                                ? "/checkout"
                                                                : `/checkout?referCode=${storedReferCode}`
                                                        }
                                                        onClick={
                                                            handleCheckoutClick
                                                        }
                                                        title={tBuyNow}
                                                        variant="primary"
                                                        size="md"
                                                        className="w-full !rounded-full "
                                                    />
                                                    <div
                                                        onClick={handleWishlist}
                                                        className={`${isInWishlist ? "border-primary__color" : "bg-white"} w-[60px] h-full border border-gray-300 rounded-full flex items-center justify-center cursor-pointer`}
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
                                    <div className="grid bg-gray-100 rounded-md p-3 grid-cols-1 gap-2 text-sm md:text-base text-gray-600 ltr:border-l-[5px] rtl:border-r-[5px] border-primary__color ltr:pl-3 rtl:pr-3">
                                        <p>
                                            <strong>{tCategory}:</strong>{" "}
                                            <span className="font-medium">
                                                {productData.category}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>{tStock}:</strong>{" "}
                                            <span className="font-medium">
                                                {productData.stock}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>{tSku}:</strong>{" "}
                                            <span className="font-medium">
                                                {productData.sku}
                                            </span>
                                        </p>
                                        {productData.warranty_status && (
                                            <p>
                                                <strong>{tWarranty}:</strong>{" "}
                                                <span className="font-medium">
                                                    {parseInt(
                                                        productData.warranty_days,
                                                    )}{" "}
                                                    {tDays}
                                                </span>
                                            </p>
                                        )}
                                        {isAffiliate && referralCode && (
                                            <div className="flex gap-2">
                                                <strong>
                                                    {t("referralLink")}:
                                                </strong>{" "}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setIsReferralModalOpen(
                                                                true,
                                                            )
                                                        }
                                                        className="text-primary__color font-medium underline"
                                                    >
                                                        {t("share")}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-3 md:gap-0">
                                        <div className="flex items-center gap-4 text-gray-600">
                                            <span className="text-sm md:text-base font-semibold">
                                                {tShare}:
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
                                            className={` focus:outline-none ${hover && "text-primary__color"} ${selected && "text-primary__color border-b-2 border-primary__color"}`}
                                        >
                                            {tDescription}
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
                                            {tDetails}
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
                                            {tReviews}
                                        </button>
                                    )}
                                </Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <div className="mt-6 lg:mt-12">
                                        <h5 className="mb-3">{tProductDesc}</h5>
                                        <div className="overflow-x-auto">
                                            {productData.description ? (
                                                <p
                                                    className="text-color__heading text-sm md:text-base font-medium leading-[28px]"
                                                    dangerouslySetInnerHTML={{
                                                        __html: productData.description,
                                                    }}
                                                />
                                            ) : (
                                                t("noDescription")
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="mt-6 lg:mt-12 ">
                                        <h5 className="mb-3">
                                            {tProductDetails}
                                        </h5>
                                        <div className="overflow-x-auto">
                                            {productData.tab_description ? (
                                                <p
                                                    className="text-color__heading text-sm md:text-base font-medium leading-[28px]"
                                                    dangerouslySetInnerHTML={{
                                                        __html: productData.tab_description,
                                                    }}
                                                />
                                            ) : (
                                                t("noDetails")
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="mt-6 lg:mt-12">
                                        <h3 className="text-lg md:text-xl font-bold mb-6">
                                            {tCustomerReviews}
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
                                                    {tNoReviewsYet}
                                                </p>
                                            )}
                                        </div>
                                        <div className="sm:bg-gray-50 sm:p-6 rounded-lg">
                                            <h4 className="text-lg font-semibold mb-4">
                                                {tWriteReview}
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
                                                        {tYourReview}
                                                    </label>
                                                    <textarea
                                                        id="review"
                                                        rows="4"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary__color focus:border-transparent"
                                                        placeholder={
                                                            tReviewPlaceholder
                                                        }
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
                                                        ? tSubmitting
                                                        : tSubmitReview}
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
                                {tRecentViewed}
                            </h6>
                            <div className="max-h-[600px] overflow-y-auto pr-4 divide-y">
                                {recentlyViewedProductsData.length > 0 ? (
                                    recentlyViewedProductsData.map(
                                        (product, index) => (
                                            <Link
                                                href={`/product/details?id=${product.id}`}
                                                key={index}
                                                className=" bg-gray-100 p-4 flex md:items-center gap-4 "
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
                                        {t("noRecentViewed")}
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
                            {tReferralTitle}
                        </Dialog.Title>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                {tReferralText}
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
                                {t("shareVia")}:
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
                                {t("close")}
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
        <Suspense
            fallback={
                <>
                    <ProductDetailsSkeleton />
                </>
            }
        >
            <ProductDetails />
        </Suspense>
    );
}
