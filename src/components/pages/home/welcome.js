"use client";
import { useHomeData } from "@/components/context/HomeContext";

export default function Welcome() {
    const { homeData, loading } = useHomeData();

    if (loading || !homeData) {
        return (
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    <div className="bg-gray-200/60 text-primary__color text-center font-bold py-1 pb-[10px] sm:pb-2  text-sm sm:text-base">
                        Loading...
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="text-primary__color bg-gray-200/60 font-bold py-1 pb-[10px] sm:pb-2 text-sm sm:text-base overflow-hidden">
                    <div className="whitespace-nowrap animate-marquee">
                        {homeData?.headline}
                    </div>
                </div>
            </div>
        </section>
    );
}
