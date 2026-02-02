"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/components/context/CartContext";

import product21 from "@public/images/product/product21.jpg";
import product22 from "@public/images/product/product22.png";
import product23 from "@public/images/product/product23.jpg";
import product24 from "@public/images/product/product24.png";
import product25 from "@public/images/product/product25.jpg";
import product26 from "@public/images/product/product26.jpg";
import product27 from "@public/images/product/product27.jpg";
import product28 from "@public/images/product/product28.jpg";
import product29 from "@public/images/product/product29.png";
import product30 from "@public/images/product/product30.jpeg";
import product31 from "@public/images/product/product31.jpeg";
import product32 from "@public/images/product/product32.jpeg";
import { ArrowRightIcon } from "lucide-react";

const products = [
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product21,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product22,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product23,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product24,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product25,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product26,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product27,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product28,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product29,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product30,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product31,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
    {
        slug: "new-arrival-luxury-party-panjabi-misty-color",
        image: product32,
        title: "New Arrival luxury Party Panjabi Misty Color",
        discount: "13.1%",
        newPrice: "৳2,650",
        oldPrice: "৳3,050",
    },
];

export default function BagJewellery() {
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
                <div className="bg-white p-4 pt-0 sm:pt-4 sm:rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h6>Bag & Jewellery</h6>
                        <div>
                            <Link
                                href="/"
                                className="text-[#4b5563] font-semibold flex items-center gap-1"
                            >
                                <span>View More</span>
                                <ArrowRightIcon size={18} className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                                        <Link href={`/product/${product.slug}`}>
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
                                                    {states[index].quantity}
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
                </div>
            </div>
        </section>
    );
}
