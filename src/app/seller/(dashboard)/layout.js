"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Components
import SideNav from "@/components/dashboard/partials/seller/SideNav";
import TopBar from "@/components/dashboard/partials/seller/TopBar";
import DynamicTitle from "@/components/shared/dynamicTitle";
import { dashboardGetSellerAPI } from "@root/services/apiClient/apiClient";
import { DashboardProvider } from "@/components/context/seller/DashboardContext";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("jwtSellerToken");

            if (!token) {
                router.push("/seller/auth/login");
                return;
            }

            try {
                const response = await dashboardGetSellerAPI();

                const userData = response.data.data.user;

                localStorage.setItem("sms_verified", userData.sms_verified);
                localStorage.setItem(
                    "two_factor_verified",
                    userData.two_factor_verified,
                );

                setDashboardData(response.data.data);
                setIsLoading(false);
            } catch (error) {
                if (error.response?.status === 400) {
                    const smsVerified = localStorage.getItem("sms_verified");
                    const twoFactorVerified = localStorage.getItem(
                        "two_factor_verified",
                    );
                    if (smsVerified === "0") {
                        router.push("/seller/auth/authorization");
                    } else if (twoFactorVerified === "0") {
                        router.push("/seller/auth/2fa");
                    } else {
                        toast.error(
                            "Session expired or invalid. Please login again.",
                        );
                        localStorage.removeItem("jwtSellerToken");
                        // sessionStorage.removeItem("jwtSellerToken");
                        router.push("/seller/auth/login");
                    }
                } else {
                    toast.error("Failed to load dashboard data");
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [router]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen absolute top-0 left-0 flex items-center justify-center bg-white z-[999]">
                <LoaderCircle className="inline-block w-7 h-auto animate-spin text-primary__color" />
            </div>
        );
    }

    return (
        <DashboardProvider value={{ dashboardData }}>
            <div className="bg-[#F5F7FF] min-h-screen py-4 px-4">
                <SideNav />
                <div className="lg:ps-4 lg:ms-[250px]">
                    <TopBar />
                    {children}
                </div>
            </div>
            <DynamicTitle />
        </DashboardProvider>
    );
}
