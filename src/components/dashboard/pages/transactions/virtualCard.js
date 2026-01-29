"use client";
import { useState, useEffect } from "react";
import { allTransactionsGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
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

    useEffect(() => {
        const fetchBillPayData = async () => {
            try {
                setIsLoading(true);
                const response = await allTransactionsGetAPI();
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
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "success":
                return "bg-green-50 text-green-500 border border-green-500";
            case "rejected":
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
        <div className="bg-white rounded-[12px] p-8">
            <div className="flex flex-col md:flex-row md:items-center  md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-base  font-semibold">Virtual Card Logs</h2>
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
                                    Transaction Type
                                </th>

                                <th className="py-4 px-5 font-semibold">
                                    Exchange Rate
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Fee/Charge
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Number
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Balance
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Time & Date
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Status
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
                                    Transaction Type
                                </th>

                                <th className="py-4 px-5 font-semibold">
                                    Exchange Rate
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Fee/Charge
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Amount
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Number
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Card Balance
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Time & Date
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {transactions?.map((transaction, index) => (
                                <tr key={index}>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{transaction.trx}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction.transaction_type}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.exchange_rate}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.total_charge}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_amount}
                                    </td>

                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.card_number?.slice(0, 4)}
                                        {transaction?.card_number?.slice(4, 6)}
                                        *******
                                        {transaction?.card_number?.slice(-4)}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {transaction?.current_balance}
                                    </td>

                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {format(
                                            transaction?.date_time,
                                            "dd-MM-yyyy h:mm:aa",
                                        )}
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
