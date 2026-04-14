"use client";
import { useState, useEffect } from "react";
import { allTransactionsGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";

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
        </tr>
    );
}

export default function AllVirtualCardTransaction() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();
    const t = useTranslations("Dashboard.transactions.virtualCard");
    const lang = useLocale();

    useEffect(() => {
        const fetchBillPayData = async () => {
            try {
                setIsLoading(true);
                const response = await allTransactionsGetAPI(lang);
                setTransactions(
                    response.data.data.transactions?.virtual_card || [],
                );
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
                return "bg-green-50 text-green-500 border border-green-500";
            case "rejected":
                return "bg-red-50 text-red-500 border border-red-500";
            case "pending":
                return "bg-yellow-50 text-yellow-500 border border-yellow-500";
            case "active":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-[12px] p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-base font-semibold">{t("title")}</h2>
            </div>

            {isLoading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left rtl:text-right text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("trxId")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("transactionType")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("exchangeRate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("feeCharge")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardAmount")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardNumber")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardBalance")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("timeDate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
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
            ) : !Array.isArray(transactions) || transactions?.length < 1 ? (
                <div className="text-center py-5 text-gray-500">
                    {t("noTransactions")}
                </div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left rtl:text-right text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("trxId")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("transactionType")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("exchangeRate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("feeCharge")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardAmount")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardNumber")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardBalance")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("timeDate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {transactions?.map((transaction, index) => (
                                <tr
                                    dir="ltr"
                                    className="rtl:text-right"
                                    key={index}
                                >
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{transaction.trx || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.transaction_type || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.exchange_rate || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.total_charge || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_amount || "—"}
                                    </td>

                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium font-mono">
                                        {transaction?.card_number
                                            ? `${transaction.card_number.slice(0, 4)} ${transaction.card_number.slice(4, 6)} **** **** ${transaction.card_number.slice(-4)}`
                                            : "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.current_balance || "—"}
                                    </td>

                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.date_time
                                            ? format(
                                                  new Date(
                                                      transaction.date_time,
                                                  ),
                                                  "dd-MM-yyyy h:mm aa",
                                              )
                                            : "—"}
                                    </td>
                                    <td
                                        className={`py-3.5 px-5 whitespace-nowrap text-sm font-medium`}
                                    >
                                        <span
                                            className={`${getStatusColor(transaction?.status)} rounded-full px-2 py-1`}
                                        >
                                            {transaction?.status || "—"}
                                        </span>
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
