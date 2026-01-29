"use client";
import {
    ClipboardIcon,
    CheckIcon,
    BoltIcon,
    LinkIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { referralStatusGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

export default function ReferralSection() {
    const [loading, setLoading] = useState(true);
    const [referData, setReferData] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [copyUrlSuccess, setCopyUrlSuccess] = useState(false);

    const handleCopy = () => {
        navigator.clipboard
            .writeText(referData?.referral_code || "")
            .then(() => {
                setCopySuccess(true);
                toast.success("Copied");
                setTimeout(() => setCopySuccess(false), 2000);
            });
    };

    const handleCopyReferUrl = () => {
        const basepath = window.location.origin;

        console.log(basepath);
        navigator.clipboard
            .writeText(
                `${basepath}/user/auth/register?referral_code=${referData?.referral_code}` ||
                    "",
            )
            .then(() => {
                setCopyUrlSuccess(true);
                toast.success("Copied");
                setTimeout(() => setCopyUrlSuccess(false), 2000);
            });
    };

    useEffect(() => {
        referralStatusGetAPI()
            .then((response) => {
                setReferData(response.data.data);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.message?.error?.[0] ||
                        "Something went wrong",
                );
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-[12px] p-7 animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-[60px] h-[60px] rounded-full bg-gray-200" />
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="bg-white shadow p-4 rounded-lg text-center"
                        >
                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!referData) return null;

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white shadow-primary__shadow p-4 rounded-lg text-center">
                    <p className="text-sm font-medium">Total Refers</p>
                    <h4 className="text-xl font-bold">
                        {referData?.total_refers}
                    </h4>
                </div>
                <div className="bg-white shadow-primary__shadow p-4 rounded-lg text-center">
                    <p className="text-sm font-medium">Active Refers</p>
                    <h4 className="text-xl font-bold">
                        {referData?.active_refers}
                    </h4>
                </div>
                <div className="bg-white shadow-primary__shadow p-4 rounded-lg text-center">
                    <p className="text-sm font-medium">Referral Active Rate</p>
                    <h4 className="text-xl font-bold">
                        {referData?.referral_active_rate}%
                    </h4>
                </div>
                <div className="bg-white shadow-primary__shadow p-4 rounded-lg text-center">
                    <p className="text-sm font-medium mb-2">Referral Code</p>
                    <div className="flex justify-center items-center gap-2">
                        <h4 className="text-lg md:text-xl font-bold">
                            {referData?.referral_code}
                        </h4>
                        <button
                            title="Copy Referral Code"
                            onClick={handleCopy}
                            className="p-2 bg-[#F5F7FF] text-color__heading rounded"
                        >
                            {copySuccess ? (
                                <CheckIcon className="w-4 h-4 text-green-500" />
                            ) : (
                                <ClipboardIcon className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            title="Copy Referral Url"
                            onClick={handleCopyReferUrl}
                            className="p-2 bg-[#F5F7FF] text-color__heading rounded"
                        >
                            {copyUrlSuccess ? (
                                <CheckIcon className="w-4 h-4 text-green-500" />
                            ) : (
                                <LinkIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 flex justify-center items-center rounded bg-[#f5f7ff]">
                    <BoltIcon className="w-7 h-7 text-primary__color" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-primary__color">
                        {referData?.active_affiliate_plan?.name ||
                            "No Plan Active"}
                    </h2>
                    <p className="text-sm font-medium">
                        Joining Fee:{" "}
                        {referData?.active_affiliate_plan?.joining_fee}{" "}
                        {referData?.base_curr_symbol}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {referData?.active_affiliate_plan?.features?.map(
                    (feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white shadow-primary__shadow p-4 rounded-lg text-center"
                        >
                            <p className="font-medium capitalize mb-2">
                                {feature.name.replace(/_/g, " ")}
                            </p>
                            <p
                                className={`px-2 py-1 text-xs font-semibold rounded inline-block ${
                                    feature.value
                                        ? "bg-[#3f48cc1c] text-primary__color"
                                        : "bg-red-100 text-red-600"
                                }`}
                            >
                                {feature.value ? "Enabled" : "Disabled"}
                            </p>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}
