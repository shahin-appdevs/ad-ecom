"use client";
import { useState, useEffect } from "react";
import { allTransactionsGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
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

export default function MyGiftCardsLogs() {
    const [isLoading, setIsLoading] = useState(true);
    const [giftCardLogs, setGiftCardLogs] = useState([]);
    const router = useRouter();
    const t = useTranslations("Dashboard.transactions.giftCards");

    useEffect(() => {
        const fetchGiftCardData = async () => {
            try {
                setIsLoading(true);
                const response = await allTransactionsGetAPI();
                setGiftCardLogs(
                    response?.data?.data?.transactions?.gift_cards || [],
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

        fetchGiftCardData();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "success":
                return "bg-green-50 text-green-500 border border-green-500";
            case "rejected":
                return "bg-red-50 text-red-500 border border-red-500";
            case "pending":
                return "bg-yellow-50 text-yellow-500 border border-yellow-500";
            case "hold":
                return "bg-yellow-50 text-yellow-600 border border-yellow-600";
            case "waiting":
                return "bg-yellow-50 text-yellow-500 border border-yellow-500";
            case "processing":
                return "bg-blue-100 text-blue-800 border border-blue-500";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">{t("title")}</h2>
                {/* Uncomment if needed later
                <Link
                    href="/user/cards/gift-card/gift-card-list"
                    className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition"
                >
                    <PlusIcon className="h-5 w-5" />
                    {t("addGiftCard")}
                </Link>
                */}
            </div>

            {isLoading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left rtl:text-right text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("trx")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardName")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("receiverEmail")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("receiverPhone")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardUnitPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardQuantity")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardTotalPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("exchangeRate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("totalCharge")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("payableAmount")}
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
            ) : giftCardLogs.length === 0 ? (
                <div className="text-center py-5 text-gray-500">
                    {t("noGiftCards")}
                </div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left rtl:text-right text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("trx")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardName")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("receiverEmail")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("receiverPhone")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardUnitPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardQuantity")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("cardTotalPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("exchangeRate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("totalCharge")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("payableAmount")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {giftCardLogs?.map((transaction, index) => (
                                <tr
                                    dir="ltr"
                                    className="rtl:text-right"
                                    key={index}
                                >
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{transaction?.trx || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_name || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.receiver_email || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.receiver_phone || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_unit_price || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_quantity || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_total_price || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.exchange_rate || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        <span
                                            className={`${getStatusColor(transaction?.status)} rounded-full px-2 py-1`}
                                        >
                                            {transaction?.status || "—"}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.total_charge || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.payable || "—"}
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
