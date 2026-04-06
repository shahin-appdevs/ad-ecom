"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

// Internal Imports
import { Link, useRouter } from "@/i18n/navigation";
import { paymentLinkListAPI } from "@root/services/apiClient/apiClient";
import { handleApiError } from "@/components/utility/handleApiError";

const ShareLinkSkeleton = () => {
    return (
        <div className="bg-white rounded-[12px] p-7 max-w-2xl mx-auto animate-pulse">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="mb-6">
                <div className="h-4 w-1/4 bg-gray-200 rounded mb-3"></div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                </div>
            </div>
            <div className="h-11 w-full bg-gray-200 rounded-md"></div>
        </div>
    );
};

export default function ShareLinkPage() {
    // Hooks
    const t = useTranslations("Dashboard.wallet.paymentLink.shareLinkPage");
    const router = useRouter();
    const { locale } = useParams();

    // States
    const [link, setLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [localShareLink, setLocalShareLink] = useState("");

    useEffect(() => {
        const fetchLink = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");

            try {
                setIsLoading(true);
                const response = await paymentLinkListAPI();
                const foundLink = response.data?.data?.payment_links?.find(
                    (l) => l.token === token,
                );

                if (foundLink) {
                    setLink(foundLink);
                    // Include the locale in the shared URL so the recipient sees the right language
                    const localUrl = `${window.location.origin}/${locale}/payment-link?token=${token}`;
                    setLocalShareLink(localUrl);
                    localStorage.setItem("intendedUrl", localUrl);
                } else {
                    toast.error(t("errorNotFound"));
                    router.push("/user/payment/link");
                }
            } catch (error) {
                handleApiError(error, t("errorFetch"));
                router.push("/user/payment/link");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLink();
    }, [router, locale, t]);

    const copyToClipboard = () => {
        if (!localShareLink) return;

        navigator.clipboard.writeText(localShareLink);
        setCopied(true);
        toast.success(t("toastCopy"));

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    if (isLoading) return <ShareLinkSkeleton />;
    if (!link) return null;

    return (
        <div className="bg-white rounded-[12px] p-7 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold mb-3">{t("title")}</h4>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    {t("label")}
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={localShareLink}
                        readOnly
                        className="flex-1 p-2 border rounded-md bg-gray-50 text-sm"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="p-2 bg-primary__color text-white rounded-md hover:opacity-90 transition shadow-sm"
                    >
                        {copied ? (
                            <CheckIcon className="h-5 w-5" />
                        ) : (
                            <ClipboardIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    href="/user/payment/link/create"
                    className="px-4 py-2.5 flex-1 text-center font-semibold bg-primary__color text-white rounded-md hover:opacity-90 transition"
                >
                    {t("btnCreate")}
                </Link>
                <Link
                    href={`/user/payment/link/edit?id=${link.id}`}
                    className="px-4 py-2.5 flex-1 text-center font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                    {t("btnEdit")}
                </Link>
            </div>
        </div>
    );
}
