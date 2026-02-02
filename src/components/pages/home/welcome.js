"use client";
import { useHomeData } from "@/components/context/HomeContext";

export default function Welcome() {
    const { homeData, loading } = useHomeData();

    if (loading || !homeData) {
        return (
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    <div className="bg-primary__color text-white text-center font-bold py-1 pb-[10px] sm:pb-2 sm:rounded-md text-sm sm:text-base">
                        Loading...
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className=" text-red-500 bg-gray-50 font-bold py-1 pb-[10px] sm:pb-2 sm:rounded-md text-sm sm:text-base">
                    <marquee direction="left" className="mb-[-8px]">
                        {homeData?.headline}
                    </marquee>
                </div>
            </div>
        </section>
    );
}
