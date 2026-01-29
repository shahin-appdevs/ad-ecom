"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Components
import SideNav from "@/components/dashboard/partials/SideNav";
import TopBar from "@/components/dashboard/partials/TopBar";
import DynamicTitle from "@/components/shared/dynamicTitle";
import { dashboardGetAPI } from "@root/services/apiClient/apiClient";
import { DashboardProvider } from "@/components/context/DashboardContext";
import { WalletProvider } from "@/components/context/WalletContext";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token =
                localStorage.getItem("jwtToken") ||
                sessionStorage.getItem("jwtToken");

            if (!token) {
                router.push("/user/auth/login");
                return;
            }

            try {
                const response = await dashboardGetAPI();

                const userData = response.data.data.user;

                sessionStorage.setItem("sms_verified", userData.sms_verified);
                sessionStorage.setItem(
                    "two_factor_verified",
                    userData.two_factor_verified,
                );
                // sessionStorage.setItem(
                //     "active_virtual_system",
                //     response.data?.data?.active_virtual_system,
                // );

                setDashboardData(response.data.data);
                setIsLoading(false);
                const intendedUrl = localStorage.getItem("intendedUrl");
                if (intendedUrl) {
                    localStorage.removeItem("intendedUrl");
                    router.push(intendedUrl);
                }
            } catch (error) {
                if (error.response?.status === 400) {
                    const smsVerified = sessionStorage.getItem("sms_verified");
                    const twoFactorVerified = sessionStorage.getItem(
                        "two_factor_verified",
                    );

                    const emailVerified =
                        sessionStorage.getItem("email_verified");

                    if (emailVerified === "0") {
                        router.push("/user/auth/email-verify");
                    }

                    if (smsVerified === "0") {
                        router.push("/user/auth/phone-verify");
                    } else if (twoFactorVerified === "0") {
                        router.push("/user/auth/2fa");
                    } else {
                        toast.error(
                            "Session expired or invalid. Please login again.",
                        );
                        localStorage.removeItem("jwtToken");
                        sessionStorage.removeItem("jwtToken");
                        router.push("/user/auth/login");
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
            <WalletProvider>
                <div className="bg-[#F5F7FF] min-h-screen py-4 px-4">
                    <SideNav />
                    <div className="lg:ps-4 lg:ms-[250px]">
                        <TopBar />
                        {children}
                    </div>
                </div>
                <DynamicTitle />
            </WalletProvider>
        </DashboardProvider>
    );
}
