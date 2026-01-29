"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
    HeartIcon as SolidHeartIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";
import { useCart } from "@/components/context/CartContext";
import { useWishlist } from "@/components/context/WishlistContext";

const ProductSkeleton = () => (
    <div className="flex items-start gap-4 border-b pb-4">
        <div className="w-20 h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);

export default function Wishlist() {
    const { wishlistItems, wishlistCount, updateWishlist } = useWishlist();
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        // Loading is handled by the WishlistContext
        setLoading(false);
    }, []);

    const removeFromWishlist = (id) => {
        const updatedWishlist = wishlistItems.filter((item) => item.id !== id);
        updateWishlist(updatedWishlist);
        toast.success("Item removed from wishlist");
    };

    const moveToCart = (item) => {
        addToCart({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            quantity: 1,
            base_curr_symbol: item.base_curr_symbol || "৳",
        });
        removeFromWishlist(item.id);
        toast.success("Item moved to cart");
    };

    return (
        <section className="py-4 sm:py-8 bg-white rounded-md max-w-6xl mx-auto px-4 sm:px-8 sm:mt-8">
            <h2 className="text-lg md:text-xl font-bold mb-4">
                {loading ? (
                    <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                ) : (
                    `My Wishlist (${wishlistCount} items)`
                )}
            </h2>

            {loading ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {wishlistItems.length > 0 ? (
                        wishlistItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 border-b pb-4"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={80}
                                    height={80}
                                    className="object-cover rounded h-[80px]"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-semibold">
                                                {item.title}
                                            </h5>
                                            <div className="mt-1 text-sm text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {item.base_curr_symbol ||
                                                            "৳"}
                                                        {parseFloat(
                                                            item.price,
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeFromWishlist(item.id)
                                            }
                                            className="text-gray-500 hover:text-red-600"
                                            aria-label="Remove item"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {/* <div className="flex gap-2 mt-3">
                                        <Button
                                            type="button"
                                            title="Move to Cart"
                                            variant="primary"
                                            size="sm"
                                            className="!bg-[#f5f5f5] !text-color__heading"
                                            onClick={() => moveToCart(item)}
                                        />
                                        <Button
                                            href={`/product/details?id=${item.id}`}
                                            title="View Details"
                                            variant="primary"
                                            size="sm"
                                        />
                                    </div> */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center">
                            <div className="flex justify-center mb-4">
                                <SolidHeartIcon className="h-12 w-12 text-gray-300" />
                            </div>
                            <p className="text-lg font-bold text-color__heading">
                                Your wishlist is empty
                            </p>
                            <p className="text-gray-600 mt-2">
                                Save your favorite items here for later
                            </p>
                            <Button
                                href="/"
                                title="Continue Shopping"
                                variant="primary"
                                size="md"
                                className="mt-4 mx-auto"
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
