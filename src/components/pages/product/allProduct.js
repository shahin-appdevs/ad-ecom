"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "@headlessui/react";
import {
    PlusIcon,
    MinusIcon,
    ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";
import ProductSidebar from "@/components/partials/ProductSidebar";
import Button from "@/components/utility/Button";

import product1 from "@public/images/product/product1.jpg";
import product2 from "@public/images/product/product2.jpg";
import product3 from "@public/images/product/product3.jpg";
import product4 from "@public/images/product/product4.jpg";
import product5 from "@public/images/product/product5.jpg";
import product6 from "@public/images/product/product6.jpg";
import product7 from "@public/images/product/product7.jpg";
import product8 from "@public/images/product/product8.jpg";

const sortOptions = [
    "Default",
    "Newest Products",
    "Most Popular",
    "Highest Rating",
    "Lowest Price",
    "Highest Price",
];

const products = [
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product1,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product2,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product3,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product4,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product5,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product6,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product7,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product8,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product1,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product2,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product3,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product4,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
];

export default function AllProduct() {
    const [selectedSort, setSelectedSort] = useState("Default");
    const { incrementCart, decrementCart } = useCart();
    const [states, setStates] = useState(
        products.map(() => ({
            showQuantity: false,
            quantity: 1,
        })),
    );

    const handleToggle = (index) => {
        setStates((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, showQuantity: true } : item,
            ),
        );
        incrementCart();
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
    };

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="hidden sm:block  xl:p-0  col-span-1 xl:col-span-2 bg-white rounded-md p-2.5 relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            <div className="flex items-center justify-between gap-3 sm:gap-0 mb-4">
                                <h6>All Products</h6>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {products.map((product, index) => (
                                    <div
                                        key={index}
                                        className="bg-[#f1f5f9] rounded-md hover:shadow-md transition-shadow"
                                    >
                                        <div className="relative p-[10px]">
                                            <div className="w-full h-[150px] sm:h-[215px]">
                                                <Image
                                                    src={product.image}
                                                    width={100}
                                                    height={100}
                                                    alt="Product"
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                            <span className="absolute top-[8px] right-[8px] text-xs bg-primary__color text-white font-semibold py-[1px] px-[4px] rounded-[4px] transform rotate-[-3deg]">
                                                {product.discount} off
                                            </span>
                                        </div>
                                        <div className="p-[10px] pt-[5px]">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-base font-semibold text-primary__color">
                                                    {product.newPrice}
                                                </span>
                                                <span className="text-xs text-[#4b5563] line-through">
                                                    {product.oldPrice}
                                                </span>
                                            </div>
                                            <h5 className="text-sm font-normal text-[#4b5563] mb-2 sm:whitespace-normal truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                <Link
                                                    href={`/product/${product.slug}`}
                                                >
                                                    {product.title}
                                                </Link>
                                            </h5>
                                            <div className="relative">
                                                {!states[index].showQuantity ? (
                                                    <button
                                                        onClick={() =>
                                                            handleToggle(index)
                                                        }
                                                        className="bg-white shadow-sm text-gray-800 text-xs px-4 py-2 rounded-md font-medium flex items-center justify-between w-full"
                                                    >
                                                        <PlusIcon className="h-5 w-5" />
                                                        <span className="flex items-center gap-2">
                                                            Buy Now{" "}
                                                            <span className="hidden sm:block">
                                                                →
                                                            </span>
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full bg-white shadow-sm rounded-md overflow-hidden">
                                                        <button
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    index,
                                                                    1,
                                                                )
                                                            }
                                                            className="text-gray-800 px-4 py-2"
                                                        >
                                                            <MinusIcon className="h-4 w-4" />
                                                        </button>
                                                        <span className="px-3 py-1 bg-white text-gray-800">
                                                            {
                                                                states[index]
                                                                    .quantity
                                                            }
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                increaseQuantity(
                                                                    index,
                                                                    1,
                                                                )
                                                            }
                                                            className="text-gray-800 px-4 py-2"
                                                        >
                                                            <PlusIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-10">
                                <Button
                                    title="Load More"
                                    variant="primary"
                                    size="md"
                                    className="!px-8"
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
