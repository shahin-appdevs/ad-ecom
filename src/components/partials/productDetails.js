"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FacebookIcon,
    InstagramIcon,
    XIcon,
    YoutubeIcon,
    WhatsappIcon,
} from "@/components/icons/CustomIcons";
import { HeartIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";
import Button from "@/components/utility/Button";
import { productDetailsGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

import chatUserOne from "@public/images/user/chatUserOne.png";
import chatUserTwo from "@public/images/user/chatUserTwo.png";
import chatUserThree from "@public/images/user/chatUserThree.png";

export default function ProductDetails({ productId, productSlug }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState("");
    const [showReviews, setShowReviews] = useState(false);
    const [reviews, setReviews] = useState([
        {
            id: 1,
            name: "John Doe",
            avatar: chatUserOne,
            rating: 5,
            comment:
                "Excellent product! Fits perfectly and the quality is amazing.",
            date: "2023-10-15",
        },
        {
            id: 2,
            name: "Jane Smith",
            avatar: chatUserTwo,
            rating: 4,
            comment:
                "Very good quality but the delivery took longer than expected.",
            date: "2023-09-28",
        },
    ]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);
                const response = await productDetailsGetAPI(
                    productId,
                    productSlug,
                );
                if (response.data.data && response.data.data.product) {
                    setProduct(response.data.data.product);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                setError(err.message || "Failed to fetch product details");
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId, productSlug]);

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (rating === 0 || !review.trim()) return;

        const newReview = {
            id: reviews.length + 1,
            name: "You",
            avatar: chatUserThree,
            rating,
            comment: review,
            date: new Date().toISOString().split("T")[0],
        };

        setReviews([...reviews, newReview]);
        setRating(0);
        setReview("");
    };

    const toggleReviews = () => {
        setShowReviews(!showReviews);
    };

    if (loading) {
        return (
            <div className="text-center py-10">Loading product details...</div>
        );
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!product) {
        return <div className="text-center py-10">Product not found</div>;
    }

    // Prepare product data for display
    const productData = {
        id: product.id,
        title: product.title,
        description: product.description,
        category: product.categories.join(", "),
        stock: product.product_quantity,
        sku: product.product_sku,
        newPrice: product.sale_price,
        oldPrice: product.list_price,
        discount: (product.list_price - product.sale_price).toFixed(2),
        image: product.main_image
            ? `${product.main_image_path}/${product.main_image}`
            : product.default_image_path,
        thumbnails: [
            product.image_1
                ? `${product.images_path}/${product.image_1}`
                : null,
            product.image_2
                ? `${product.images_path}/${product.image_2}`
                : null,
            product.image_3
                ? `${product.images_path}/${product.image_3}`
                : null,
            product.image_4
                ? `${product.images_path}/${product.image_4}`
                : null,
            product.image_5
                ? `${product.images_path}/${product.image_5}`
                : null,
            product.image_6
                ? `${product.images_path}/${product.image_6}`
                : null,
            product.image_7
                ? `${product.images_path}/${product.image_7}`
                : null,
        ].filter(Boolean), // Remove null values
        sizes: product.variants
            .filter((v) => v.type === "Size")
            .map((v) => v.title),
        colors: product.variants
            .filter((v) => v.type === "Color")
            .map((v) => v.title),
        features: product.features,
        variants: product.variant_items,
    };

    return (
        <section className="sm:pt-8">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white rounded-md p-6 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8">
                        <div className="md:col-span-4">
                            <div>
                                <div className="border rounded-lg overflow-hidden h-full aspect-square">
                                    <Image
                                        src={productData.image}
                                        alt={productData.title}
                                        width={600}
                                        height={800}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                {productData.thumbnails.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                                        {productData.thumbnails.map(
                                            (thumb, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-16 h-16 md:w-20 md:h-20 border border-primary__color rounded-md cursor-pointer"
                                                >
                                                    <Image
                                                        src={thumb}
                                                        alt={`${productData.title} thumbnail ${idx + 1}`}
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-full rounded-md object-cover"
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-12">
                                <div className="lg:col-span-7">
                                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">
                                        {productData.title}
                                    </h1>
                                    <div className="text-primary__color text-lg md:text-xl font-bold mb-2">
                                        ৳{productData.newPrice}{" "}
                                        {productData.oldPrice && (
                                            <span className="line-through text-gray-400 text-sm md:text-base font-medium ml-2">
                                                ৳{productData.oldPrice}
                                            </span>
                                        )}
                                    </div>
                                    {productData.sizes.length > 0 && (
                                        <div className="mb-4">
                                            <p className="font-semibold mb-2">
                                                SIZE
                                            </p>
                                            <div className="flex gap-2">
                                                {productData.sizes.map(
                                                    (size) => (
                                                        <button
                                                            key={size}
                                                            className="px-4 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-100 focus:bg-gray-200"
                                                        >
                                                            {size}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-4 mb-6">
                                        <Button
                                            title="Add to cart"
                                            variant="primary"
                                            size="md"
                                            className="w-full !bg-[#f5f5f5] !text-color__heading"
                                            onClick={(e) => {
                                                e.preventDefault();
                                            }}
                                        />
                                        <Button
                                            href="/checkout"
                                            title="Buy Now"
                                            variant="primary"
                                            size="md"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2 text-sm md:text-base text-gray-600 border-l-[5px] border-primary__color pl-3">
                                        <p>
                                            <strong>Category:</strong>{" "}
                                            <span className="text-primary__color font-medium">
                                                {productData.category}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>Stock:</strong>{" "}
                                            <span className="text-primary__color font-medium">
                                                {productData.stock}
                                            </span>
                                        </p>
                                        <p>
                                            <strong>SKU:</strong>{" "}
                                            <span className="text-primary__color font-medium">
                                                {productData.sku}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-3 md:gap-0">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Link href="/wishlist">
                                                <HeartIcon className="w-5 h-5" />
                                            </Link>
                                            <span className="text-sm md:text-base font-medium">
                                                Add to your favorite list
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-600">
                                            <span className="text-sm md:text-base font-semibold">
                                                Share:
                                            </span>
                                            <ul className="flex gap-3">
                                                <li className="">
                                                    <Link
                                                        href="/"
                                                        className="hover:text-primary__color"
                                                    >
                                                        <FacebookIcon className="w-5 h-5" />
                                                    </Link>
                                                </li>
                                                <li className="">
                                                    <Link
                                                        href="/"
                                                        className="hover:text-primary__color"
                                                    >
                                                        <InstagramIcon className="w-5 h-5" />
                                                    </Link>
                                                </li>
                                                <li className="">
                                                    <Link
                                                        href="/"
                                                        className="hover:text-primary__color"
                                                    >
                                                        <XIcon className="w-5 h-5" />
                                                    </Link>
                                                </li>
                                                <li className="">
                                                    <Link
                                                        href="/"
                                                        className="hover:text-primary__color"
                                                    >
                                                        <YoutubeIcon className="w-5 h-5" />
                                                    </Link>
                                                </li>
                                                <li className="">
                                                    <Link
                                                        href="/"
                                                        className="hover:text-primary__color"
                                                    >
                                                        <WhatsappIcon className="w-4 lg:w-5 h-4 lg:h-5" />
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-5 mt-8 lg:mt-0">
                                    <h6 className="border-b-4 pb-2 mb-3 inline-flex justify-center">
                                        Recent View
                                    </h6>
                                    <div className="border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="w-[47px] h-[60px]">
                                            <Image
                                                src={productData.image}
                                                alt={productData.title}
                                                width={47}
                                                height={60}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        </div>
                                        <div className="md:w-[calc(100%-65px)]">
                                            <h6 className="text-base font-medium mb-1">
                                                {productData.title}
                                            </h6>
                                            <div className="text-color__heading text-sm font-semibold mb-2">
                                                ৳{productData.newPrice}{" "}
                                                {productData.oldPrice && (
                                                    <>
                                                        <span className="line-through text-gray-400 text-sm font-medium ml-2">
                                                            ৳
                                                            {
                                                                productData.oldPrice
                                                            }
                                                        </span>
                                                        <span className="text-primary__color text-sm font-semibold ml-2">
                                                            ৳
                                                            {
                                                                productData.discount
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-12">
                        <div className="col-span-12">
                            <div className="mt-8 sm:mt-16">
                                <h6 className="mb-3">Product Description</h6>
                                <p className="text-color__heading text-sm md:text-base font-medium leading-[28px]">
                                    {productData.description}
                                </p>

                                {productData.features &&
                                    productData.features.length > 0 && (
                                        <div className="mt-6">
                                            <h6 className="mb-3">Features</h6>
                                            <ul className="list-disc pl-5 text-color__heading text-sm md:text-base font-medium leading-[28px]">
                                                {productData.features.map(
                                                    (feature, index) => (
                                                        <li key={index}>
                                                            <strong>
                                                                {feature.title}:
                                                            </strong>{" "}
                                                            {feature.value}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                <div className="mt-6 text-center">
                                    <button
                                        onClick={toggleReviews}
                                        className="flex items-center gap-2 text-primary__color font-semibold hover:underline"
                                    >
                                        {showReviews
                                            ? "Hide reviews"
                                            : "Show reviews"}
                                        <svg
                                            className={`w-4 h-4 transition-transform ${showReviews ? "rotate-180" : ""}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                {showReviews && (
                                    <div className="mt-12 border-t pt-8">
                                        <h3 className="text-lg md:text-xl font-bold mb-6">
                                            Customer Reviews
                                        </h3>
                                        <div className="space-y-6 mb-8">
                                            {reviews.map((item) => (
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
                                                                alt={item.name}
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
                                                                    {item.date}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-gray-700">
                                                                {item.comment}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="sm:bg-gray-50 sm:p-6 rounded-lg">
                                            <h4 className="text-lg font-semibold mb-4">
                                                Write a Review
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
                                                        Your Review
                                                    </label>
                                                    <textarea
                                                        id="review"
                                                        rows="4"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary__color focus:border-transparent"
                                                        placeholder="Share your thoughts about this product..."
                                                        value={review}
                                                        onChange={(e) =>
                                                            setReview(
                                                                e.target.value,
                                                            )
                                                        }
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="px-5 py-2 bg-primary__color text-white font-semibold rounded-md hover:bg-opacity-90 transition"
                                                >
                                                    Submit Review
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
