"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import { twoFactorAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

import logo from "@public/images/logo/favicon.jpeg";

export default function Otp() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

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
                sessionStorage.setItem("two_factor_verified", "1");
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

    return (
        <section className="min-h-[calc(100vh-200px)] py-8 xl:py-0 px-4 md:px-0 flex items-center justify-center">
            <div className="w-full max-w-md border rounded-md bg-white p-6">
                <h2 className="text-center text-lg font-semibold mb-5 border-b pb-4">
                    2fa Verification
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
                            Enter the verification code sent to your phone
                        </p>
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="relative">
                        <label
                            htmlFor="otp"
                            className="absolute -top-2.5 left-4 bg-white px-1 text-xs font-medium text-color__heading"
                        >
                            Verification Code
                        </label>
                        <input
                            id="otp"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={handleOtpChange}
                            maxLength={12}
                            className={`w-full px-4 pt-3 pb-3 text-sm rounded-md border ${error ? "border-red-500" : "border-gray-300"} focus:outline-none focus:border-primary__color shadow-sm`}
                        />
                        <ExclamationCircleIcon className="w-5 h-5 text-primary__color absolute right-3 top-3" />
                        {error && (
                            <p className="mt-1 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <div className="border-t pt-5">
                        <Button
                            type="submit"
                            title={loading ? "Verifying..." : "Verify"}
                            variant="primary"
                            size="md"
                            className="w-full"
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </section>
    );
}
