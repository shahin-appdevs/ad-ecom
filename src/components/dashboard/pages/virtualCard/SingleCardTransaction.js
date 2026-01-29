"use client";
import { useState, useEffect } from "react";
import {
    myGiftCardGetAPI,
    stroWalletCardTransactionGetAPI,
} from "@root/services/apiClient/apiClient";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { handleApiError } from "@/components/utility/handleApiError";

export default function VirtualCardTransaction() {
    const [isLoading, setIsLoading] = useState(true);
    const [myCardTransaction, setMyCardTransaction] = useState([]);
    const router = useRouter();
    const params = useSearchParams();

    // console.log(params.get("card_id"));
    const cardId = params.get("card_id");

    useEffect(() => {
        const fetchSingleCardTrxData = async () => {
            try {
                setIsLoading(true);
                const response = await stroWalletCardTransactionGetAPI(cardId); // will be single card api

                setMyCardTransaction(
                    response?.data?.data?.card_transactions || [],
                );
            } catch (error) {
                handleApiError(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (cardId) {
            fetchSingleCardTrxData();
        }
    }, [cardId]);

    const getStatusColor = (status) => {
        switch (status) {
            case "success":
                return "bg-green-50 text-green-500 border border-green-500";
            case "Rejected":
                return "bg-red-50 text-red-500 border border-red-500";
            case "pending":
                return "bg-yellow-50 text-yellow-500 border border-yellow-500";
            case "Active":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">
                    Recent Transaction
                </h2>
                <Link
                    href={`/user/cards/virtual-card/web-hook-transaction?card_id=${cardId}`}
                    className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition"
                >
                    Webhook Transaction
                </Link>
            </div>

            {isLoading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    Trx Id
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Type
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Id
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Cent Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Method
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Narrative
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Currency
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Status
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Reference
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
            ) : myCardTransaction?.length === 0 ? (
                <div className="text-center py-5">No Transaction found</div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    Trx Id
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Type
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Id
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Cent Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Method
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Narrative
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Currency
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Status
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Reference
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {myCardTransaction?.map((transaction, index) => (
                                <tr key={index}>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{transaction?.id || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.type}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.cardId}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.amount}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.centAmount}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.method}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.narrative}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.currency}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {getStatusColor(transaction?.status)}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.reference}
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
        </tr>
    );
}
