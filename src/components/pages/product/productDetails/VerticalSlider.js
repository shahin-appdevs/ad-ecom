import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const VerticalProductGallery = ({
    productData,
    handleThumbnailClick,
    selectedImage,
}) => {
    const allImages = [productData.image, ...productData.thumbnails].filter(
        Boolean,
    );

    return (
        <div className="relative flex flex-col items-center group py-10 px-2">
            {/* Navigation Top */}
            <button className="prev-thumb absolute top-2 z-20 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 shadow-md rounded-full text-slate-400 hover:text-primary__color hover:border-primary__color transition-all duration-300 disabled:opacity-20">
                <ChevronUpIcon className="w-[18px] h-[18px] stroke-[2px]" />
            </button>

            {/* Swiper Container - Height is set to fit exactly 4 items + gaps */}
            <div className="h-[450px] w-20 md:w-24">
                <Swiper
                    direction="vertical"
                    modules={[Navigation, Autoplay]}
                    slidesPerView={4}
                    spaceBetween={12}
                    navigation={{
                        prevEl: ".prev-thumb",
                        nextEl: ".next-thumb",
                    }}
                    autoplay={{ delay: 4000 }}
                    className="h-full !py-2"
                >
                    {allImages.map((img, index) => (
                        <SwiperSlide key={index}>
                            <div
                                onClick={() => handleThumbnailClick(img)}
                                className={`relative aspect-square w-full rounded-lg cursor-pointer overflow-hidden border-2 transition-all duration-500 
                  ${
                      (selectedImage || productData.image) === img
                          ? "border-primary__color  scale-95"
                          : "border-transparent hover:border-blue-200"
                  }`}
                            >
                                <Image
                                    src={img}
                                    alt="Product thumbnail"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Navigation Bottom */}
            <button className="next-thumb absolute bottom-2 z-20 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 shadow-md rounded-full text-slate-400 hover:text-primary__color hover:border-primary__color transition-all duration-300 disabled:opacity-20">
                <ChevronDownIcon className="w-[18px] h-[18px] stroke-[2px]" />
            </button>
        </div>
    );
};

export default VerticalProductGallery;
