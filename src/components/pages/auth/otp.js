"use client";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Link } from "@/i18n/navigation";
import Button from "@/components/utility/Button";
import {
    resendforgotPasswordOtpAPI,
    forgotPasswordOtpAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import getImageUrl from "@/components/utility/getImageUrl";
import { useTranslations } from "next-intl";

export default function Otp() {
    const t = useTranslations("Auth.otp");

    const [otp, setOtp] = useState("");
    const [countdown, setCountdown] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const [phone, setPhone] = useState("");
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

    useEffect(() => {
        // Extract phone from URL when component mounts
        const searchParams = new URLSearchParams(window.location.search);
        const phoneParam = searchParams.get("phone");
        if (phoneParam) {
            setPhone(phoneParam);
        }
    }, []);

    // get app settings from session storage
    useEffect(() => {
        const appSettings = sessionStorage.getItem("appSettings");
        setAppSettingsData(appSettings ? JSON.parse(appSettings) : null);
    }, []);

    const handleResend = async () => {
        if (!canResend || loadingResend || !phone) return;

        setLoadingResend(true);
        setError("");

        try {
            const response = await resendforgotPasswordOtpAPI(phone);

            if (response?.data?.message?.success) {
                toast.success(
                    response.data.message.success[0] ||
                        t("verificationCodeResent"),
                );
                setCountdown(59);
                setCanResend(false);
                localStorage.setItem("otpCountdown", "59");
            } else {
                toast.error(t("failedToResendCode"));
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message?.error?.[0] ||
                error.response?.data?.message ||
                t("failedToResendVerificationCode");

            toast.error(errorMessage);

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
            setError(t("invalidOtp"));
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPasswordOtpAPI(phone, cleanOtp);
            if (response?.data?.message?.success) {
                response.data.message.success.forEach((msg) =>
                    toast.success(msg),
                );
                localStorage.removeItem("otpCountdown");
                router.push(
                    `/user/auth/password/reset?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(response.data.data.token)}`,
                );
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message?.error?.[0] ||
                t("verificationFailed");
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex items-center justify-center py-4 md:py-12 px-4 sm:px-6 lg:px-8 ">
            <div className="flex w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="w-full p-8 flex flex-col justify-center">
                    {/* Header Section */}
                    <h2 className="text-center text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                        {t("title")}
                    </h2>

                    {/* Logo Section */}
                    <div className="flex items-center gap-2 mb-8">
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
                        <div>
                            <h6 className="font-bold text-gray-900 tracking-tight">
                                {appSettingsData?.site_name}
                            </h6>
                            <p className="text-sm text-gray-500 leading-tight">
                                {t("subtitle")}
                            </p>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* OTP Input */}
                        <div className="group">
                            <label
                                htmlFor="otp"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                {t("verificationCode")}
                            </label>
                            <div className="relative">
                                <input
                                    id="otp"
                                    type="text"
                                    placeholder={t("enterCodePlaceholder")}
                                    value={otp}
                                    onChange={handleOtpChange}
                                    maxLength={12}
                                    className={`block w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary__color/50 transition-all duration-200 bg-gray-50 focus:bg-white ${
                                        error
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-gray-300 focus:border-primary__color"
                                    }`}
                                    required
                                />
                            </div>
                            {error && (
                                <p className="mt-2 text-xs font-medium text-red-600 animate-pulse">
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Resend Logic Section */}
                        <div className="text-sm text-center bg-gray-50 py-2 rounded-lg border border-dashed border-gray-200">
                            {canResend ? (
                                <p className="text-gray-600">
                                    {t("didntReceiveCode")}{" "}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="font-bold text-primary__color hover:underline focus:outline-none"
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
                                <p className="text-gray-500 italic">
                                    {t("resendIn")}{" "}
                                    <span className="font-bold text-primary__color not-italic">
                                        {countdown}s
                                    </span>
                                </p>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                title={loading ? t("verifying") : t("verify")}
                                variant="primary"
                                size="md"
                                className="w-full py-3.5 text-base font-bold shadow-lg shadow-primary__color/30 hover:shadow-primary__color/50 transition-all duration-300"
                                disabled={loading}
                            />
                        </div>
                    </form>

                    {/* Navigation Links */}
                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-600">
                                {t("backToLogin")}{" "}
                                <Link
                                    href="/user/auth/login"
                                    className="font-bold text-primary__color hover:underline"
                                >
                                    {t("logIn")}
                                </Link>
                            </p>
                            <Link
                                href="/user/auth/register"
                                className="text-sm font-bold text-gray-500 hover:text-primary__color transition-colors"
                            >
                                {t("createAccount")}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
