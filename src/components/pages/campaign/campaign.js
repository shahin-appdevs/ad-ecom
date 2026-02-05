"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { campaignsGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import ProductSidebar from "@/components/partials/ProductSidebar";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const CampaignSkeleton = () => (
    <div className="w-full sm:h-[175px] relative overflow-hidden rounded-md">
        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);

export default function Campaign() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagePaths, setImagePaths] = useState({
        main_image_path: "",
        default_image_path: "",
    });

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await campaignsGetAPI();

                if (response?.data?.data?.all_campaigns?.data) {
                    const publicCampaigns =
                        response.data.data.all_campaigns.data.filter(
                            (campaign) => !campaign.private,
                        );
                    setCampaigns(publicCampaigns);

                    setImagePaths({
                        main_image_path:
                            response.data.data.campaign_image_path || "",
                        default_image_path:
                            response.data.data.default_image_path || "",
                    });
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    return (
        <section className="py-4">
            <div className="xl:max-w-[1530px] container mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    {/* Sidebar */}
                    <div className="hidden sm:block p-2.5 xl:p-0 col-span-1 xl:col-span-2 bg-white rounded-md relative w-full h-full">
                        <ProductSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="col-span-1 xl:col-span-10 bg-white rounded-md relative w-full h-full p-4 sm:p-6 md:p-10">
                        {/* Modern Header */}
                        <div className="flex flex-col items-center mb-6 md:mb-8 text-center">
                            <span className="text-primary__color font-bold tracking-[0.2em] text-xs uppercase mb-3">
                                Explore
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                                All Campaigns
                            </h2>
                            <div className="w-12 h-1 bg-primary__color mt-4 rounded-full"></div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                {[...Array(6)].map((_, index) => (
                                    <CampaignSkeleton key={index} />
                                ))}
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-slate-500 font-medium">
                                    No campaigns available at the moment.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {campaigns.map((campaign) => (
                                    <Link
                                        href={`/campaigns/products?id=${campaign.id}`}
                                        key={campaign.id}
                                        className="group relative block w-full h-[200px] md:h-[230px] rounded-3xl overflow-hidden bg-slate-200 shadow-sm transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.25)] hover:-translate-y-1"
                                    >
                                        {/* Image */}
                                        <div className="absolute inset-0 transition-transform duration-1000 ease-out lg:group-hover:scale-110">
                                            <Image
                                                src={
                                                    campaign.image
                                                        ? `${backendBaseURL}/${imagePaths.main_image_path}/${campaign.image}`
                                                        : `${backendBaseURL}/${imagePaths.default_image_path}`
                                                }
                                                alt={campaign.title}
                                                className="w-full h-full object-cover"
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 lg:group-hover:opacity-80" />
                                        </div>

                                        {/* Content */}
                                        <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                                            <div className="lg:translate-y-3 lg:group-hover:translate-y-0 transition-transform duration-500">
                                                <h3 className="text-lg md:text-xl font-black text-white mb-2 tracking-tight">
                                                    {campaign.title}
                                                </h3>

                                                <div className="max-w-[90%] overflow-hidden">
                                                    <div
                                                        className="text-white/90 text-xs md:text-sm line-clamp-2 font-medium leading-relaxed transition-all duration-700 delay-100 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                                        dangerouslySetInnerHTML={{
                                                            __html: campaign.description,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Icon */}
                                        <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-500 opacity-100 scale-100 lg:opacity-0 lg:scale-50 lg:group-hover:opacity-100 lg:group-hover:scale-100">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2.5"
                                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
