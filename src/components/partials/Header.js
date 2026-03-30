"use client";
import { useState, useEffect, useRef } from "react";
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
} from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";
import { usePathname } from "next/navigation";
import { useHomeData } from "@/components/context/HomeContext";
import { searchProductGetAPI } from "@root/services/apiClient/apiClient";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

import logo from "@public/images/logo/logo.webp";
import { LayoutDashboard, ShoppingCart } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

const languages = [
    { id: 1, name: "US EN" },
    { id: 2, name: "BD BN" },
];

export default function Header() {
    const pathname = usePathname();
    const { cartCount } = useCart();
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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState("৳0");
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [storedReferCode, setStoredReferCode] = useState("");
    const data = useHomeData() || {};
    const homeData = data.homeData || null;
    const boxRef = useRef(null);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            setStoredReferCode(userInfo.referral_code || "");
        }
    }, []);

    // Search functionality with API
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

                const baseCurrency = response.data.data.base_curr_symbol || "৳";
                let formattedResults = [];

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
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearchLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, searchType]);

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const sellerToken = localStorage.getItem("jwtSellerToken");
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

    const navItems = [
        { href: "/", key: "home" },
        { href: "/categories", key: "categories" },
        { href: "/product/new", key: "newProduct" },
        { href: "/product/flash", key: "flashSale" },
        { href: "/brands", key: "brand" },
        { href: "/campaigns", key: "campaign" },
        { href: "/collections", key: "collection" },
    ];

    // Cart items from localStorage (multiple cart types)
    useEffect(() => {
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

        const allCartItems = allCartTypes.reduce((acc, cartKey) => {
            const cart = localStorage.getItem(cartKey);
            if (cart) {
                try {
                    return [...acc, ...JSON.parse(cart)];
                } catch (error) {
                    console.error(`Error parsing ${cartKey}:`, error);
                    return acc;
                }
            }
            return acc;
        }, []);

        setCartItems(allCartItems);

        const total = allCartItems.reduce((sum, item) => {
            const price =
                typeof item.price === "string"
                    ? parseFloat(item.price.replace(/[^\d.]/g, ""))
                    : item.price || 0;
            return sum + price * (item.quantity || 1);
        }, 0);

        const currencySymbol =
            allCartItems[0]?.base_curr_symbol ||
            allCartItems[0]?.currency_symbol ||
            "৳";

        setCartTotal(`${currencySymbol}${total.toFixed(2)}`);
    }, [cartCount]);

    const toggleCategory = (index) => {
        // Currently not used in mobile menu (commented out), kept if needed later
    };

    const handleCheckoutClick = (e) => {
        if (!isLoggedIn && !isSellerLoggedIn) {
            e.preventDefault();
            const redirectUrl = storedReferCode
                ? `/checkout?referCode=${storedReferCode}`
                : "/checkout";
            sessionStorage.setItem("redirectAfterLogin", redirectUrl);
            localStorage.setItem("intendedUrl", redirectUrl);
            router.push("/user/auth/login");
        }
    };

    const handleWishlistClick = (e) => {
        if (!isLoggedIn && !isSellerLoggedIn) {
            e.preventDefault();
            sessionStorage.setItem("redirectAfterLogin", "/wishlist");
            localStorage.setItem("intendedUrl", "/wishlist");
            router.push("/user/auth/login");
        }
    };

    // Close search type dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (boxRef.current && !boxRef.current.contains(event.target)) {
                setIsSearchTypeOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const t = useTranslations("HomePage");
    const locale = useLocale();

    // Translations
    const searchPlaceholder = t("header.searchPlaceholder");
    const searchButton = {
        searchByProduct: t("header.searchButton.searchByProduct"),
        searchByStall: t("header.searchButton.searchByStall"),
    };
    const dashboardTxt = {
        dashboard: t("header.dashboard"),
        sellerDashboard: t("header.sellerDashboard"),
    };
    const authTxt = {
        login: t("header.login"),
        register: t("header.register"),
    };
    const cartTxt = {
        title: t("header.cart.title"),
        checkout: t("header.cart.checkout"),
        emptyMsg: t("header.cart.emptyMsg"),
    };
    const wishlistTxt = {
        title: t("header.wishlist.title"),
        emptyMsg: t("header.wishlist.emptyMsg"),
        view: t("header.wishlist.view"),
    };
    const mobileBottomBar = {
        home: t("header.mobileBottomBar.home"),
        categories: t("header.mobileBottomBar.categories"),
        account: t("header.mobileBottomBar.account"),
        cart: t("header.mobileBottomBar.cart"),
    };

    return (
        <>
            <header className="w-full sticky top-0 left-0 z-50 bg-white border-b lg:border-b-primary__color">
                {/* Mobile Top Bar */}
                <div className="flex items-center justify-between py-3 lg:hidden px-4">
                    <button
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Bars3Icon className="w-6 h-6 text-gray-700" />
                        )}
                    </button>

                    <Link href="/">
                        <Image src={logo} alt="Logo" className="h-6 w-auto" />
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
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Mobile Search */}
                {showMobileSearch && (
                    <div className="relative w-full lg:hidden px-4 py-2">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-xs focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() =>
                                setTimeout(() => setIsSearchFocused(false), 200)
                            }
                        />
                        <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-600">
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
                                                className="flex items-center gap-2 justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
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
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Desktop Header */}
                <div className="hidden lg:flex flex-col lg:flex-row justify-between items-center py-4 gap-2 lg:gap-0 px-4">
                    <Link href="/">
                        <Image src={logo} alt="Logo" className="h-10 w-auto" />
                    </Link>

                    {/* Search Bar */}
                    <div className="relative w-full lg:flex-1 mx-0 lg:mx-6">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full bg-neutral-100 rounded-full px-4 py-3 pl-10 pr-[180px] text-sm focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() =>
                                setTimeout(() => setIsSearchFocused(false), 200)
                            }
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </span>

                        {/* Search Type Selector */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-50">
                            <button
                                onClick={() =>
                                    setIsSearchTypeOpen(!isSearchTypeOpen)
                                }
                                className="h-full px-3 flex items-center justify-center text-sm"
                            >
                                {searchType === "product"
                                    ? searchButton.searchByProduct
                                    : searchButton.searchByStall}
                                <ChevronUpDownIcon className="w-4 h-4 ml-1" />
                            </button>

                            {isSearchTypeOpen && (
                                <div className="absolute z-10 mt-1 w-full min-w-[170px] bg-white rounded-md shadow-md overflow-hidden">
                                    <ul ref={boxRef}>
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setSearchType("product");
                                                    setIsSearchTypeOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm ${searchType === "product" ? "bg-indigo-100" : "hover:bg-gray-100"}`}
                                            >
                                                {searchButton.searchByProduct}
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setSearchType("stall");
                                                    setIsSearchTypeOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm ${searchType === "stall" ? "bg-indigo-100" : "hover:bg-gray-100"}`}
                                            >
                                                {searchButton.searchByStall}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
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
                                                className="flex items-center gap-2 justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                                                    {product?.image && (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.title}
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

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                        {/* Cart */}
                        <Link
                            href="/checkout"
                            onClick={handleCheckoutClick}
                            className="group relative p-2 bg-gray-50 rounded-full border border-gray-500/20 hover:border-primary__color duration-300"
                            onMouseEnter={() => setIsCartHovered(true)}
                            onMouseLeave={() => setIsCartHovered(false)}
                        >
                            <ShoppingCart className="w-5 h-5 cursor-pointer group-hover:text-primary__color" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary__color text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}

                            {isCartHovered && (
                                <div
                                    className="absolute right-0 top-[95%] w-80 bg-white rounded-md shadow-md overflow-hidden z-50"
                                    onMouseEnter={() => setIsCartHovered(true)}
                                    onMouseLeave={() => setIsCartHovered(false)}
                                >
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-base">
                                            {cartTxt.title}
                                        </h3>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {cartItems.length > 0 ? (
                                            cartItems.map((item, index) => (
                                                <div
                                                    key={`${item.id}-${index}`}
                                                    className="flex items-center gap-2 p-4 border-b hover:bg-gray-50"
                                                >
                                                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
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
                                                                {item.quantity}
                                                            </span>
                                                            <span className="text-sm font-semibold text-primary__color">
                                                                {item.base_curr_symbol ||
                                                                    "৳"}
                                                                {parseFloat(
                                                                    item.price,
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500">
                                                {cartTxt.emptyMsg}
                                            </div>
                                        )}
                                    </div>

                                    {cartItems.length > 0 && (
                                        <div className="p-4 bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">
                                                    {cartTxt.checkout}
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

                        {/* Wishlist */}
                        <Link
                            href="/wishlist"
                            onClick={handleWishlistClick}
                            className="group relative p-2 bg-gray-50 rounded-full border border-gray-500/20 hover:border-primary__color duration-300"
                            onMouseEnter={() => setIsWishlistHovered(true)}
                            onMouseLeave={() => setIsWishlistHovered(false)}
                        >
                            <HeartIcon className="w-5 h-5 group-hover:text-primary__color" />
                            {mounted && wishlistItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary__color text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {wishlistItems.length}
                                </span>
                            )}

                            {isWishlistHovered && (
                                <div
                                    className="absolute right-0 top-[95%] w-80 bg-white rounded-md shadow-md overflow-hidden z-50"
                                    onMouseEnter={() =>
                                        setIsWishlistHovered(true)
                                    }
                                    onMouseLeave={() =>
                                        setIsWishlistHovered(false)
                                    }
                                >
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-base">
                                            {wishlistTxt.title}
                                        </h3>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {wishlistItems.length > 0 ? (
                                            wishlistItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center p-4 gap-2 border-b hover:bg-gray-50"
                                                >
                                                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
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
                                                {wishlistTxt.emptyMsg}
                                            </div>
                                        )}
                                    </div>

                                    {wishlistItems.length > 0 && (
                                        <div className="p-4 bg-gray-50">
                                            <Link
                                                href="/wishlist"
                                                className="block w-full text-center bg-primary__color text-white py-2 rounded hover:bg-opacity-90 transition"
                                            >
                                                {wishlistTxt.view}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Link>

                        {/* Auth / Dashboard */}
                        {isLoggedIn ? (
                            <Link
                                href="/user/dashboard"
                                className="flex items-center gap-1 hover:text-primary__color"
                            >
                                <UserIcon className="w-5 h-5" />
                                <span>{dashboardTxt.dashboard}</span>
                            </Link>
                        ) : isSellerLoggedIn ? (
                            <Link
                                href="/seller/dashboard"
                                className="flex items-center gap-1 hover:text-primary__color"
                            >
                                <UserIcon className="w-5 h-5" />
                                <span>{dashboardTxt.sellerDashboard}</span>
                            </Link>
                        ) : (
                            <div className="flex items-center uppercase font-medium">
                                <Link
                                    href="/user/auth/login"
                                    className="hover:text-primary__color"
                                >
                                    {authTxt.login}
                                </Link>
                                <span className="mx-1">/</span>
                                <Link
                                    href="/user/auth/register"
                                    className="hover:text-primary__color"
                                >
                                    {authTxt.register}
                                </Link>
                            </div>
                        )}

                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Navigation Bar */}
                <nav className="bg-white text-color__heading text-sm font-semibold border-t">
                    <div className="container xl:max-w-[1530px] px-4 mx-auto">
                        <ul className="hidden lg:flex items-center justify-center">
                            {navItems.map(({ href, key }) => {
                                const isActive =
                                    pathname ===
                                    `/${locale}${href === "/" ? "" : href}`;
                                return (
                                    <li key={href} className="relative">
                                        <Link
                                            href={href}
                                            className={`flex items-center gap-1 py-2 2xl:py-3.5 px-4 ${
                                                isActive
                                                    ? "bg-white text-primary__color border border-primary__color border-b-white rounded-t-md"
                                                    : ""
                                            }`}
                                        >
                                            {t(`header.nav.${key}`)}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Mobile Menu */}
                        {isMobileMenuOpen && (
                            <div className="fixed inset-0 bg-white z-50 mt-[52px] overflow-y-auto lg:hidden">
                                <ul className="flex flex-col py-4">
                                    {navItems.map(({ href, key }) => {
                                        const isActive =
                                            pathname ===
                                            `/${locale}${href === "/" ? "" : href}`;
                                        return (
                                            <li key={href} className="border-b">
                                                <Link
                                                    href={href}
                                                    className={`block px-4 py-3 ${isActive ? "text-primary__color font-semibold" : "text-gray-700"}`}
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    {t(`header.nav.${key}`)}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Mobile Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                    <div className="flex justify-around items-center py-2">
                        <Link href="/" className="flex flex-col items-center">
                            <HomeIcon className="w-5 h-5 text-gray-700" />
                            <span className="text-xs mt-1">
                                {mobileBottomBar.home}
                            </span>
                        </Link>
                        <Link
                            href="/categories"
                            className="flex flex-col items-center"
                        >
                            <LayoutDashboard className="w-5 h-5 text-gray-700" />
                            <span className="text-xs mt-1">
                                {mobileBottomBar.categories}
                            </span>
                        </Link>
                        {isLoggedIn || isSellerLoggedIn ? (
                            <Link
                                href={
                                    isLoggedIn
                                        ? "/user/dashboard"
                                        : "/seller/dashboard"
                                }
                                className="flex flex-col items-center"
                            >
                                <UserIcon className="w-5 h-5 text-gray-700" />
                                <span className="text-xs mt-1">
                                    {mobileBottomBar.account}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/user/auth/login"
                                className="flex flex-col items-center"
                            >
                                <UserIcon className="w-5 h-5 text-gray-700" />
                                <span className="text-xs mt-1">
                                    {mobileBottomBar.account}
                                </span>
                            </Link>
                        )}
                        <Link
                            href="/checkout"
                            onClick={handleCheckoutClick}
                            className="flex flex-col items-center relative"
                        >
                            <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -top-1 -right-2 bg-primary__color text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                            <span className="text-xs mt-1">
                                {mobileBottomBar.cart}
                            </span>
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
}
