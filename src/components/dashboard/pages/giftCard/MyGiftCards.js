"use client";
import { useState, useEffect } from "react";
import { myGiftCardGetAPI } from "@root/services/apiClient/apiClient";
import { Link } from "@/i18n/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

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

export default function MyGiftCards() {
    const t = useTranslations("Dashboard.cards.giftCard.myGiftCards");
    const lang = useLocale();
    const [isLoading, setIsLoading] = useState(true);
    const [myGiftCards, setMyGiftCards] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchGiftCardData = async () => {
            try {
                setIsLoading(true);
                const response = await myGiftCardGetAPI(lang);
                setMyGiftCards(response.data.data.gift_cards || []);
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

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">{t("title")}</h2>
                <Link
                    href="/user/cards/gift-card/gift-card-list"
                    className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition"
                >
                    <PlusIcon className="h-5 w-5" />
                    {t("addGiftCard")}
                </Link>
            </div>

            {isLoading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.trx")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardImage")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardName")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.receiverEmail")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.receiverPhone")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardUnitPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardQuantity")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardTotalPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.exchangeRate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.payableUnitPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.totalCharge")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.payableAmount")}
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
            ) : myGiftCards.length === 0 ? (
                <div className="text-center py-5 text-gray-500">
                    {t("noGiftCardFound")}
                </div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.trx")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardImage")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardName")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.receiverEmail")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.receiverPhone")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardUnitPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardQuantity")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.cardTotalPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.exchangeRate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.payableUnitPrice")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.totalCharge")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("table.payableAmount")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {myGiftCards.map((transaction, index) => (
                                <tr key={index}>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{transaction.trx_id || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        <Image
                                            src={transaction?.card_image}
                                            alt={
                                                transaction?.card_name ||
                                                t("table.cardImageAlt")
                                            }
                                            height={50}
                                            width={50}
                                            className="rounded-md object-cover"
                                        />
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_name || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.receiver_email || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.receiver_phone || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.card_init_price || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.quantity || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.card_total_price || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.wallet_currency_rate ||
                                            "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.payable_unit_price || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.payable_charge || "—"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.total_payable || "—"}
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
