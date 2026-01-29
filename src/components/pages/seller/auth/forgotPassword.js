"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/utility/Button";
import { forgotPasswordSellerAPI } from '@root/services/apiClient/apiClient';
import { toast } from "react-hot-toast";

import logo from "@public/images/logo/favicon.jpeg";

export default function ForgotPassword() {
    const [credentials, setCredentials] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await forgotPasswordSellerAPI({ credentials });

            const successMessage = response?.data?.message?.success?.[0];
            const errorMessage = response?.data?.message?.error?.[0];

            if (successMessage) {
                toast.success(successMessage);
                router.push(`/seller/auth/otp?phone=${encodeURIComponent(credentials)}`);
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

    return (
        <section className="min-h-[calc(100vh-200px)] py-8 xl:py-0 px-4 md:px-0 flex items-center justify-center">
            <div className="w-full max-w-md border rounded-md bg-white p-6">
                <h2 className="text-center text-lg font-semibold mb-5 border-b pb-4">Login with Us</h2>
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
                        <p className="text-sm text-gray-600">এ প্রবেশ করুন ফোন নাম্বার এর মাধ্যমে</p>
                    </div>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="relative">
                        <label
                            htmlFor="phone"
                            className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-color__heading"
                        >
                            Phone
                        </label>
                        <input
                            id="phone"
                            type="number"
                            placeholder="Enter Phone"
                            value={credentials}
                            onChange={(e) => setCredentials(e.target.value)}
                            className="w-full px-4 pt-3 pb-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-primary__color shadow-sm"
                            required
                        />
                        <ExclamationCircleIcon className="w-5 h-5 text-primary__color absolute right-3 top-3" />
                    </div>
                    <div className="border-t pt-5">
                        <Button
                            type="submit"
                            title={loading ? "Reseting..." : "Reset Password"}
                            variant="primary"
                            size="md"
                            className="w-full"
                            disabled={loading}
                        />
                    </div>
                </form>
                <div className="text-center text-color__heading font-semibold mt-4">Or</div>
                <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-3 mt-4 border-t pt-5">
                    <Link href="/seller/auth/login" className="bg-[#eef2ff] py-2 px-4 w-full text-center font-medium rounded-md text-primary__color hover:underline">
                        Log In
                    </Link>
                    <Link href="/seller/auth/register" className="bg-[#eef2ff] py-2 px-4 w-full text-center font-medium rounded-md text-primary__color hover:underline">
                        Create Account
                    </Link>
                </div>
            </div>
        </section>
    );
}