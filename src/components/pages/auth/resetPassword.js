"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/utility/Button";
import { resetPasswordAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

import logo from "@public/images/logo/favicon.jpeg";
import getImageUrl from "@/components/utility/getImageUrl";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const phone = searchParams.get("phone");
    const [appSettingsData, setAppSettingsData] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await resetPasswordAPI(
                phone,
                token,
                password,
                passwordConfirmation,
            );
            response.data.message.success.forEach((msg) => {
                toast.success(msg);
            });
            router.push("/user/auth/login");
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.message &&
                error.response.data.message.error
            ) {
                error.response.data.message.error.forEach((msg) => {
                    toast.error(msg);
                });
            } else {
                toast.error("Failed to reset password.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const appSettings = sessionStorage.getItem("appSettings");
        setAppSettingsData(appSettings ? JSON.parse(appSettings) : null);
    }, []);

    return (
        <section className="flex items-center justify-center  py-4 md:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="w-full p-4 md:p-8 flex flex-col justify-center">
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
                        {/* New Password Input with Toggle */}
                        <div className="group">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter Password"
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary__color/50 focus:border-primary__color transition-all duration-200 bg-gray-50 focus:bg-white pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input with Toggle */}
                        <div className="group">
                            <label
                                htmlFor="confirm-password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={passwordConfirmation}
                                    onChange={(e) =>
                                        setPasswordConfirmation(e.target.value)
                                    }
                                    placeholder="Enter Password"
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary__color/50 focus:border-primary__color transition-all duration-200 bg-gray-50 focus:bg-white pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                title={loading ? "Confirming..." : "Confirm"}
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

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
