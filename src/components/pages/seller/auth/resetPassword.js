"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Button from "@/components/utility/Button";
import { resetPasswordSellerAPI } from '@root/services/apiClient/apiClient';
import { toast } from "react-hot-toast";

import logo from "@public/images/logo/favicon.jpeg";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const phone = searchParams.get("phone");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await resetPasswordSellerAPI(phone, token, password, passwordConfirmation);
            response.data.message.success.forEach((msg) => {
                toast.success(msg);
            });
            router.push("/seller/auth/login");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message && error.response.data.message.error) {
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
                            htmlFor="password"
                            className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-color__heading"
                        >
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            className="w-full px-4 pt-3 pb-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-primary__color shadow-sm"
                        />
                        <ExclamationCircleIcon className="w-5 h-5 text-primary__color absolute right-3 top-3" />
                    </div>
                    <div className="relative">
                        <label
                            htmlFor="password"
                            className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-color__heading"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Enter Password"
                            className="w-full px-4 pt-3 pb-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:border-primary__color shadow-sm"
                        />
                        <ExclamationCircleIcon className="w-5 h-5 text-primary__color absolute right-3 top-3" />
                    </div>
                    <div className="border-t pt-5">
                        <Button
                            type="submit"
                            title={loading ? "Confirming..." : "Confirm"}
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

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}