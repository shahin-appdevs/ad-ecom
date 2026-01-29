"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronRightIcon,
    Bars3Icon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useHomeData } from "@/components/context/HomeContext";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ArrowDownIcon, ChevronDownIcon, List } from "lucide-react";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const SkeletonCategoryMenu = () => (
    <div className="w-full md:w-[240px] h-full md:min-h-[380px] bg-white border relative rounded-md p-2.5">
        <ul className="md:max-h-[360px] md:overflow-y-auto">
            {[...Array(10)].map((_, i) => (
                <li
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded"
                >
                    <div className="flex items-center gap-2 w-full">
                        <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </li>
            ))}
        </ul>
    </div>
);

const SkeletonBanner = () => (
    <div className="w-full md:w-[calc(100%-240px)] relative">
        <div className="relative w-full h-[200px] md:h-[380px] overflow-hidden bg-gray-200 animate-pulse rounded-md"></div>
    </div>
);

export default function Banner() {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const { homeData, loading } = useHomeData();

    const allBanners =
        homeData?.sliders?.map((slider) => ({
            id: slider.id,
            title: slider.title,
            image: slider.image
                ? `${backendBaseURL}/${homeData.slider_image_path}/${slider.image}`
                : `${backendBaseURL}/${homeData.default_image_path}`,
            url: slider.url,
        })) || [];

    // Split banners: Main slider gets all except last 2, Side Layout gets last 2
    // If there are fewer than 3 banners, we might need a fallback, but assuming sufficient data for now or just handling what's available.
    // Logic: If >= 3 banners, spare last 2. If < 3, put all in slider??
    // Requirement says: "linked the last banner 2 index data"
    const sideBanners = allBanners.slice(-2);
    const sliderBanners = allBanners.slice(0, -2);

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

    if (loading) {
        return (
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    <div className="flex flex-col md:flex-row sm:gap-4 relative">
                        <SkeletonCategoryMenu />
                        <SkeletonBanner />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="flex flex-col lg:flex-row gap-4 relative ">
                    {/* Category Sidebar */}
                    <div className="hidden  lg:flex flex-col justify-between items-center lg:items-start lg:w-[240px]">
                        {/* Mobile/Tablet Menu Button Placeholder if needed, but keeping structure close to original logic for sidebar */}
                        {/* Original code had a button for mobile menu, let's keep the structure but ensure desktop layout works */}
                        <div
                            className={`w-full h-full  bg-white relative rounded-md block`} // Assuming always visible on large screens as per previous design
                        >
                            <div className=" gap-2 bg-primary__color rounded-t-md py-2 text-white px-2 justify-between font-semibold flex items-center">
                                <span className="flex items-center gap-2 ">
                                    <List size={18} />
                                    <span>Browse Category</span>
                                </span>
                                <ChevronDownIcon size={18} />
                            </div>
                            <div className="relative">
                                <ul className="md:max-h-[360px] md:overflow-y-auto rounded-b-md ">
                                    {categories.map((category, index) => (
                                        <li
                                            key={index}
                                            className="group flex px-3 border-b last:border-b-0 items-center justify-between transition-all  text-neutral-600 hover:text-primary__color py-2.5 "
                                            onMouseEnter={() =>
                                                setHoveredCategory(index)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredCategory(null)
                                            }
                                        >
                                            <Link
                                                href={`/categories/products?id=${category.id}`}
                                                className="text-[13px]   font-medium w-full flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={
                                                            category.categoryImage
                                                        }
                                                        alt={category.name}
                                                        width={24}
                                                        height={24}
                                                        className="h-[24px] w-[24px] object-cover bg-cyan-100 border shadow-md rounded-sm"
                                                    />
                                                    <span>{category.name}</span>
                                                </div>
                                                {category.subcategories.length >
                                                    0 && (
                                                    <ChevronRightIcon className="h-4 group-hover:translate-x-1 duration-200 w-4 text-primary__color" />
                                                )}
                                            </Link>
                                            {category.subcategories.length >
                                                0 && (
                                                <div
                                                    className={`absolute hidden md:block left-full ml-[-15px] top-0 w-[250px] h-full bg-white rounded-md  p-2.5 z-50 shadow-2xl
                                                invisible opacity-0 -translate-x-4
                                                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                                                transition-all duration-300
                                                `}
                                                >
                                                    <ul className="">
                                                        {category.subcategories.map(
                                                            (
                                                                subcategory,
                                                                subIndex,
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        subcategory.id ||
                                                                        subIndex
                                                                    }
                                                                    className="flex items-center justify-between transition-all  text-neutral-600 hover:text-primary__color py-2.5 px-2 rounded"
                                                                    onMouseEnter={() =>
                                                                        setHoveredSubcategory(
                                                                            `${index}-${subIndex}`,
                                                                        )
                                                                    }
                                                                    onMouseLeave={() =>
                                                                        setHoveredSubcategory(
                                                                            null,
                                                                        )
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={`/sub-categories/products?category-id=${category.id}&child-id=${subcategory.id}`}
                                                                        className="text-[13px] font-medium w-full flex items-center justify-between"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Image
                                                                                src={
                                                                                    subcategory.subcategoryImage
                                                                                }
                                                                                alt={
                                                                                    subcategory.name
                                                                                }
                                                                                width={
                                                                                    24
                                                                                }
                                                                                height={
                                                                                    24
                                                                                }
                                                                                className="h-[24px] w-[24px] object-cover bg-cyan-100 border shadow-md rounded-sm"
                                                                            />
                                                                            {
                                                                                subcategory.name
                                                                            }
                                                                        </div>
                                                                        {subcategory
                                                                            .brands
                                                                            .length >
                                                                            0 && (
                                                                            <ChevronRightIcon className="h-4 w-4 text-primary__color" />
                                                                        )}
                                                                    </Link>
                                                                    {hoveredSubcategory ===
                                                                        `${index}-${subIndex}` &&
                                                                        subcategory
                                                                            .brands
                                                                            ?.length >
                                                                            0 && (
                                                                            <div className="absolute left-full ml-[-10px] top-0 w-[240px] h-full bg-white rounded-md shadow-2xl p-2 z-20 ">
                                                                                <ul>
                                                                                    {subcategory.brands.map(
                                                                                        (
                                                                                            brand,
                                                                                            brandIndex,
                                                                                        ) => (
                                                                                            <li
                                                                                                key={
                                                                                                    brand.id ||
                                                                                                    brandIndex
                                                                                                }
                                                                                                className="flex items-center justify-between transition-all  text-neutral-600 hover:text-primary__color py-2.5 px-2 rounded"
                                                                                            >
                                                                                                <Link
                                                                                                    href={`/child-sub-categories/products?category-id=${category.id}&child-id=${subcategory.id}&sub-child-id=${brand.id}`}
                                                                                                    className="text-[13px] font-medium w-full flex items-center justify-between"
                                                                                                >
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <Image
                                                                                                            src={
                                                                                                                brand.brandImage
                                                                                                            }
                                                                                                            alt={
                                                                                                                brand.name
                                                                                                            }
                                                                                                            width={
                                                                                                                24
                                                                                                            }
                                                                                                            height={
                                                                                                                24
                                                                                                            }
                                                                                                            className="h-[24px] w-[24px] object-cover bg-cyan-100 border shadow-md rounded-sm"
                                                                                                        />
                                                                                                        {
                                                                                                            brand.name
                                                                                                        }
                                                                                                    </div>
                                                                                                </Link>
                                                                                            </li>
                                                                                        ),
                                                                                    )}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button - Kept for mobile referencing, although logic was a bit mixed in original. focusing on desktop structure mainly. */}
                    {/* <div className="hidden  justify-between items-center mb-2">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-gray-700 bg-white p-2 rounded-md shadow-sm"
                        >
                            {menuOpen ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" />
                            )}
                        </button>
                    </div> */}
                    <div
                        className={`w-full lg:hidden  h-full z-40 relative rounded-md ${menuOpen ? "block" : "hidden"}`}
                    >
                        {/* Mobile Sidebar Content duplicated for simplicity or re-use logic */}
                        <div className="bg-white p-2.5 rounded-md border">
                            <ul className="max-h-[300px] overflow-y-auto">
                                {categories.map((category, index) => (
                                    <li key={index} className="py-2 border-b">
                                        <Link
                                            href={`/categories/products?id=${category.id}`}
                                            className="text-sm font-medium"
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Banner Area - Split 2/3 and 1/3 */}
                    <div className="w-full  lg:w-[calc(100%-250px)] max-h-[360px]  mb-4  !h-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 2/3 Section - Swiper */}
                            <div className="w-full  md:col-span-2 h-full   overflow-hidden md:rounded-md group">
                                <Swiper
                                    modules={[Autoplay, Pagination, Navigation]}
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    autoplay={{
                                        delay: 5000,
                                        disableOnInteraction: false,
                                    }}
                                    pagination={{ clickable: true }}
                                    // navigation={true}
                                    loop={true}
                                    className="w-full h-[150px] md:h-[220px] lg:h-[396px]"
                                >
                                    {sliderBanners?.map((banner) => (
                                        <SwiperSlide key={banner.id}>
                                            <Link
                                                href={banner?.url || "#"}
                                                className="w-full h-full block relative"
                                            >
                                                <Image
                                                    src={banner.image}
                                                    alt={
                                                        banner.title || "Banner"
                                                    }
                                                    fill
                                                    className="object-cover"
                                                />
                                            </Link>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            {/* 1/3 Section - Side Images */}
                            <div className=" md:col-span-1 w-full relative  min-h-[100px] md:min-h-[150px]  max-h-[396px] grid grid-cols-2  md:grid-cols-1 gap-2 ">
                                {sideBanners.map((item, idx) => (
                                    <Link
                                        key={idx}
                                        href={item.url || "/"}
                                        className="relative w-full !h-full block rounded-md overflow-hidden group"
                                    >
                                        <Image
                                            src={item.image}
                                            alt={item.title || "Side Banner"}
                                            fill
                                            className="object-cover !h-full group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
