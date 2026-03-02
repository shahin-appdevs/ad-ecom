"use client";

import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function page() {
    return <TermsPage />;
}

const TermsPage = () => {
    return (
        <Suspense fallback={<Skeleton />}>
            <TermsSection />
        </Suspense>
    );
};

function TermsSection({}) {
    const [pageInfo, setPageInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const params = useSearchParams();
    const link = params.get("link");
    useEffect(() => {
        const fetchSingleCardTrxData = async () => {
            try {
                setIsLoading(true);
                const result = await footerInfoGetAPI(); // will be single card api

                const data = result?.data?.data?.useful_links?.find(
                    (item) => item?.slug === link,
                );
                setPageInfo(data);
            } catch (error) {
                handleApiError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSingleCardTrxData();
    }, [link]);

    const title = pageInfo?.title?.language?.en?.title;
    const details = pageInfo?.details?.language?.en?.details;

    if (isLoading || !title) return <Skeleton />;

    return (
        <>
            <section className="sm:pt-4">
                <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                    <div className="bg-white p-4 sm:p-6 md:p-10 rounded-md space-y-6">
                        <div className="flex items-center justify-center mb-4 bg-blue-50 py-4">
                            <h4>{title}</h4>
                        </div>
                        {details && (
                            <div
                                dangerouslySetInnerHTML={{ __html: details }}
                            ></div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

function Skeleton() {
    return (
        <div className="min-h-screen sm:pt-4 bg-gray-50  px-4 sm:px-6 lg:px-8">
            <div className="xl:max-w-[1530px] mx-auto">
                {/* Header Banner */}
                <div className="bg-white rounded-xl shadow overflow-hidden animate-pulse">
                    {/* Main Content */}
                    <div className="p-6 md:p-12 space-y-12">
                        <div className="px-6 py-2   text-center bg-gray-50 ">
                            <div className="h-10 bg-gray-200 rounded w-64 mx-auto my-2" />
                        </div>
                        {/* Section 1 */}
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-80" />
                            <div className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-full" />
                                <div className="h-5 bg-gray-200 rounded w-5/6" />
                                <div className="h-5 bg-gray-200 rounded w-11/12" />
                                <div className="h-5 bg-gray-200 rounded w-4/6" />
                                <div className="h-5 bg-gray-200 rounded w-9/12" />
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-96" />
                            <div className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-full" />
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                                <div className="h-5 bg-gray-200 rounded w-10/12" />
                                <div className="h-5 bg-gray-200 rounded w-7/12" />
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-72" />
                            <div className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-full" />
                                <div className="h-5 bg-gray-200 rounded w-11/12" />
                                <div className="h-5 bg-gray-200 rounded w-5/6" />
                                <div className="h-5 bg-gray-200 rounded w-8/12" />
                                <div className="h-5 bg-gray-200 rounded w-9/12" />
                            </div>
                        </div>

                        {/* Section 4 – COPPA */}
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-96" />
                            <div className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-full" />
                                <div className="h-5 bg-gray-200 rounded w-4/5" />
                                <div className="h-5 bg-gray-200 rounded w-10/12" />
                            </div>
                        </div>

                        {/* Section 5 – Changes */}
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-80" />
                            <div className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-11/12" />
                                <div className="h-5 bg-gray-200 rounded w-3/4" />
                            </div>
                        </div>

                        {/* Section 6 – Retention */}
                        <div className="space-y-6">
                            <div className="h-8 bg-gray-200 rounded w-96" />
                            <div className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-full" />
                                <div className="h-5 bg-gray-200 rounded w-5/6" />
                                <div className="h-5 bg-gray-200 rounded w-9/12" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
