"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    categoryGetAPI,
    childCategoryGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

// Skeleton Loading Components
const CategorySkeleton = () => (
    <div className="text-center  px-[10px] md:p-[10px] ">
        <div className="w-full  h-[56px] md:h-[106px] bg-gray-200  animate-pulse"></div>
        <div className="pt-[10px]">
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
        </div>
    </div>
);

const SubcategorySkeleton = () => (
    <div className="text-center">
        <div className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] bg-gray-200 mx-auto animate-pulse"></div>
        <div className="pt-[10px]">
            <div className="h-4 bg-gray-200  animate-pulse mx-auto w-3/4"></div>
        </div>
    </div>
);

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [childCategories, setChildCategories] = useState([]);
    const [loading, setLoading] = useState({
        main: true,
        subcategories: false,
    });
    const [imagePaths, setImagePaths] = useState({
        category_image_path: "",
        child_category_image_path: "",
        default_image_path: "",
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading((prev) => ({ ...prev, main: true }));
            const response = await categoryGetAPI();
            if (response.data.data) {
                setImagePaths({
                    category_image_path: response.data.data.category_image_path,
                    child_category_image_path:
                        response.data.data.child_category_image_path,
                    default_image_path: response.data.data.default_image_path,
                });

                if (response.data.data.all_categories) {
                    setCategories(response.data.data.all_categories);
                    if (response.data.data.all_categories.length > 0) {
                        handleCategorySelect(
                            response.data.data.all_categories[0],
                        );
                    }
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setLoading((prev) => ({ ...prev, main: false }));
        }
    };

    const handleCategorySelect = async (category) => {
        setSelectedCategory(category);
        try {
            setLoading((prev) => ({ ...prev, subcategories: true }));
            const response = await childCategoryGetAPI(category.id);
            if (response.data.data && response.data.data.all_child_categories) {
                setChildCategories(response.data.data.all_child_categories);
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setLoading((prev) => ({ ...prev, subcategories: false }));
        }
    };

    const getCategoryImage = (category) => {
        return category.image
            ? `${backendBaseURL}/${imagePaths.category_image_path}/${category.image}`
            : `${backendBaseURL}/${imagePaths.default_image_path}`;
    };

    const getChildCategoryImage = (childCategory) => {
        return childCategory.image
            ? `${backendBaseURL}/${imagePaths.child_category_image_path}/${childCategory.image}`
            : `${backendBaseURL}/${imagePaths.default_image_path}`;
    };

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px]  mx-auto ">
                <div className="bg-white rounded-md">
                    <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4 py-4 px-6">
                        <h5>All Categories</h5>
                    </div>
                    <div className="grid grid-cols-12 md:grid-cols-12  md:gap-4 ">
                        <div className="col-span-3  md:col-span-3 lg:col-span-3 xl:col-span-2 relative w-full h-full">
                            <div className="max-h-[100vh] overflow-y-auto border-r">
                                <ul className="space-y-6 md:px-2 lg:px-12 ">
                                    {loading.main
                                        ? Array(8)
                                              .fill(0)
                                              .map((_, index) => (
                                                  <li
                                                      key={`category-skeleton-${index}`}
                                                  >
                                                      <CategorySkeleton />
                                                  </li>
                                              ))
                                        : categories.map((category) => (
                                              <li
                                                  key={category.id}
                                                  className={`text-center transition px-2 md:p-2 md:rounded-md cursor-pointer ${
                                                      selectedCategory?.id ===
                                                      category.id
                                                          ? " border-primary__color  border-l-[3px] md:border"
                                                          : "border-l-[3px] border-transparent md:border md:hover:border md:hover:border-black/20 duration-300"
                                                  }`}
                                                  onClick={() =>
                                                      handleCategorySelect(
                                                          category,
                                                      )
                                                  }
                                              >
                                                  <div className="relative ">
                                                      <div className="w-full h-[56px] md:h-[106px]">
                                                          <Image
                                                              src={getCategoryImage(
                                                                  category,
                                                              )}
                                                              width={106}
                                                              height={106}
                                                              alt={
                                                                  category.title
                                                              }
                                                              className="w-full h-full object-cover "
                                                          />
                                                      </div>
                                                  </div>
                                                  <div className="pt-[10px]">
                                                      <h5 className="text-xs  md:text-sm font-medium">
                                                          {category.title}
                                                      </h5>
                                                  </div>
                                              </li>
                                          ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-span-9 md:col-span-9 lg:col-span-9 xl:col-span-10 px-2 md:px-0">
                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                                {loading.subcategories ? (
                                    Array(6)
                                        .fill(0)
                                        .map((_, index) => (
                                            <SubcategorySkeleton
                                                key={`subcategory-skeleton-${index}`}
                                            />
                                        ))
                                ) : (
                                    <>
                                        {selectedCategory && (
                                            <div className="group text-center ">
                                                <Link
                                                    href={`/categories/products?id=${selectedCategory.id}`}
                                                    className="relative "
                                                >
                                                    <div className="w-[70px] md:w-[100px] h-[70px] md:h-[100px]  mx-auto transition  ">
                                                        <Image
                                                            src={getCategoryImage(
                                                                selectedCategory,
                                                            )}
                                                            width={100}
                                                            height={100}
                                                            alt={
                                                                selectedCategory.title
                                                            }
                                                            className="w-full h-full object-cover "
                                                        />
                                                    </div>
                                                </Link>
                                                <div className="pt-[10px]">
                                                    <h5 className="text-xs md:text-sm font-semibold group-hover:text-primary__color transition duration-300">
                                                        View All
                                                    </h5>
                                                </div>
                                            </div>
                                        )}
                                        {childCategories.map(
                                            (childCategory) => (
                                                <div
                                                    key={childCategory.id}
                                                    className="text-center group"
                                                >
                                                    <Link
                                                        href={`/sub-categories/products?category-id=${selectedCategory.id}&child-id=${childCategory.id}`}
                                                        className="relative"
                                                    >
                                                        <div className="w-[70px] md:w-[100px] h-[70px] md:h-[100px]  mx-auto transition ">
                                                            <Image
                                                                src={getChildCategoryImage(
                                                                    childCategory,
                                                                )}
                                                                width={100}
                                                                height={100}
                                                                alt={
                                                                    childCategory.title
                                                                }
                                                                className="w-full h-full object-cover "
                                                            />
                                                        </div>
                                                    </Link>
                                                    <div className="pt-[10px]">
                                                        <h5 className="text-xs md:text-sm font-medium group-hover:text-primary__color transition duration-300">
                                                            {
                                                                childCategory.title
                                                            }
                                                        </h5>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
