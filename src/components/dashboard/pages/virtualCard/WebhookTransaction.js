"use client";
import { useState, useEffect } from "react";
import { stroWalletWebhookTransaction } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { handleApiError } from "@/components/utility/handleApiError";

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

export default function VirtualCardWebHookTransaction() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();
    const params = useSearchParams();
    const cardId = params.get("card_id");

    useEffect(() => {
        const fetchWebHookTrxData = async () => {
            try {
                setIsLoading(true);
                const response = await stroWalletWebhookTransaction(cardId);
                setTransactions(response.data.data.transactions || []);
            } catch (error) {
                const errorMessage = error.response?.data?.message?.error?.[0];
                handleApiError(error);
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

        fetchWebHookTrxData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "success":
                return "bg-green-50 text-green-500 border border-green-500";
            case "rejected":
                return "bg-red-50 text-red-500 border border-red-500";
            case "failed":
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
            <div className="flex flex-col md:flex-row md:items-center  md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-base  font-semibold">
                    Webhook Transactions
                </h2>
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
                                    Event Type
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Reference
                                </th>

                                <th className="py-4 px-5 font-semibold">
                                    Narrative
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Reason
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Charge Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Balance Before Termination
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Status
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Created At
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
                <div className="text-center py-5">No transaction found</div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    Trx Id
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Event Type
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Reference
                                </th>

                                <th className="py-4 px-5 font-semibold">
                                    Narrative
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Reason
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Charge Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Balance Before Termination
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Status
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Created At
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {transactions?.map((transaction, index) => (
                                <tr key={index}>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{transaction?.transition_id || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.event || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.reference || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.narrative || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.reason || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.amount || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.charge_amount || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.balance_before_termination ||
                                            "N/A"}
                                    </td>
                                    <td
                                        className={` py-3.5 px-5 whitespace-nowrap text-sm font-medium`}
                                    >
                                        <span
                                            className={`${getStatusColor(transaction?.status)} rounded-full px-2`}
                                        >
                                            {transaction?.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.created_at
                                            ? format(
                                                  transaction?.created_at,
                                                  "dd-MM-yyyy h:mm:aa",
                                              )
                                            : "N/A"}
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
