"use client";
import { useState } from "react";
import Link from "next/link";
import {
    ChevronRightIcon,
    Bars3Icon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useHomeData } from "@/components/context/HomeContext";
import { ChevronDownIcon, List } from "lucide-react";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const SkeletonCategoryMenu = () => (
    <div className="relative rounded-md">
        <ul>
            {[...Array(20)].map((_, i) => (
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

export default function ProductSidebar() {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [hoveredSubcategory, setHoveredSubcategory] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const { homeData, loading } = useHomeData();

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
        return <SkeletonCategoryMenu />;
    }

    return (
        <>
            <div className="xl:hidden flex justify-between items-center my-1">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-gray-700"
                >
                    {menuOpen ? (
                        <XMarkIcon className="w-6 h-6" />
                    ) : (
                        <Bars3Icon className="w-6 h-6" />
                    )}
                </button>
                <span className="text-sm font-semibold">Categories</span>
            </div>
            <div
                className={`${menuOpen ? "block" : "hidden"} xl:block max-h-[100vh] sticky top-[130px] z-10`}
            >
                <div className=" gap-2 bg-primary__color rounded-t-md py-2 text-white px-2 justify-between font-semibold flex items-center">
                    <span className="flex items-center gap-2 ">
                        <List size={18} />
                        <span>Browse Category</span>
                    </span>
                    <ChevronDownIcon size={18} />
                </div>
                <div className="relative">
                    <ul>
                        {categories.map((category, index) => (
                            <li
                                key={index}
                                className="group flex px-3 border-b last:border-b-0 items-center justify-between transition-all text-neutral-600 hover:text-primary__color py-1.5 "
                                onMouseEnter={() => setHoveredCategory(index)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <Link
                                    href={`/categories/products?id=${category.id}`}
                                    className="text-[13px] font-medium w-full flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={category?.categoryImage}
                                            alt={category?.name}
                                            width={24}
                                            height={24}
                                            className="h-[24px] w-[24px] object-cover bg-cyan-100 border shadow-md rounded-sm"
                                        />
                                        <span>{category?.name}</span>
                                    </div>
                                    {category?.subcategories?.length > 0 && (
                                        <ChevronRightIcon className="h-4 w-4 text-primary__color group-hover:translate-x-1 duration-200" />
                                    )}
                                </Link>
                                {category?.subcategories?.length > 0 && (
                                    <div
                                        className="absolute hidden md:block left-full ml-[-5px] top-0 w-[250px] h-full bg-white rounded-md  p-2.5 z-50 shadow-2xl
                                                invisible opacity-0 -translate-x-4
                                                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                                                transition-all duration-300"
                                    >
                                        <ul>
                                            {category.subcategories.map(
                                                (subcategory, subIndex) => (
                                                    <li
                                                        key={
                                                            subcategory.id ||
                                                            subIndex
                                                        }
                                                        className="flex items-center justify-between transition-all  hover:text-primary__color text-neutral-600 py-1.5 px-2 rounded"
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
                                                                    width={24}
                                                                    height={24}
                                                                    className="h-[24px] w-[24px] object-cover bg-cyan-100 border shadow-md rounded-sm"
                                                                />
                                                                {
                                                                    subcategory.name
                                                                }
                                                            </div>
                                                            {subcategory.brands
                                                                .length > 0 && (
                                                                <ChevronRightIcon className="h-4 w-4 text-primary__color" />
                                                            )}
                                                        </Link>
                                                        {hoveredSubcategory ===
                                                            `${index}-${subIndex}` &&
                                                            subcategory.brands
                                                                ?.length >
                                                                0 && (
                                                                <div className="absolute left-full ml-[-10px] top-0 w-[240px] h-full bg-white rounded-md shadow-xl p-2 z-20">
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
                                                                                    className="flex items-center justify-between transition-all  hover:text-primary__color text-neutral-600 py-1.5 px-2 rounded"
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
        </>
    );
}
