"use client";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
// Components
import SideNav from "@/components/dashboard/partials/SideNav";
import TopBar from "@/components/dashboard/partials/TopBar";
import DynamicTitle from "@/components/shared/dynamicTitle";
import { dashboardGetAPI } from "@root/services/apiClient/apiClient";
import { DashboardProvider } from "@/components/context/DashboardContext";
import { WalletProvider } from "@/components/context/WalletContext";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useLocale, useTranslations } from "next-intl";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    const t = useTranslations("DashboardLayout");
    const lang = useLocale();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        const fetchData = async () => {
            const token =
                localStorage.getItem("jwtToken") ||
                localStorage.getItem("jwtToken");
            const payLinkToken = searchParams.get("token");

            if (!token) {
                router.push(
                    payLinkToken
                        ? `/user/auth/login?pay_link_token=${payLinkToken}`
                        : "/user/auth/login",
                );
                return;
            }

            try {
                const response = await dashboardGetAPI(lang);

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

                    const emailVerified =
                        localStorage.getItem("email_verified");

                    if (emailVerified === "0") {
                        router.push("/user/auth/email-verify");
                    }

                    if (smsVerified === "0") {
                        router.push("/user/auth/phone-verify");
                    } else if (twoFactorVerified === "0") {
                        router.push("/user/auth/2fa");
                    } else {
                        toast.error(t("sessionExpired"));
                        localStorage.removeItem("jwtToken");
                        router.push("/user/auth/login");
                    }
                } else {
                    toast.error(t("failedToLoadDashboardData"));
                    setIsLoading(false);
                }
            }
        };

        fetchData();
    }, [router]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen absolute top-0 left-0 flex items-center justify-center bg-white z-[999]">
                <ArrowPathIcon className="inline-block w-7 h-auto animate-spin text-primary__color" />
            </div>
        );
    }

    return (
        <DashboardProvider value={{ dashboardData }}>
            <WalletProvider>
                <div className="bg-[#F5F7FF] min-h-screen">
                    <SideNav />
                    <div className=" lg:ms-[250px]">
                        <TopBar />
                        <div className="px-4">{children}</div>
                    </div>
                </div>
                <DynamicTitle />
            </WalletProvider>
        </DashboardProvider>
    );
}
