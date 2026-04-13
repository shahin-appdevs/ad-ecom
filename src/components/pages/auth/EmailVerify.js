"use client";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
    ExclamationCircleIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import {
    resendAuthorizationCodeAPI,
    emailVerifyAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

import getImageUrl from "@/components/utility/getImageUrl";
import { useTranslations } from "next-intl";

export default function EmailVerify() {
    const t = useTranslations("Auth.emailVerify");
    const [otp, setOtp] = useState("");
    const [countdown, setCountdown] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingResend, setLoadingResend] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const [appSettingsData, setAppSettingsData] = useState(null);

    // Initialize countdown from localStorage if available
    useEffect(() => {
        const storedCountdown = localStorage.getItem("otpCountdown");
        if (storedCountdown) {
            const remaining = parseInt(storedCountdown, 10);
            if (remaining > 0) {
                setCountdown(remaining);
                setCanResend(false);
            } else {
                setCanResend(true);
            }
        }
    }, []);

    // Handle countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0 && !canResend) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    const newCount = prev - 1;
                    localStorage.setItem("otpCountdown", newCount.toString());
                    return newCount;
                });
            }, 1000);
        } else if (countdown === 0) {
            setCanResend(true);
            localStorage.removeItem("otpCountdown");
        }
        return () => clearInterval(timer);
    }, [countdown, canResend]);

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        const formattedValue = value.match(/.{1,2}/g)?.join(" - ") || value;
        setOtp(formattedValue);
        setError(""); // Clear error when user types
    };

    const handleResend = async () => {
        if (!canResend || loadingResend) return;

        setLoadingResend(true);
        setError("");

        try {
            const response = await resendAuthorizationCodeAPI();

            if (response?.data?.message?.success) {
                // Success case
                toast.success(
                    response.data.message.success[0] || t("resendSuccess"),
                );
                setCountdown(59);
                setCanResend(false);
                localStorage.setItem("otpCountdown", "59");
            } else {
                // Handle unexpected response format
                toast.error(t("resendFailed"));
            }
        } catch (error) {
            // Handle different error formats
            const errorMessage =
                error.response?.data?.message?.error?.[0] ||
                error.response?.data?.message ||
                t("resendFailedLater");

            toast.error(errorMessage);

            // If it's an authentication error, redirect to login
            if (error.response?.status === 401) {
                router.push("/user/auth/login");
            }
        } finally {
            setLoadingResend(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanOtp = otp.replace(/ - /g, "");

        if (cleanOtp.length !== 6) {
            setError(t("errorInvalid"));
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            formData.append("code", cleanOtp);

            const response = await emailVerifyAPI(formData);

            if (response?.data?.message?.success) {
                response.data.message.success.forEach((msg) =>
                    toast.success(msg),
                );
                localStorage.removeItem("otpCountdown");
                localStorage.setItem("email_verified", "1");
                const isPhoneVerified = localStorage.getItem("sms_verified");

                if (isPhoneVerified === "0") {
                    router.push("/user/auth/phone-verify");
                } else {
                    router.push("/user/dashboard");
                }
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message?.error?.[0] || t("errorFailed");
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const appSettings = sessionStorage.getItem("appSettings");
        setAppSettingsData(appSettings ? JSON.parse(appSettings) : null);
    }, []);

    return (
        <section className="flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 overflow-hidden">
                {/* Header Section */}
                <h2 className="text-center text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                    {t("title")}
                </h2>

                {/* Logo Section */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-gray-100 p-1.5 rounded-full shadow-sm w-[50px] h-[50px] flex items-center justify-center">
                        <Image
                            src={getImageUrl(
                                appSettingsData?.site_logo,
                                appSettingsData?.logo_image_path,
                            )}
                            alt="Logo"
                            width={44}
                            height={44}
                            className="rounded-full !bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <h6 className="font-bold text-gray-900 tracking-tight">
                            {appSettingsData?.site_name}
                        </h6>
                        <p className="text-sm text-gray-500 leading-tight">
                            {t("subtitle")}
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* OTP Input Field - Matching 2FA Style */}
                    <div className="relative">
                        <label
                            htmlFor="otp"
                            className="block left-4 bg-white px-1.5 text-sm mb-1 font-medium z-10"
                        >
                            {t("label")}
                        </label>
                        <div className="relative">
                            <input
                                id="otp"
                                type="text"
                                placeholder={t("placeholder")}
                                value={otp}
                                onChange={handleOtpChange}
                                maxLength={12}
                                className={`w-full px-4 bg-gray-50 py-3.5 text-base font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 
                        ${
                            error
                                ? "border-red-500 focus:ring-red-100"
                                : "border-gray-300 focus:border-primary__color focus:ring-primary__color/20"
                        } shadow-sm`}
                            />
                            {/* Kept the icon logic but positioned it for the new input height */}
                            <div className="absolute right-3 top-3.5 pointer-events-none">
                                <ExclamationCircleIcon
                                    className={`w-5 h-5 ${error ? "text-red-500" : "text-transparent"}`}
                                />
                            </div>
                        </div>
                        {error && (
                            <p className="mt-2 text-xs font-medium text-red-600 animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Resend Logic (Preserved) */}
                    <div className="text-sm text-center">
                        {canResend ? (
                            <p className="text-gray-600">
                                {t("noCode")}{" "}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="font-bold text-primary__color hover:underline focus:outline-none transition-all"
                                    disabled={loadingResend}
                                >
                                    {loadingResend ? (
                                        <span className="inline-flex items-center">
                                            <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
                                            {t("sending")}
                                        </span>
                                    ) : (
                                        t("resendCode")
                                    )}
                                </button>
                            </p>
                        ) : (
                            <p className="text-gray-500">
                                {t("resendIn")}{" "}
                                <span className="font-bold text-primary__color">
                                    {countdown}s
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                        <Button
                            type="submit"
                            title={loading ? t("btnVerifying") : t("btnVerify")}
                            variant="primary"
                            size="md"
                            className="w-full py-3.5 text-base font-bold shadow-lg shadow-primary__color/30 hover:shadow-primary__color/50 transition-all duration-300"
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </section>
    );
}
