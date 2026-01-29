"use client";
import { useState, useEffect } from "react";
import { dashboardGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

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
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
        </tr>
    );
}

export default function TransactionHistorySection() {
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardGetAPI();
                const transactions = response?.data?.data?.transactions || [];
                setTransactions(transactions);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message?.error?.[0] || "Something went wrong",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "completed":
            case "success":
                return "bg-green-100 text-green-800";
            case "rejected":
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

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">Transaction History</h2>
            </div>
            {loading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">Transaction ID</th>
                                <th className="py-4 px-5 font-semibold">Type</th>
                                <th className="py-4 px-5 font-semibold">Transaction Type</th>
                                <th className="py-4 px-5 font-semibold">Request Amount</th>
                                <th className="py-4 px-5 font-semibold">Payable</th>
                                <th className="py-4 px-5 font-semibold">Remark</th>
                                <th className="py-4 px-5 font-semibold">Status</th>
                                <th className="py-4 px-5 font-semibold">Time & Date</th>
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
                <div className="text-center py-5">No transactions found</div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">Transaction ID</th>
                                <th className="py-4 px-5 font-semibold">Type</th>
                                <th className="py-4 px-5 font-semibold">Transaction Type</th>
                                <th className="py-4 px-5 font-semibold">Request Amount</th>
                                <th className="py-4 px-5 font-semibold">Payable</th>
                                <th className="py-4 px-5 font-semibold">Remark</th>
                                <th className="py-4 px-5 font-semibold">Status</th>
                                <th className="py-4 px-5 font-semibold">Time & Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {transactions.map((transaction, index) => (
                                <tr key={index}>
                                    <td className="py-4 px-5 whitespace-nowrap text-sm text-primary__color font-medium">{transaction.trx}</td>
                                    <td className="py-4 px-5 whitespace-nowrap text-sm font-medium">{transaction.type}</td>
                                    <td className="py-4 px-5 whitespace-nowrap text-sm font-medium">{transaction.transaction_type}</td>
                                    <td className="py-4 px-5 whitespace-nowrap text-sm font-medium">{transaction.request_amount}</td>
                                    <td className="py-4 px-5 whitespace-nowrap text-sm font-medium">{transaction.payable}</td>
                                    <td className="py-4 px-5 whitespace-nowrap text-sm font-medium">{transaction.remark || '-'}</td>
                                    <td className="py-4 px-5 whitespace-nowrap">
                                        <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] capitalize ${getStatusColor(transaction.status)}`}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 whitespace-nowrap text-sm font-medium">{new Date(transaction.date_time).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}