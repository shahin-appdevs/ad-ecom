"use client";
import { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { allGiftCardGetAPI } from "@root/services/apiClient/apiClient";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import toast from "react-hot-toast";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function GiftCardList() {
    const [selectedCountry, setSelectedCountry] = useState({});
    const [giftCards, setGiftCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [products, setProducts] = useState({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(
        () => Number(sessionStorage.getItem("giftCurrentPage")) || 1,
    );
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        sessionStorage.setItem("giftCurrentPage", currentPage);
        setLoading(true);

        (async () => {
            try {
                const result = await allGiftCardGetAPI(
                    selectedCountry?.iso2 || "AF",
                    currentPage,
                );

                setCountries(result?.data?.data?.countries || []);
                setGiftCards(result?.data?.data?.products?.data);
                setProducts(result?.data?.data?.products || {});
                setTotalPages(result?.data?.data?.products?.last_page);
            } catch (error) {
                toast.error("Failed to load gift cards");
                //reset data on error
                setGiftCards([]);
                setCountries([]);
                setProducts({});
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        })();
    }, [selectedCountry, currentPage]);

    return (
        <div className="min-h-screen bg-white rounded-xl py-6 px-4 sm:px-6 lg:px-8">
            <div className=" mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Gift Cards
                </h1>
                {!!selectedCountry?.iso2 || !!countries[0]?.name ? (
                    <Menu
                        as="div"
                        className="relative inline-block text-left mb-8"
                    >
                        <div>
                            <Menu.Button className="inline-flex w-64 justify-between rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                {selectedCountry?.name
                                    ? selectedCountry?.name
                                    : countries[0]?.name}
                                <ChevronDownIcon
                                    className="-mr-1 ml-2 h-5 w-5"
                                    aria-hidden="true"
                                />
                            </Menu.Button>
                        </div>

                        <Transition
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute max-h-[220px] overflow-y-auto right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    {countries?.map((country) => (
                                        <Menu.Item key={country.id}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() =>
                                                        setSelectedCountry(
                                                            country,
                                                        )
                                                    }
                                                    className={classNames(
                                                        active
                                                            ? "bg-gray-100 text-gray-900"
                                                            : "text-gray-700",
                                                        "block w-full px-4 py-2 text-left text-sm",
                                                    )}
                                                >
                                                    {country.name}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                ) : (
                    <div className="h-10 bg-gray-200 rounded-xl w-64 mb-10 animate-pulse" />
                )}

                {/* Country Selector with Headless UI Menu */}

                {/* Gift Cards Grid */}
                {loading ? (
                    <GiftCardsGridSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {giftCards.map((card, idx) => (
                            <Link
                                href={`/user/cards/gift-card/gift-card-details?product_id=${card.productId}&country=${selectedCountry?.name || countries[0]?.name}`}
                                key={idx}
                                className="bg-white block rounded-xl shadow overflow-hidden transform transition-all duration-300 border border-transparent hover:border-blue-800/70 hover:shadow-xl cursor-pointer"
                            >
                                {card?.logoUrls?.length > 0 && (
                                    <img
                                        src={card?.logoUrls[0]}
                                        alt={card?.productName}
                                        className="w-full h-40 object-cover"
                                    />
                                )}

                                <div className="p-4">
                                    <h3 className="text-base xl:text-lg font-semibold text-gray-900 text-center">
                                        {card.productName}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {giftCards.length === 0 && !loading && (
                    <p className="text-center text-gray-500 mt-8 bg-primary__color">
                        No gift cards found for the selected country.
                    </p>
                )}
            </div>
            {/* Pagination */}
            {(products?.data?.length > products?.per_page - 1 ||
                products?.current_page > 1) && (
                <div className="mt-10 flex justify-center">
                    <div className="flex items-center bg-white__color rounded-lg border border-[#E5E7EB]">
                        {/* Previous button */}
                        <button
                            onClick={() =>
                                currentPage > 1 &&
                                setCurrentPage(currentPage - 1)
                            }
                            disabled={currentPage === 1}
                            className="border-0 border-e border-[#E5E7EB] h-full flex justify-center items-center sm:px-3 px-2 disabled:cursor-not-allowed group"
                        >
                            <ChevronLeftIcon
                                className={`h-4 text-color__heading transition-all ${currentPage === 1 ? "opacity-40" : "group-hover:text-primary__color"} `}
                            />
                        </button>

                        {/* Page Numbers with ellipsis */}
                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1,
                        )
                            .filter((page) => {
                                return (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 2 &&
                                        page <= currentPage + 2)
                                );
                            })
                            .map((page, idx, arr) => {
                                const prevPage = arr[idx - 1];
                                const showEllipsis =
                                    prevPage && page - prevPage > 1;

                                return (
                                    <div key={page}>
                                        {showEllipsis && (
                                            <span className="font-bold text-color__paragraph py-2 sm:px-4 px-2 border-0 border-e border-[#E5E7EB] transition-all bg-white__color">
                                                ...
                                            </span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            disabled={currentPage === page}
                                            className={`font-bold text-color__paragraph py-2 sm:px-4 px-2 border-0 border-e border-[#E5E7EB] transition-all ${currentPage === page ? "bg-[#E5E7EB] cursor-not-allowed" : "bg-white__color hover:text-primary__color"}`}
                                        >
                                            {page}
                                        </button>
                                    </div>
                                );
                            })}

                        {/* Next button */}
                        <button
                            onClick={() =>
                                currentPage < totalPages &&
                                setCurrentPage(currentPage + 1)
                            }
                            disabled={currentPage === totalPages}
                            className="h-full flex justify-center items-center sm:px-3 px-2 disabled:cursor-not-allowed group"
                        >
                            <ChevronRightIcon
                                className={`h-4 text-color__heading transition-all ${currentPage === totalPages ? "opacity-40" : "group-hover:text-primary__color"} `}
                            />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function GiftCardsGridSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className=" mx-auto">
                {/* Page Title Skeleton */}

                {/* <div className="h-10 bg-gray-200 rounded-xl w-64 mb-10 animate-pulse" /> */}

                {/* Grid of Card Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-6">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-105"
                        >
                            {/* Image Skeleton */}
                            <div className="relative aspect-[4/3]">
                                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                            </div>

                            {/* Text Skeleton */}
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-gray-200 rounded-lg w-11/12 animate-pulse mx-auto" />
                                <div className="h-4 bg-gray-200 rounded-lg w-9/12 animate-pulse mx-auto" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Optional: Load More Button Skeleton */}
                <div className="mt-12 flex justify-center">
                    <div className="h-12 bg-gray-200 rounded-xl w-48 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
