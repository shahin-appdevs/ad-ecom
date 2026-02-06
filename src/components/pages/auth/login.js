"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/utility/Button";
import {
    basicDataGetAPI,
    loginAPI,
    sendOtpAPI,
} from "@root/services/apiClient/apiClient";
import useAuthRedirect from "@/components/utility/useAuthRedirect";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import logo from "@public/images/logo/favicon.jpeg";
import ReCAPTCHA from "react-google-recaptcha";
import { handleApiError } from "@/components/utility/handleApiError";
import getImageUrl from "@/components/utility/getImageUrl";

export default function Login() {
    useAuthRedirect();
    const [credentials, setCredentials] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [recaptcha, setRecaptcha] = useState(null);
    const [loginBasicData, setLoginBasicData] = useState(null);
    const [appSettingsData, setAppSettingsData] = useState(null);

    const recaptchaRef = useRef();

    const recaptchaChange = (e) => {
        setRecaptcha(e);
    };

    // get app settings from session storage
    useEffect(() => {
        const appSettings = sessionStorage.getItem("appSettings");
        setAppSettingsData(appSettings ? JSON.parse(appSettings) : null);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const result = await basicDataGetAPI();
                setLoginBasicData(result?.data?.data);
            } catch (error) {
                handleApiError(error, "Failed to fetch basic data");
            }
        })();
    }, []);

    const submitLogin = async (e) => {
        e.preventDefault();

        if (loginBasicData?.google_recaptcha && !recaptcha) {
            toast.error("Please verify reCAPTCHA");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("credentials", credentials.trim());
            formData.append("password", password);
            formData.append("g-recaptcha-response", recaptcha);

            const response = await loginAPI(formData);

            if (response?.data?.data?.token) {
                const token = response.data.data.token;
                const userInfo = response.data.data.user;
                const successMessage =
                    response?.data?.message?.success?.[0] || "Login successful";

                setCredentials("");
                setPassword("");

                localStorage.setItem("jwtToken", token);
                localStorage.setItem("userInfo", JSON.stringify(userInfo));
                localStorage.setItem(
                    "email_verified",
                    userInfo?.email_verified,
                );
                localStorage.setItem("sms_verified", userInfo?.sms_verified);
                localStorage.setItem(
                    "two_factor_verified",
                    userInfo?.two_factor_verified,
                );

                if (userInfo?.email_verified === 0) {
                    await sendOtpAPI();
                    router.push("/user/auth/email-verify");
                } else if (userInfo?.sms_verified === 0) {
                    // await resendAuthorizationCodeAPI();
                    router.push("/user/auth/phone-verify");
                } else if (userInfo.two_factor_status === 1) {
                    router.push("/user/auth/2fa");
                } else {
                    router.replace("/user/dashboard");
                }

                toast.success(successMessage);
            } else {
                toast.error("Login failed. Please try again.");
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message?.error?.[0] ||
                err.response?.data?.message ||
                "Login failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className=" flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Side: Brand/Visual Area (Hidden on mobile) */}
                <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        {/* Abstract decorative circle */}
                        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary__color mix-blend-multiply filter blur-3xl opacity-50"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-500 mix-blend-multiply filter blur-3xl opacity-50"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm w-[50px] h-[50px] flex items-center justify-center">
                                <Image
                                    src={getImageUrl(
                                        appSettingsData?.site_logo,
                                        appSettingsData?.logo_image_path,
                                    )}
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="rounded-md"
                                />
                            </div>
                            <span className="text-white text-xl font-bold tracking-wide">
                                {appSettingsData?.site_name}
                            </span>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-400 mb-6 leading-tight">
                            Welcome Back <br /> to Your Space
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Access your personalized dashboard, track orders,
                            and manage your business efficiently.
                        </p>
                    </div>

                    <div className="relative z-10 text-sm text-blue-200/60">
                        © {new Date().getFullYear()}{" "}
                        {appSettingsData?.site_name}. All rights reserved.
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="md:hidden flex items-center space-x-3 mb-8 justify-center">
                        <Image
                            src={getImageUrl(
                                appSettingsData?.site_logo,
                                appSettingsData?.logo_image_path,
                            )}
                            alt="Logo"
                            width={48}
                            height={48}
                            className="rounded-full shadow-md"
                        />
                    </div>

                    <div className="text-center md:text-left mb-10">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Sign In
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            এ প্রবেশ করুন ফোন নাম্বার এর মাধ্যমে
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={submitLogin}>
                        {/* Phone Input */}
                        <div className="group">
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Phone or Email
                            </label>
                            <div className="relative">
                                <input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter Phone or Email"
                                    value={credentials}
                                    onChange={(e) =>
                                        setCredentials(e.target.value)
                                    }
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary__color/50 focus:border-primary__color transition-all duration-200 bg-gray-50 focus:bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-1">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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
                            {/* Forgot Password Link - Moved Here */}
                            <div className="flex justify-end mt-2">
                                <Link
                                    href="/user/auth/password/forgot"
                                    className="text-sm font-medium text-primary__color hover:text-primary__color/80 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        {loginBasicData?.google_recaptcha && (
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={
                                    loginBasicData?.google_recaptcha_site_key
                                }
                                onChange={recaptchaChange}
                            />
                        )}

                        <div className="pt-2">
                            <Button
                                type="submit"
                                title={loading ? "Logging in..." : "Log In"}
                                variant="primary"
                                size="md"
                                className="w-full py-3.5 text-base shadow-lg shadow-primary__color/30 hover:shadow-primary__color/50 transition-all duration-300"
                            />
                        </div>
                    </form>

                    {/* Bottom Register Link - Replaced Divider/Grid */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/user/auth/register"
                                className="font-bold text-primary__color hover:underline transition-all"
                            >
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
