"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/utility/Button";
import { twoFactorAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import logo from "@public/images/logo/favicon.jpeg";
import Link from "next/link";
import getImageUrl from "@/components/utility/getImageUrl";

export default function Otp() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const [appSettingsData, setAppSettingsData] = useState(null);
    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        const formattedValue = value.match(/.{1,2}/g)?.join(" - ") || value;
        setOtp(formattedValue);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanOtp = otp.replace(/ - /g, "");

        if (cleanOtp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const response = await twoFactorAPI(cleanOtp);
            if (response?.data?.message?.success) {
                response.data.message.success.forEach((msg) =>
                    toast.success(msg),
                );
                localStorage.setItem("two_factor_verified", "1");
                router.push("/user/dashboard");
            }
        } catch (error) {
            const errorMsg =
                error.response?.data?.message?.error?.[0] ||
                "Verification failed. Please try again.";
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
        <section className=" flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 overflow-hidden">
                {/* Header Section */}
                <h2 className="text-center text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                    2FA Verification
                </h2>

                <div className="flex items-center space-x-4 mb-8">
                    <div className="bg-gray-100 p-1.5 rounded-full shadow-sm w-[50px] h-[50px] flex items-center justify-center ">
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
                            Enter the verification code sent to your phone
                        </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* OTP Input Field */}
                    <div className="relative">
                        <label
                            htmlFor="otp"
                            className=" block left-4 bg-white  px-1.5 text-sm mb-1 font-medium  z-10"
                        >
                            Verification Code
                        </label>
                        <div className="relative">
                            <input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit code"
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
                        </div>
                        {error && (
                            <p className="mt-2 text-xs font-medium text-red-600 animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                        <Button
                            type="submit"
                            title={loading ? "Verifying..." : "Verify Code"}
                            variant="primary"
                            size="md"
                            className="w-full py-3.5 text-base font-bold shadow-lg shadow-primary__color/30 hover:shadow-primary__color/50 transition-all duration-300"
                            disabled={loading}
                        />
                    </div>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <Link
                        href="/user/auth/login"
                        className="text-sm font-semibold text-gray-400 hover:text-primary__color transition-colors uppercase tracking-widest"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </section>
    );
}
