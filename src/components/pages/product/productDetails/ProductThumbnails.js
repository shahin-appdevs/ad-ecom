import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const ProductThumbnails = ({
    productData,
    selectedImage,
    handleThumbnailClick,
}) => {
    const allImages = [productData.image, ...productData.thumbnails].filter(
        Boolean,
    );

    if (allImages.length === 0) return null;

    return (
        <div className="relative mt-4 group px-10">
            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={10}
                slidesPerView={4}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                navigation={{
                    prevEl: ".prev-thumb",
                    nextEl: ".next-thumb",
                }}
                breakpoints={{
                    640: { slidesPerView: 4 },
                    768: { slidesPerView: 5 },
                }}
                className="rounded-md"
            >
                {allImages.map((thumb, idx) => (
                    <SwiperSlide key={idx}>
                        <div
                            className={`relative aspect-square border rounded-md cursor-pointer overflow-hidden transition-all duration-300 ${
                                (selectedImage || productData.image) === thumb
                                    ? "border-2 border-primary__color shadow-md scale-95"
                                    : "border-gray-200 hover:border-primary__color/50"
                            }`}
                            onClick={() => handleThumbnailClick(thumb)}
                        >
                            <Image
                                src={thumb}
                                alt={`${productData.title} thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Customized Navigation Buttons */}
            <button className="prev-thumb absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-100 shadow-lg rounded-full text-neutral-600 hover:text-primary__color hover:bg-slate-50 transition-all disabled:opacity-30">
                <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <button className="next-thumb absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white border border-gray-100 shadow-lg rounded-full text-neutral-600 hover:text-primary__color hover:bg-slate-50 transition-all disabled:opacity-30">
                <ChevronRight size={20} strokeWidth={2.5} />
            </button>

            {/* Subtle Bottom Glow to match your theme */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-primary__color/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
        </div>
    );
};

export default ProductThumbnails;
