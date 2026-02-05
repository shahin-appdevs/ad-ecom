"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductSidebar from "@/components/partials/ProductSidebar";
import { stallGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const StallSkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(10)].map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-md">
                    <div className="flex items-center justify-center mb-2">
                        <div className="w-full h-[100px] sm:h-[120px] rounded-md overflow-hidden bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="text-center relative top-[-20px]">
                        <div className="inline-flex bg-white rounded-full py-1.5 px-5">
                            <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-2 mt-[-5px]">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-12 h-12 rounded-md overflow-hidden bg-gray-200 animate-pulse"
                            ></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function Stall() {
    const [stallData, setStallData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStallData = async () => {
            setLoading(true);
            try {
                const response = await stallGetAPI();
                setStallData(response.data.data);
            } catch (error) {
                toast.error(
                    error.response?.data?.message?.error?.[0] ||
                        "Failed to fetch stalls",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchStallData();
    }, []);

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="hidden xl:p-0 sm:block col-span-1 xl:col-span-2 bg-white rounded-md p-2.5 relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            <div className="flex items-center justify-between mb-4">
                                <h5>Stall</h5>
                            </div>
                            {loading ? (
                                <StallSkeleton />
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {stallData?.stalls?.map((stall, index) => (
                                        <div
                                            className="bg-[#f5f5f5] rounded-md p-4 shadow hover:shadow-md transition-shadow"
                                            key={index}
                                        >
                                            <div className="flex items-center justify-center mb-2">
                                                <div className="w-full h-[100px] sm:h-[120px] rounded-md overflow-hidden">
                                                    <Image
                                                        src={
                                                            stall.stall_image
                                                                ? `${backendBaseURL}/${stall_image_path}/${stall.stall_image}`
                                                                : `${backendBaseURL}/${stallData.default_image_path}`
                                                        }
                                                        alt={stall.stall_name}
                                                        width={50}
                                                        height={50}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-center relative top-[-20px]">
                                                <h6 className="text-center font-semibold inline-flex text-[10px] sm:text-sm bg-white rounded-full py-1.5 px-5 hover:text-primary__color transition-colors">
                                                    <Link
                                                        href={`/stalls/details?id=${stall.id}`}
                                                    >
                                                        {stall.stall_name}
                                                    </Link>
                                                </h6>
                                            </div>
                                            <div className="flex justify-center gap-2 mt-[-5px]">
                                                {stall.products
                                                    .slice(0, 3)
                                                    .map((product, i) => (
                                                        <Link
                                                            href={`/product/details?id=${product.id}`}
                                                            key={i}
                                                            className="w-12 h-12 rounded-md overflow-hidden bg-white"
                                                        >
                                                            <Image
                                                                src={
                                                                    product.main_image
                                                                        ? `${backendBaseURL}/${product_image_path}/${product.main_image}`
                                                                        : `${backendBaseURL}/${stallData.default_image_path}`
                                                                }
                                                                alt={
                                                                    product.title
                                                                }
                                                                width={48}
                                                                height={48}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </Link>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
