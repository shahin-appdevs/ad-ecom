"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { useHomeData } from "@/components/context/HomeContext";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const BrandSkeleton = () => {
    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-primary__color p-4 sm:rounded-md">
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
                                <div className="bg-[#f1f5f9] rounded-md">
                                    <div className="relative p-[10px]">
                                        <div className="w-full h-[80px] bg-gray-300 rounded-md animate-pulse"></div>
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

export default function Brand() {
    const { homeData, loading } = useHomeData();
    const { brands = [], brand_image_path } = homeData || {};

    if (loading) {
        return <BrandSkeleton />;
    }

    if (!brands || brands.length === 0) {
        return null;
    }

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white p-4 sm:rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="">Shop by Brand</h6>
                        <div>
                            <Link
                                href="/brands"
                                className="text-neutral-500 font-semibold"
                            >
                                See More →
                            </Link>
                        </div>
                    </div>
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={10}
                        autoplay={{ delay: 2000, disableOnInteraction: false }}
                        breakpoints={{
                            0: { slidesPerView: 3 },
                            640: { slidesPerView: 3 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 },
                            1280: { slidesPerView: 7 },
                        }}
                        modules={[Autoplay]}
                    >
                        {brands.map((brand) => (
                            <SwiperSlide key={brand.id}>
                                <Link
                                    href={`/brands/products?id=${brand.id}`}
                                    className="  w-full"
                                >
                                    <div className="relative ">
                                        <div className="w-full h-[100px] rounded-md">
                                            <Image
                                                src={
                                                    brand.image
                                                        ? `${backendBaseURL}/${brand_image_path}/${brand.image}`
                                                        : `${backendBaseURL}/${homeData.default_image_path}`
                                                }
                                                width={100}
                                                height={100}
                                                alt={brand.title || "Brand"}
                                                className="w-full h-full object-contain hover:scale-105 transition-all duration-200 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
