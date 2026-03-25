"use client";

import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function UsefulLinkPage() {
    return (
        <Suspense fallback={<Skeleton />}>
            <UsefulLinkSection />
        </Suspense>
    );
}

function UsefulLinkSection() {
    const [pageInfo, setPageInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useSearchParams();
    const link = params.get("link");
    const lang = useLocale();

    useEffect(() => {
        const fetchLinkData = async () => {
            try {
                setIsLoading(true);
                const result = await footerInfoGetAPI();

                const data = result?.data?.data?.useful_links?.find(
                    (item) => item?.slug === link,
                );

                setPageInfo(data || null);
            } catch (error) {
                console.error("Error fetching useful link data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (link) {
            fetchLinkData();
        } else {
            setIsLoading(false);
        }
    }, [link]);

    const title = pageInfo?.title?.language[lang]?.title || "";
    const details = pageInfo?.details?.language[lang]?.details;
    const coverImage =
        "/images/useful-links/useful-links-bg.webp" ||
        "https://placehold.co/1920x400/e2e8f0/475569?text=Useful+Link";

    if (isLoading) return <Skeleton />;

    if (!pageInfo && !isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
                No information found.
            </div>
        );
    }

    return (
        <section className="w-full">
            {/* Top of the page: Background image with page title */}
            <div
                className=" w-full h-[200px] lg:h-[300px] 2xl:h-[400px] bg-gray-200 relative flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `url(${coverImage})` }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
                <h1 className="relative z-10 text-white text-3xl md:text-5xl font-bold text-center px-4 drop-shadow-lg">
                    {title}
                </h1>
            </div>

            {/* Bottom of image: Text fetched from api with HTML render */}
            <div className="container mx-auto px-4 py-10 md:py-16">
                <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm">
                    {details ? (
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: details }}
                        ></div>
                    ) : (
                        <p className="text-center text-gray-500">
                            No details available.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

function Skeleton() {
    return (
        <div className="w-full animate-pulse">
            {/* Banner Skeleton */}
            <div className="w-full h-[300px] md:h-[400px] bg-gray-300 flex items-center justify-center">
                <div className="h-10 bg-gray-400 rounded w-1/3 md:w-1/4"></div>
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto px-4 py-10 md:py-16">
                <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm space-y-6">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        </div>
    );
}
