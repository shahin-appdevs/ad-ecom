"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/utility/Button";
import { forgotPasswordAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

import logo from "@public/images/logo/favicon.jpeg";
import getImageUrl from "@/components/utility/getImageUrl";

export default function ForgotPassword() {
    const [credentials, setCredentials] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [appSettingsData, setAppSettingsData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await forgotPasswordAPI({ credentials });

            const successMessage = response?.data?.message?.success?.[0];
            const errorMessage = response?.data?.message?.error?.[0];

            if (successMessage) {
                toast.success(successMessage);
                router.push(
                    `/user/auth/otp?phone=${encodeURIComponent(credentials)}`,
                );
            } else if (errorMessage) {
                toast.error(errorMessage);
            } else {
                toast.error("Something went wrong.");
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message?.error?.[0] ||
                err.response?.data?.message ||
                err.message ||
                "Request failed.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const appSettings = sessionStorage.getItem("appSettings");
        setAppSettingsData(appSettings ? JSON.parse(appSettings) : null);
    }, []);

    return (
        <section className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
            <div className="flex w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Side: Brand/Visual Area (Matching Login) */}

                {/* Right Side: Reset Password Form */}
                <div className="w-full  p-8  flex flex-col justify-center">
                    {/* Mobile Logo */}
                    {/* Header Section */}
                    <h2 className="text-center text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                        Reset Password
                    </h2>

                    {/* Logo Section */}
                    <div className="flex items-center space-x-4 mb-8">
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
                                এ প্রবেশ করুন ফোন নাম্বার এর মাধ্যমে
                            </p>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Phone Input Styled like Login */}
                        <div className="group">
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Phone Number
                            </label>
                            <div className="relative">
                                <input
                                    id="phone"
                                    type="number"
                                    placeholder="Enter Phone"
                                    value={credentials}
                                    onChange={(e) =>
                                        setCredentials(e.target.value)
                                    }
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary__color/50 focus:border-primary__color transition-all duration-200 bg-gray-50 focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                title={
                                    loading ? "Reseting..." : "Reset Password"
                                }
                                variant="primary"
                                size="md"
                                className="w-full py-3.5 text-base font-bold shadow-lg shadow-primary__color/30 hover:shadow-primary__color/50 transition-all duration-300"
                                disabled={loading}
                            />
                        </div>
                    </form>

                    {/* Navigation Links - Matching Login Style */}
                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-600">
                                Remember your password?{" "}
                                <Link
                                    href="/user/auth/login"
                                    className="font-bold text-primary__color hover:underline"
                                >
                                    Log In
                                </Link>
                            </p>
                            <Link
                                href="/user/auth/register"
                                className="text-sm font-bold text-gray-500 hover:text-primary__color transition-colors"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
