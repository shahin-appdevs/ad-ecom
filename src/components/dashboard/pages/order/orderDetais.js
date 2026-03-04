"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    productOrderDetailsGetAPI,
    productOrderDownloadInvoiceGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import {
    CubeIcon,
    BanknotesIcon,
    ArrowUpTrayIcon,
    CalendarDaysIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    CloudArrowDownIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import { useTranslations } from "next-intl";

const formatAmount = (value) => {
    if (!value) return "0.00";
    return parseFloat(value).toFixed(2);
};

function SkeletonCard() {
    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm space-y-4"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            {[1, 2, 3].map((j) => (
                                <div
                                    key={j}
                                    className="h-4 w-full bg-gray-200 rounded animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function OrderDetailsPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const t = useTranslations("Dashboard.ecommerce.orderDetails");

    useEffect(() => {
        if (!orderId) return;
        const fetchOrderDetails = async () => {
            try {
                const response = await productOrderDetailsGetAPI(orderId);
                setOrder(response.data.data.order_info);
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message?.error?.[0] ||
                    t("failedLoad");
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    const handleDownloadInvoice = async () => {
        if (!orderId) return;
        setDownloading(true);
        try {
            const res = await productOrderDownloadInvoiceGetAPI(orderId);
            const downloadLink = res.data.data.download_link;
            toast.success(res.data.message.success?.[0] || t("invoiceReady"));

            // Trigger file download
            const a = document.createElement("a");
            a.href = downloadLink;
            a.target = "_blank";
            a.download = "";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            const errorMessage =
                error.response?.data?.message?.error?.[0] ||
                t("failedDownload");
            toast.error(errorMessage);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return <SkeletonCard />;
    }

    if (!order) {
        return <div className="p-6">{t("noDetails")}</div>;
    }

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex items-center justify-between mb-4 gap-2">
                <h5 className="font-bold  tracking-tight text-sm md:text-lg flex gap-2">
                    <span>{t("orderId")}</span>
                    <span dir="ltr" className="font-bold">
                        #{order?.order_id}
                    </span>
                </h5>
                <Button
                    Icon={CloudArrowDownIcon}
                    title={
                        downloading ? t("downloading") : t("downloadInvoice")
                    }
                    size="sm"
                    onClick={handleDownloadInvoice}
                    disabled={downloading}
                    className={"text-xs md:text-base"}
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <CubeIcon className="w-6 h-6 text-indigo-500" />
                        <h5 className="font-semibold">{t("orderSummary")}</h5>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                <span className="font-semibold">
                                    {t("customer")}
                                </span>{" "}
                                {order?.customer_info?.name}
                            </p>
                            <p className="flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                <span className="font-semibold">
                                    {t("phone")}
                                </span>{" "}
                                {order?.customer_info?.phone}
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="font-semibold">
                                    {t("address")}
                                </span>{" "}
                                {order?.customer_info?.address}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <BanknotesIcon className="w-4 h-4" />
                                <span className="font-semibold">
                                    {t("productTotal")}{" "}
                                </span>
                                <span className="font-semibold">
                                    ৳ {formatAmount(order?.product_total)}
                                </span>
                            </p>
                            <p className="flex items-center gap-2">
                                <ArrowUpTrayIcon className="w-4 h-4" />
                                <span className="font-semibold">
                                    {t("deliveryFee")}{" "}
                                </span>
                                <span className="font-semibold">
                                    ৳ {formatAmount(order?.delivery_fee)}
                                </span>
                            </p>
                            <p className="flex items-center gap-2">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span className="font-semibold">
                                    {t("date")}{" "}
                                </span>
                                <span>
                                    {new Date(
                                        order?.created_at,
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <BanknotesIcon className="w-6 h-6 text-green-500" />
                        <h2 className="text-lg font-semibold">
                            {t("paymentInformation")}
                        </h2>
                    </div>
                    <div className="space-y-2">
                        <p>
                            <span className="font-semibold">
                                {t("grandTotal")}
                            </span>{" "}
                            <span className="font-semibold">
                                ৳ {formatAmount(order?.grand_total)}
                            </span>
                        </p>
                        <p>
                            <span className="font-semibold">{t("profit")}</span>{" "}
                            <span className="font-semibold">
                                ৳ {formatAmount(order?.profit_amount)}
                            </span>
                        </p>
                        <p>
                            <span className="font-semibold">{t("status")}</span>
                            <span
                                className={`ml-2 px-3 py-1 text-xs font-medium rounded-md ${
                                    order?.status === "completed"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : order?.status === "placed"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-700"
                                }`}
                            >
                                {order?.status}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowUpTrayIcon className="w-6 h-6 text-blue-500" />
                        <h2 className="text-lg font-semibold">
                            {t("logisticsInformation")}
                        </h2>
                    </div>
                    <div className="space-y-2">
                        <p>
                            <span className="font-semibold">
                                {t("deliveryMethod")}
                            </span>{" "}
                            {order?.delivery_method}
                        </p>
                        <p>
                            <span className="font-semibold">
                                {t("transferStatus")}
                            </span>{" "}
                            {order?.logistics_info?.transfer_status
                                ? t("transferred")
                                : order?.logistics_info?.transfer_false_text}
                        </p>
                        {order?.logistics_info?.tracking_id && (
                            <p className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {t("trackingId")}
                                </span>{" "}
                                <span className="bg-white px-2 py-1 rounded border text-sm">
                                    {order?.logistics_info?.tracking_id}
                                </span>
                                <button
                                    onClick={() => {
                                        const copyLink = `https://steadfast.com.bd/t/${order?.logistics_info?.tracking_id}`;
                                        navigator.clipboard.writeText(copyLink);
                                        toast.success(t("trackingCopied"));
                                    }}
                                    className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                                >
                                    {t("copy")}
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
