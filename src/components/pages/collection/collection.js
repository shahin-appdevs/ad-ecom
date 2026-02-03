"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collectionsGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const CollectionSkeleton = () => (
    <div className="w-full sm:h-[175px] relative overflow-hidden rounded-md">
        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);

export default function Collection() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagePaths, setImagePaths] = useState({
        main_image_path: "",
        default_image_path: "",
    });

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const response = await collectionsGetAPI();

                if (response?.data?.data?.all_collections?.data) {
                    const publicCollections =
                        response.data.data.all_collections.data.filter(
                            (collection) => !collection.private,
                        );
                    setCollections(publicCollections);

                    setImagePaths({
                        main_image_path:
                            response.data.data.campaign_image_path || "",
                        default_image_path:
                            response.data.data.default_image_path || "",
                    });
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    return (
        <section className="py-4">
            <div className="xl:max-w-[1530px] container mx-auto px-4 sm:px-6 bg-white rounded-lg py-6 lg:py-12">
                {/* Modern Header: Clean & Centered */}
                <div className="flex flex-col items-center mb-10 md:mb-14 text-center">
                    <span className="text-primary__color font-bold tracking-[0.2em] text-xs uppercase mb-3">
                        Limited Time
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        All Offers
                    </h2>
                    <div className="w-12 h-1 bg-primary__color mt-4 rounded-full"></div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {[...Array(8)].map((_, index) => (
                            <div
                                key={index}
                                className="w-full h-[200px] md:h-[250px] lg:h-[240px] xl:h-[270px] bg-slate-200 animate-pulse rounded-3xl"
                            />
                        ))}
                    </div>
                ) : collections.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-slate-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-medium">
                            No collections available at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {collections.map((collection) => (
                            <Link
                                href={`/collections/products?id=${collection.id}`}
                                key={collection.id}
                                className="group relative block w-full h-[220px] md:h-[260px] lg:h-[240px] xl:h-[270px] rounded-3xl overflow-hidden bg-slate-200 shadow-sm transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] hover:-translate-y-1"
                            >
                                {/* Background Image with Zoom Effect */}
                                <div className="absolute inset-0 transition-transform duration-1000 ease-out lg:group-hover:scale-110">
                                    <Image
                                        src={
                                            collection.image
                                                ? `${backendBaseURL}/${imagePaths.main_image_path}/${collection.image}`
                                                : `${backendBaseURL}/${imagePaths.default_image_path}`
                                        }
                                        alt={collection.title}
                                        className="w-full h-full object-cover"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                    {/* Intelligent Gradient Overlay - Slightly darker on mobile for text visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent transition-opacity duration-500 lg:group-hover:opacity-80" />
                                </div>

                                {/* Content Area */}
                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                                    <div className="lg:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-lg md:text-xl font-black text-white mb-2 tracking-tight">
                                            {collection.title}
                                        </h3>

                                        {/* Description: Visible on sm/md, Hover on lg+ */}
                                        <div className="max-w-[90%] overflow-hidden">
                                            <div
                                                className="text-white/90 text-xs md:text-sm line-clamp-2 font-medium leading-relaxed transition-all duration-700 delay-100 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                                dangerouslySetInnerHTML={{
                                                    __html: collection.description,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button: Always visible on sm/md, Hover on lg+ */}
                                <div className="absolute top-5 right-5 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-500 opacity-100 scale-100 lg:opacity-0 lg:scale-50 lg:group-hover:opacity-100 lg:group-hover:scale-100">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
