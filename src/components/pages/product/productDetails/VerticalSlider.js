import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronUp, ChevronDown } from "lucide-react";

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
        <div className="relative flex flex-col items-center group py-10 px-2 bg-white rounded-2xl shadow-sm border border-slate-100">
            {/* Navigation Top */}
            <button className="prev-thumb absolute top-2 z-20 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 shadow-md rounded-full text-slate-400 hover:text-primary__color hover:border-primary__color transition-all duration-300 disabled:opacity-20">
                <ChevronUp size={18} />
            </button>

            {/* Swiper Container - Height is set to fit exactly 4 items + gaps */}
            <div className="h-[420px] w-20 md:w-24">
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
                    className="h-full"
                >
                    {allImages.map((img, index) => (
                        <SwiperSlide key={index}>
                            <div
                                onClick={() => handleThumbnailClick(img)}
                                className={`relative aspect-square w-full rounded-xl cursor-pointer overflow-hidden border-2 transition-all duration-500 
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
            <button className="next-thumb absolute bottom-2 z-20 w-8 h-8 flex items-center justify-center bg-white border border-slate-200 shadow-md rounded-full text-slate-400 hover:text-cyan-500 hover:border-cyan-200 transition-all duration-300 disabled:opacity-20">
                <ChevronDown size={18} />
            </button>

            {/* Glow Effect */}
            <div className="absolute inset-y-10 -right-1 w-[1px] bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>
    );
};

export default VerticalProductGallery;
