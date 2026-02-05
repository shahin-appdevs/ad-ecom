"use client";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { useHomeData } from "@/components/context/HomeContext";
import { ArrowRightIcon } from "lucide-react";

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
                                <div className="bg-gray-100 rounded-md">
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
                                className="text-neutral-500 font-semibold flex items-center gap-1"
                            >
                                <span>View More</span>
                                <ArrowRightIcon size={18} className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div>
                        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {brands.map((brand, idx) => (
                                <Link
                                    key={idx}
                                    href={`/brands/products?id=${brand.id}`}
                                    className=" group/brand w-full hover:shadow-md transition-all duration-200 rounded-md "
                                >
                                    <div className="relative ">
                                        <div className="w-full h-[100px] px-4 flex items-center justify-center rounded-md  bg-gray-100">
                                            <div className="bg-white p-2  rounded-full w-[60px] h-[60px] shrink-0 flex items-center justify-center">
                                                <Image
                                                    src={
                                                        brand.image
                                                            ? `${backendBaseURL}/${brand_image_path}/${brand.image}`
                                                            : `${backendBaseURL}/${homeData.default_image_path}`
                                                    }
                                                    width={100}
                                                    height={100}
                                                    alt={brand.title || "Brand"}
                                                    className="w-[50px] group-hover/brand:scale-105 transition-all duration-200 object-contain rounded-full h-[50px]"
                                                />
                                            </div>
                                            <div className="w-full p-2">
                                                <h6 className="text-sm md:text-base lg:text-lg font-semibold">
                                                    {brand?.title}
                                                </h6>
                                                <div className="flex ">
                                                    <p
                                                        dangerouslySetInnerHTML={{
                                                            __html: brand?.description?.slice(
                                                                0,
                                                                30,
                                                            ),
                                                        }}
                                                    ></p>
                                                    {brand?.description
                                                        ?.length > 30 && (
                                                        <span>...</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <Swiper
                            slidesPerView={1}
                            spaceBetween={10}
                            autoplay={{
                                delay: 2000,
                                disableOnInteraction: false,
                            }}
                            breakpoints={{
                                0: { slidesPerView: 1 },
                                640: { slidesPerView: 1 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                                1280: { slidesPerView: 4 },
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
                                            <div className="w-full h-[100px] px-4 flex items-center justify-center rounded-md  bg-gray-100">
                                                <div className="bg-white p-2  rounded-full w-[60px] h-[60px] shrink-0 flex items-center justify-center">
                                                    <Image
                                                        src={
                                                            brand.image
                                                                ? `${backendBaseURL}/${brand_image_path}/${brand.image}`
                                                                : `${backendBaseURL}/${homeData.default_image_path}`
                                                        }
                                                        width={100}
                                                        height={100}
                                                        alt={
                                                            brand.title ||
                                                            "Brand"
                                                        }
                                                        className="w-[50px] object-contain  hover:scale-105 transition-all duration-200 rounded-md h-[50px]"
                                                    />
                                                </div>
                                                <div className="w-full p-2">
                                                    <h6 className="text-sm md:text-base lg:text-lg font-semibold">
                                                        {brand.title}
                                                    </h6>
                                                    <div className="flex ">
                                                        <p
                                                            dangerouslySetInnerHTML={{
                                                                __html: brand.description.slice(
                                                                    0,
                                                                    25,
                                                                ),
                                                            }}
                                                        ></p>
                                                        {brand.description
                                                            .length > 25 && (
                                                            <span>...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
}
