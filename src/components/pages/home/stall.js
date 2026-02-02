"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { useHomeData } from "@/components/context/HomeContext";
import { ArrowRightIcon } from "lucide-react";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const StallSkeleton = () => {
    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white p-4 sm:rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={10}
                        breakpoints={{
                            0: { slidesPerView: 3 },
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                            1280: { slidesPerView: 7 },
                        }}
                    >
                        {[...Array(7)].map((_, index) => (
                            <SwiperSlide key={index}>
                                <div className="bg-[#f5f5f5] rounded-md p-4 shadow">
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
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default function Stall() {
    const { homeData, loading } = useHomeData();
    const { stalls = [], stall_image_path } = homeData || {};

    if (loading) {
        return <StallSkeleton />;
    }

    if (!stalls || stalls.length === 0) {
        return null;
    }

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white p-4 sm:rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h6>Stalls</h6>
                        <Link
                            href="/stalls"
                            className="font-semibold flex items-center gap-1"
                        >
                            <span>View More</span>
                            <ArrowRightIcon size={18} className="w-4 h-4" />
                        </Link>
                    </div>

                    <Swiper
                        slidesPerView={1}
                        spaceBetween={10}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                            1280: { slidesPerView: 6 },
                            1480: { slidesPerView: 7 },
                        }}
                        modules={[Autoplay]}
                    >
                        {stalls.map((stall, index) => (
                            <SwiperSlide key={index}>
                                <div className="bg-[#f5f5f5] rounded-md shadow hover:shadow-md pb-4 transition-shadow">
                                    <div className="flex items-center justify-center mb-2 ">
                                        <div className="w-full h-[100px] sm:h-[120px] rounded-t-md overflow-hidden">
                                            <Image
                                                src={
                                                    stall.stall_image
                                                        ? `${backendBaseURL}/${stall_image_path}/${stall.stall_image}`
                                                        : `${backendBaseURL}/${homeData.default_image_path}`
                                                }
                                                alt={stall.stall_name}
                                                width={50}
                                                height={50}
                                                className="object-cover w-full h-full rounded-t-md"
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
                                                                : `${backendBaseURL}/${homeData.default_image_path}`
                                                        }
                                                        alt={product.title}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
