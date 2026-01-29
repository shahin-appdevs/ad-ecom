"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Listbox } from "@headlessui/react";
import {
    UserIcon,
    ShoppingBagIcon,
    HeartIcon,
    HomeIcon,
    ChevronUpDownIcon,
    MagnifyingGlassIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";
import { usePathname } from "next/navigation";
import { useHomeData } from "@/components/context/HomeContext";
import {
    searchProductGetAPI,
    profiledGetAPI,
} from "@root/services/apiClient/apiClient";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

import logo from "@public/images/logo/logo.webp";
import { LayoutDashboard } from "lucide-react";

const languages = [
    { id: 1, name: "US EN" },
    { id: 2, name: "BD BN" },
];

export default function Header() {
    const pathname = usePathname();
    const { cartCount } = useCart();
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartHovered, setIsCartHovered] = useState(false);
    const [isWishlistHovered, setIsWishlistHovered] = useState(false);
    const { wishlistItems, wishlistCount } = useWishlist();
    const [searchType, setSearchType] = useState("product");
    const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState("৳0");
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [storedReferCode, setStoredReferCode] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const data = useHomeData() || {};
    const homeData = data.homeData || null;

    // useEffect(() => {
    //     const fetchUserProfile = async () => {
    //         if (!isLoggedIn) return;

    //         try {
    //             const response = await profiledGetAPI();
    //             setReferralCode(response.data.data?.user?.referral_code || "");
    //         } catch (error) {
    //             console.error("Failed to fetch user profile:", error);
    //         }
    //     };

    //     fetchUserProfile();
    // }, [isLoggedIn]);

    console.log(isLoggedIn);

    useEffect(() => {
        const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

        if (userInfo) {
            setStoredReferCode(userInfo.referral_code);
        }
    }, []);

    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim() === "") {
                setSearchResults([]);
                return;
            }

            try {
                setIsSearchLoading(true);

                const response = await searchProductGetAPI(
                    searchQuery,
                    searchType,
                );

                // Format products or stalls to match your UI expectations
                let formattedResults = [];
                const baseCurrency = response.data.data.base_curr_symbol || "৳";

                if (searchType === "product") {
                    formattedResults =
                        response.data.data.products?.map((product) => ({
                            id: product.id,
                            title: product.title,
                            price: `${baseCurrency}${parseFloat(product.product_prices?.sale_price || 0).toFixed(2)}`,
                            image: product.main_image
                                ? `${backendBaseURL}/${response.data.data.product_image_path}/${product.main_image}`
                                : `${backendBaseURL}/${response.data.data.default_image_path}`,
                        })) || [];
                } else if (searchType === "stall") {
                    formattedResults =
                        response.data.data.stalls?.map((stall) => ({
                            id: stall.id,
                            title: stall.stall_name,
                            price: stall.stall_location,
                            image: stall.stall_image
                                ? `${backendBaseURL}/${response.data.data.stall_image_path}/${stall.stall_image}`
                                : `${backendBaseURL}/${response.data.data.default_image_path}`,
                        })) || [];
                }

                setSearchResults(formattedResults);
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
                setSearchResults([]);
            } finally {
                setIsSearchLoading(false);
            }
        };

        // Add debounce to prevent too many API calls
        const debounceTimer = setTimeout(() => {
            searchProducts();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, searchType]);

    useEffect(() => {
        const token =
            localStorage.getItem("jwtToken") ||
            sessionStorage.getItem("jwtToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const sellerToken =
            localStorage.getItem("jwtSellerToken") ||
            sessionStorage.getItem("jwtSellerToken");
        setIsSellerLoggedIn(!!sellerToken);
    }, []);

    const categories =
        homeData?.product_hierarchical?.map((category) => ({
            id: category.id,
            name: category.title,
            categoryImage: category.image
                ? `${backendBaseURL}/${homeData.category_image_path}/${category.image}`
                : `${backendBaseURL}/${homeData.default_image_path}`,
            subcategories:
                category.child_categories?.map((childCategory) => ({
                    id: childCategory.id,
                    name: childCategory.title,
                    subcategoryImage: childCategory.image
                        ? `${backendBaseURL}/${homeData.child_category_image_path}/${childCategory.image}`
                        : `${backendBaseURL}/${homeData.default_image_path}`,
                    brands:
                        childCategory.child_sub_categories?.map(
                            (subCategory) => ({
                                id: subCategory.id,
                                name: subCategory.title,
                                brandImage: subCategory.image
                                    ? `${backendBaseURL}/${homeData.child_sub_category_image_path}/${subCategory.image}`
                                    : `${backendBaseURL}/${homeData.default_image_path}`,
                            }),
                        ) || [],
                })) || [],
        })) || [];

    const allProducts = [
        { id: 1, title: "Panjabi FULL Coton", price: "৳2,650" },
        { id: 2, title: "Panjabe Nevi blue color", price: "৳2,650" },
        { id: 3, title: "Panjabe BT5 9TC 1.3FITA C5TG", price: "৳2,650" },
        { id: 4, title: "Panjabe Blue Color", price: "৳2,650" },
        { id: 5, title: "Black Color Panjabe C5TG", price: "৳2,650" },
        { id: 6, title: "New Arrival Luxury Party Panjabi", price: "৳2,650" },
        {
            id: 7,
            title: "Premium Quality Panjabi Indian Cotton",
            price: "৳2,650",
        },
    ];

    const navItems = [
        { href: "/", label: "Home", icon: <HomeIcon className="w-5 h-5" /> },
        { href: "/categories", label: "Categories" },
        { href: "/product/new", label: "New Product" },
        { href: "/product/flash", label: "Flash Sale" },
        { href: "/brands", label: "Brand" },
        { href: "/campaigns", label: "Campaign" },
        { href: "/collections", label: "Collection" },
    ];

    useEffect(() => {
        // List of all cart types
        const allCartTypes = [
            "flashSaleCart",
            "newArrivalCart",
            "categoryProductsCart",
            "campaignCart",
            "collectionCart",
            "brandCart",
            "categoryCart",
            "childSubCategoryCart",
            "subCategoryCart",
            "relatedProductCart",
            "productDetailsCart",
        ];

        // Get all cart items from different sources
        const allCartItems = allCartTypes.reduce((acc, cartKey) => {
            const cart = localStorage.getItem(cartKey);
            if (cart) {
                try {
                    const parsedCart = JSON.parse(cart);
                    return [...acc, ...parsedCart];
                } catch (error) {
                    console.error(`Error parsing ${cartKey}:`, error);
                    return acc;
                }
            }
            return acc;
        }, []);

        setCartItems(allCartItems);

        // Calculate total from all cart items
        const total = allCartItems.reduce((sum, item) => {
            // Handle cases where price might be a string or number
            const price =
                typeof item.price === "string"
                    ? parseFloat(item.price.replace(/[^\d.]/g, ""))
                    : item.price || 0;
            return sum + price * (item.quantity || 1);
        }, 0);

        // Use the first available currency symbol or default
        const currencySymbol =
            allCartItems[0]?.base_curr_symbol ||
            allCartItems[0]?.currency_symbol ||
            "৳";

        setCartTotal(`${currencySymbol}${total.toFixed(2)}`);
    }, [cartCount]);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            return;
        }

        let results = [];
        if (searchType === "product") {
            results = allProducts
                .filter((product) =>
                    product.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                )
                .slice(0, 5);
        } else {
        }

        setSearchResults(results);
    }, [searchQuery, searchType]);

    const toggleCategory = (index) => {
        setExpandedCategory(expandedCategory === index ? null : index);
    };

    const handleCheckoutClick = (e) => {
        if (!isLoggedIn && !isSellerLoggedIn) {
            e.preventDefault();
            const storedReferCode = localStorage.getItem("product_refer_code");
            sessionStorage.setItem(
                "redirectAfterLogin",
                storedReferCode
                    ? `/checkout?referCode=${storedReferCode}`
                    : "/checkout",
            );
            window.location.href = "/user/auth/login";
        }
        const localUrl = storedReferCode
            ? `/checkout?referCode=${storedReferCode}`
            : "/checkout";
        localStorage.setItem("intendedUrl", localUrl);
    };

    const handleWishlistClick = (e) => {
        if (!isLoggedIn && !isSellerLoggedIn) {
            e.preventDefault();
            sessionStorage.setItem("redirectAfterLogin", "/checkout");
            window.location.href = "/user/auth/login";
        }
        const localUrl = "/wishlist";
        localStorage.setItem("intendedUrl", localUrl);
    };

    return (
        <>
            <header className="w-full sticky top-0 left-0 z-50 bg-white border-b lg:border-b-primary__color">
                <div className="container xl:max-w-[1530px] px-4 mx-auto">
                    <div className="flex items-center justify-between py-3 lg:hidden">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setIsMobileMenuOpen((prev) => !prev)
                                }
                                aria-label="Toggle Menu"
                            >
                                {isMobileMenuOpen ? (
                                    <XMarkIcon className="w-6 h-6 text-gray-700" />
                                ) : (
                                    <Bars3Icon className="w-6 h-6 text-gray-700" />
                                )}
                            </button>
                        </div>
                        <Link href="/">
                            <Image
                                src={logo}
                                alt="Logo"
                                className="h-6 w-auto"
                            />
                        </Link>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setShowMobileSearch(!showMobileSearch)
                                }
                                className="p-1"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
                            </button>
                            <Link href="/wishlist" className="p-1">
                                <HeartIcon className="w-5 h-5 text-gray-700" />
                            </Link>
                        </div>
                    </div>
                    {showMobileSearch && (
                        <div className="relative w-full lg:hidden py-2">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full border border-primary__color rounded-full px-4 py-2 pl-10 text-xs focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() =>
                                    setTimeout(
                                        () => setIsSearchFocused(false),
                                        200,
                                    )
                                }
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black">
                                <MagnifyingGlassIcon className="h-4 w-5" />
                            </span>
                            {isSearchFocused && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                    <ul className="py-1">
                                        {searchResults.map((item) => (
                                            <li key={item.id}>
                                                <Link
                                                    href={
                                                        searchType === "product"
                                                            ? `/product/details?id=${item.id}`
                                                            : `/stalls/details?id=${item.id}`
                                                    }
                                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <div className="w-10 h-10 mr-3 bg-gray-100 rounded overflow-hidden">
                                                        <Image
                                                            src={item.image}
                                                            alt={item.title}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium line-clamp-1">
                                                            {item.title}
                                                        </div>
                                                        {item.price && (
                                                            <div className="text-primary__color font-semibold">
                                                                {item.price}
                                                            </div>
                                                        )}
                                                        {item.location && (
                                                            <div className="text-xs text-gray-500">
                                                                {item.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="hidden lg:flex flex-col lg:flex-row justify-between items-center py-4 gap-2 lg:gap-0">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Image
                                    src={logo}
                                    alt="Logo"
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </div>
                        <div className="relative w-full lg:flex-1 mx-0 lg:mx-6">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full border border-primary__color rounded-full px-4 py-3 pl-10 pr-[180px] text-sm focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() =>
                                    setTimeout(
                                        () => setIsSearchFocused(false),
                                        200,
                                    )
                                }
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </span>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setIsSearchTypeOpen(
                                                !isSearchTypeOpen,
                                            )
                                        }
                                        className="h-full px-3 flex items-center justify-center text-sm"
                                    >
                                        {searchType === "product"
                                            ? "Search By Product"
                                            : "Search By Stall"}
                                        <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                                    </button>
                                    {isSearchTypeOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-md overflow-hidden">
                                            <ul>
                                                <li>
                                                    <button
                                                        onClick={() => {
                                                            setSearchType(
                                                                "product",
                                                            );
                                                            setIsSearchTypeOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className={`w-full text-left px-4 py-2 rounded-md text-sm ${searchType === "product" ? "bg-indigo-100" : "hover:bg-gray-100"}`}
                                                    >
                                                        Search By Product
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => {
                                                            setSearchType(
                                                                "stall",
                                                            );
                                                            setIsSearchTypeOpen(
                                                                false,
                                                            );
                                                        }}
                                                        className={`w-full text-left px-4 py-2 rounded-md text-sm ${searchType === "stall" ? "bg-indigo-100" : "hover:bg-gray-100"}`}
                                                    >
                                                        Search By Stall
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isSearchFocused && searchResults.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                    <ul className="py-1">
                                        {searchResults.map((product) => (
                                            <li key={product.id}>
                                                <Link
                                                    href={
                                                        searchType === "product"
                                                            ? `/product/details?id=${product.id}`
                                                            : `/stalls/details?id=${product.id}`
                                                    }
                                                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <div className="w-10 h-10 mr-3 bg-gray-100 rounded overflow-hidden">
                                                        {product?.image && (
                                                            <Image
                                                                src={
                                                                    product?.image
                                                                }
                                                                alt={
                                                                    product?.title
                                                                }
                                                                width={40}
                                                                height={40}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium line-clamp-1">
                                                            {product.title}
                                                        </div>
                                                        {product.price && (
                                                            <div className="text-primary__color font-semibold">
                                                                {product.price}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center lg:justify-end items-center gap-2 lg:gap-4 text-sm text-gray-700">
                            {isLoggedIn ? (
                                <Link
                                    href="/user/dashboard"
                                    className="flex items-center gap-1 hover:text-primary__color"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : isSellerLoggedIn ? (
                                <Link
                                    href="/seller/dashboard"
                                    className="flex items-center gap-1 hover:text-primary__color"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span>Dashboard</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/user/auth/login"
                                        className="flex items-center gap-1 hover:text-primary__color"
                                    >
                                        <UserIcon className="w-5 h-5" />
                                        <span>Sign In</span>
                                    </Link>
                                    <span>|</span>
                                    <Link
                                        href="/user/auth/register"
                                        className="hover:text-primary__color"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                            <Link
                                href={
                                    referralCode
                                        ? "/checkout"
                                        : `/checkout?referCode=${storedReferCode}`
                                }
                                onClick={handleCheckoutClick}
                                className="relative"
                                onMouseEnter={() => setIsCartHovered(true)}
                                onMouseLeave={() => setIsCartHovered(false)}
                            >
                                <ShoppingBagIcon className="w-5 h-5 cursor-pointer hover:text-primary__color" />

                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary__color text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                                {isCartHovered && (
                                    <div
                                        className="absolute right-0 w-80 bg-white rounded-md shadow-md overflow-hidden z-50"
                                        onMouseEnter={() =>
                                            setIsCartHovered(true)
                                        }
                                        onMouseLeave={() =>
                                            setIsCartHovered(false)
                                        }
                                    >
                                        <div className="p-4 border-b">
                                            <h3 className="font-semibold text-base">
                                                Cart
                                            </h3>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {cartItems.length > 0 ? (
                                                cartItems.map((item, index) => (
                                                    <div
                                                        key={`${item.id}-${item.source || "default"}-${index}`}
                                                        className="flex items-center p-4 border-b hover:bg-gray-50"
                                                    >
                                                        <div className="w-16 h-16 bg-gray-100 rounded mr-3 overflow-hidden">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.title}
                                                                width={64}
                                                                height={64}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium line-clamp-1">
                                                                {item.title}
                                                            </h4>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className="text-xs font-medium">
                                                                    Qty:{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <span className="text-sm font-semibold text-primary__color">
                                                                    {item.base_curr_symbol ||
                                                                        "৳"}
                                                                    {parseFloat(
                                                                        item.price,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">
                                                    Your cart is empty
                                                </div>
                                            )}
                                        </div>
                                        {cartItems.length > 0 && (
                                            <div className="p-4 bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">
                                                        Checkout
                                                    </span>
                                                    <span className="text-lg font-bold text-primary__color">
                                                        {cartTotal}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Link>
                            <Link
                                href="/wishlist"
                                onClick={handleWishlistClick}
                                className="relative"
                                onMouseEnter={() => setIsWishlistHovered(true)}
                                onMouseLeave={() => setIsWishlistHovered(false)}
                            >
                                <HeartIcon className="w-5 h-5 cursor-pointer hover:text-primary__color" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary__color text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                        {wishlistItems.length}
                                    </span>
                                )}
                                {isWishlistHovered && (
                                    <div
                                        className="absolute right-0 w-80 bg-white rounded-md shadow-md overflow-hidden z-50"
                                        onMouseEnter={() =>
                                            setIsWishlistHovered(true)
                                        }
                                        onMouseLeave={() =>
                                            setIsWishlistHovered(false)
                                        }
                                    >
                                        <div className="p-4 border-b">
                                            <h3 className="font-semibold text-base">
                                                Wishlist
                                            </h3>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {wishlistItems.length > 0 ? (
                                                wishlistItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center p-4 border-b hover:bg-gray-50"
                                                    >
                                                        <div className="w-16 h-16 bg-gray-100 rounded mr-3 overflow-hidden">
                                                            <Image
                                                                src={item.image}
                                                                alt={item.title}
                                                                width={64}
                                                                height={64}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-medium line-clamp-1">
                                                                {item.title}
                                                            </h4>
                                                            <div className="text-sm font-semibold text-primary__color mt-1">
                                                                {item.base_curr_symbol ||
                                                                    "৳"}
                                                                {parseFloat(
                                                                    item.price,
                                                                ).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500">
                                                    Your wishlist is empty
                                                </div>
                                            )}
                                        </div>
                                        {wishlistItems.length > 0 && (
                                            <div className="p-4 bg-gray-50">
                                                <div className="block w-full text-center bg-primary__color text-white py-2 rounded hover:bg-opacity-90 transition">
                                                    View Wishlist
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Link>
                            <Listbox
                                value={selectedLanguage}
                                onChange={setSelectedLanguage}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full border rounded py-1 px-2 text-sm text-left flex justify-between items-center">
                                        {selectedLanguage.name}
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10">
                                        {languages.map((language) => (
                                            <Listbox.Option
                                                key={language.id}
                                                value={language}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                }
                                            >
                                                <span className="flex justify-between">
                                                    {language.name}
                                                </span>
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                    </div>
                </div>
                <nav className="bg-white  text-color__heading text-sm font-semibold">
                    <div className="container xl:max-w-[1530px] px-4 mx-auto">
                        <ul className="hidden lg:flex items-center justify-center px-5  ">
                            {navItems.map(({ href, label, icon }) => {
                                const isActive = pathname === href;
                                return (
                                    <li key={href} className="relative">
                                        <Link
                                            href={href}
                                            className={`flex items-center gap-1 py-3.5 px-4  after:absolute after:bottom-[-1px] after:left-0  after:h-[1px] after:w-full after:z-10 border border-white rounded-t-md  ${isActive ? "bg-white text-primary__color !border-primary__color !border-b-white after:!bg-white  px-3 " : ""}`}
                                        >
                                            {icon}
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                        {isMobileMenuOpen && (
                            <>
                                <div className="fixed inset-0 bg-white z-50 mt-[40px] overflow-y-auto">
                                    {/* <div className="border-b pb-4">
                                    <h5 className="px-4 py-2 font-bold text-gray-700">
                                        Categories
                                    </h5>
                                    <ul className="flex flex-col gap-1">
                                        {categories.map((category, index) => (
                                            <li
                                                key={index}
                                                className="border-b last:border-b-0"
                                            >
                                                <div
                                                    className={`flex items-center justify-between px-4 py-2.5 ${expandedCategory === index ? "bg-gray-50" : ""}`}
                                                    onClick={() =>
                                                        toggleCategory(index)
                                                    }
                                                >
                                                    <span className="font-medium">
                                                        {category.name}
                                                    </span>
                                                    {category.subcategories
                                                        .length > 0 && (
                                                        <ChevronRightIcon
                                                            className={`w-4 h-4 transition-transform ${expandedCategory === index ? "rotate-90" : ""}`}
                                                        />
                                                    )}
                                                </div>

                                                {expandedCategory === index &&
                                                    category.subcategories
                                                        .length > 0 && (
                                                        <ul className="ml-4 mb-2 bg-gray-50 rounded">
                                                            {category.subcategories.map(
                                                                (
                                                                    subcategory,
                                                                    subIndex,
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            subIndex
                                                                        }
                                                                    >
                                                                        <Link
                                                                            href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}/${subcategory.name.toLowerCase().replace(/\s+/g, "-")}`}
                                                                            className="block px-4 py-2 text-sm text-gray-600 hover:text-primary__color"
                                                                            onClick={() =>
                                                                                setIsMobileMenuOpen(
                                                                                    false,
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                subcategory.name
                                                                            }
                                                                        </Link>
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    )}
                                            </li>
                                        ))}
                                    </ul>
                                </div> */}
                                    <ul className="flex flex-col py-4">
                                        {navItems.map(({ href, label }) => {
                                            const isActive = pathname === href;
                                            return (
                                                <li key={href}>
                                                    <Link
                                                        href={href}
                                                        className={`block px-4 py-2.5 rounded text-sm ${
                                                            isActive
                                                                ? "text-primary__color font-semibold"
                                                                : "text-gray-700"
                                                        }`}
                                                        onClick={() =>
                                                            setIsMobileMenuOpen(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        {label}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <ul className="flex flex-col gap-2 py-4 lg:hidden">
                                    {navItems.map(({ href, label }) => {
                                        const isActive = pathname === href;
                                        return (
                                            <li key={href}>
                                                <Link
                                                    href={href}
                                                    className={`block px-4 py-1.5 rounded text-sm ${
                                                        isActive
                                                            ? "bg-white text-primary__color font-semibold"
                                                            : "hover:bg-white hover:text-primary__color"
                                                    }`}
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    {label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </>
                        )}
                    </div>
                </nav>
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                    <div className="flex justify-around items-center py-2">
                        <Link href="/" className="flex flex-col items-center">
                            <HomeIcon className="w-5 h-5 text-gray-700" />
                            <span className="text-xs mt-1">Home</span>
                        </Link>
                        <Link
                            href="/categories"
                            className="flex flex-col items-center"
                        >
                            <LayoutDashboard className="w-5 h-5 text-gray-700" />
                            <span className="text-xs mt-1">Category</span>
                        </Link>
                        {isLoggedIn ? (
                            <Link
                                href="/user/dashboard"
                                className="flex flex-col items-center"
                            >
                                <UserIcon className="w-5 h-5 text-gray-700" />
                                <span className="text-xs mt-1">Account</span>
                            </Link>
                        ) : isSellerLoggedIn ? (
                            <Link
                                href="/seller/dashboard"
                                className="flex flex-col items-center"
                            >
                                <UserIcon className="w-5 h-5 text-gray-700" />
                                <span className="text-xs mt-1">Account</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/user/auth/login"
                                    className="flex flex-col items-center"
                                >
                                    <UserIcon className="w-5 h-5 text-gray-700" />
                                    <span className="text-xs mt-1">
                                        Account
                                    </span>
                                </Link>
                            </>
                        )}
                        <Link
                            href="/checkout"
                            onClick={handleCheckoutClick}
                            className="flex flex-col items-center relative"
                        >
                            <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 bg-primary__color text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                            <span className="text-xs mt-1">Cart</span>
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
}
