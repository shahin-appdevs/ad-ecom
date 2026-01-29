"use client";
import { useState } from "react";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/utility/Button";
import { loginSellerAPI } from "@root/services/apiClient/apiClient";
import useAuthRedirect from "@/components/utility/useAuthSellerRedirect";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import logo from "@public/images/logo/favicon.jpeg";

export default function Login() {
    useAuthRedirect();
    const [credentials, setCredentials] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const submitLogin = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("credentials", credentials.trim());
            formData.append("password", password);

            const response = await loginSellerAPI(formData);

            if (response?.data?.data?.token) {
                const token = response.data.data.token;
                const userInfo = response.data.data.user;
                const successMessage =
                    response?.data?.message?.success?.[0] || "Login successful";

                setCredentials("");
                setPassword("");

                sessionStorage.setItem("jwtSellerToken", token);
                sessionStorage.setItem("userInfo", JSON.stringify(userInfo));

                if (userInfo.two_factor_status === 1) {
                    router.push("/seller/auth/2fa");
                } else {
                    router.push("/seller/dashboard");
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
        <section className="min-h-[calc(100vh-200px)] py-8 xl:py-0 px-4 md:px-0 flex items-center justify-center">
            <div className="w-full max-w-md border rounded-md bg-white p-6">
                <h2 className="text-center text-lg font-semibold mb-5 border-b pb-4">
                    Login with Us
                </h2>
                <div className="flex items-center space-x-3 mb-7">
                    <Image
                        src={logo}
                        alt="Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div>
                        <h6 className="font-semibold">JARA B2B.COM</h6>
                        <p className="text-sm text-gray-600">
                            এ প্রবেশ করুন ফোন নাম্বার এর মাধ্যমে
                        </p>
                    </div>
                </div>
                <form className="space-y-5" onSubmit={submitLogin}>
                    <div className="relative">
                        <label
                            htmlFor="phone"
                            className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-color__heading"
                        >
                            Phone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="Enter Phone"
                            value={credentials}
                            onChange={(e) => setCredentials(e.target.value)}
                            className="w-full px-4 pt-3 pb-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-primary__color shadow-sm"
                            required
                        />
                        <ExclamationCircleIcon className="w-5 h-5 text-primary__color absolute right-3 top-3" />
                    </div>
                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-color__heading"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 pt-3 pb-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-primary__color shadow-sm"
                            required
                        />
                        <ExclamationCircleIcon className="w-5 h-5 text-primary__color absolute right-3 top-3" />
                    </div>
                    <div className="border-t pt-5">
                        <Button
                            type="submit"
                            title={loading ? "Logging in..." : "Log In"}
                            variant="primary"
                            size="md"
                            className="w-full"
                        />
                    </div>
                </form>
                <div className="text-center text-color__heading font-semibold mt-4">
                    Or
                </div>
                <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-3 mt-4 border-t pt-5">
                    <Link
                        href="/seller/auth/password/forgot"
                        className="bg-[#eef2ff] py-2 px-4 w-full text-center font-medium rounded-md text-primary__color hover:underline"
                    >
                        Forgot Password?
                    </Link>
                    <Link
                        href="/seller/auth/register"
                        className="bg-[#eef2ff] py-2 px-4 w-full text-center font-medium rounded-md text-primary__color hover:underline"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </section>
    );
}
