"use client"
// Packages
import { useState, useEffect } from "react";
import { dashboardGetSellerAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Images
import userProfile from "@public/images/user/userProfile.png";

export default function TopBar() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState([]);

    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "Dashboard";
    const formattedTitle = lastSegment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardGetSellerAPI();
                const userData = response?.data?.data?.user || [];
                setUserData(userData);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message?.error?.[0] || "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="bg-white__color rounded-[12px] sm:px-8 px-4 py-4 mb-4">
            <div className="flex items-center">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 md:gap-0">

                    {/* Title */}
                    {loading ? (
                        <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                    ) : (
                        <h5 className="font-semibold text-[16px]">{formattedTitle}</h5>
                    )}

                    {/* User Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-3">
                            {loading ? (
                                <div className="h-[42px] w-[42px] rounded-full bg-gray-200 animate-pulse" />
                            ) : (
                                <Image
                                    src={userData.userImage || userProfile}
                                    width={42}
                                    height={42}
                                    priority={true}
                                    quality={50}
                                    className="h-[42px] w-[42px] bg-[#F5F7FF] rounded-full object-cover"
                                    alt="User"
                                    onError={(e) => {
                                        e.target.src = userProfile.src;
                                    }}
                                />
                            )}
                            <div className="relative top-1">
                                {loading ? (
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                ) : (
                                    <>
                                        <h5 className="text-[14px] md:text-[16px] font-semibold flex gap-2 items-start leading-[15px]">
                                            {userData.username}
                                            <span className="relative top-[-2px] text-[10px] rounded-[4px] text-[#008B3E] bg-[#008b3e1c] py-[2px] px-2">
                                                {userData?.kycStringStatus?.value}
                                            </span>
                                        </h5>
                                        <span className="text-xs text-color__heading">
                                            {userData.full_mobile}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}