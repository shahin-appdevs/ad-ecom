"use client";
import { useState, useEffect } from "react";
import { billPayGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

function SkeletonRow() {
    return (
        <tr>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
        </tr>
    );
}

export default function BillPayHistorySection() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();
    const t = useTranslations("Dashboard.transactions.billPayTransaction");
    const lang = useLocale();

    useEffect(() => {
        const fetchBillPayData = async () => {
            try {
                setIsLoading(true);
                const response = await billPayGetAPI(lang);
                setTransactions(response.data.data.transactions || []);
            } catch (error) {
                const errorMessage = error.response?.data?.message?.error?.[0];
                toast.error(errorMessage);
                if (
                    errorMessage ===
                    "Kindly complete your PIN setup before proceeding."
                ) {
                    router.push("/user/setup/pin");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchBillPayData();
    }, [router]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "success":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "active":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">{t("title")}</h2>
            </div>

            {isLoading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left rtl:text-right  text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("trx")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("requestAmount")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("payable")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("rate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billType")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billMonth")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billNumber")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billAmount")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("fees")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("balance")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("time")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {[...Array(2)].map((_, index) => (
                                <SkeletonRow key={index} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-5 text-gray-500">
                    {t("noTransactions")}
                </div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left rtl:text-right  text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("trx")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("requestAmount")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("payable")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("rate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billType")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billMonth")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billNumber")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("billAmount")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("fees")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("balance")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("time")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {transactions.map((transaction, index) => (
                                <tr
                                    dir="ltr"
                                    className="rtl:text-right"
                                    key={index}
                                >
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{transaction.trx || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.request_amount || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.payable || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.exchange_rate || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.bill_type || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.bill_month || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.bill_number || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.bill_amount || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.total_charge || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.current_balance || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                        <span
                                            className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] capitalize ${getStatusColor(transaction.status)}`}
                                        >
                                            {transaction.status || "—"}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {formatDate(transaction.date_time)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
