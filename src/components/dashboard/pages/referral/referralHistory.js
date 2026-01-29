"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { referralStatusGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

function SkeletonRow() {
    return (
        <tr>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <div className="animate-pulse bg-gray-200 h-9 w-9 rounded-full"></div>
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                </div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-40 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-28 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-5 w-20 rounded-full"></div>
            </td>
        </tr>
    );
}

export default function TransactionHistorySection() {
    const [loading, setLoading] = useState(true);
    const [referralUsers, setReferralUsers] = useState([]);

    useEffect(() => {
        const fetchReferralData = async () => {
            try {
                const response = await referralStatusGetAPI();
                const users = response?.data?.data?.total_referred_users || [];
                setReferralUsers(users);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message?.error?.[0] || "Something went wrong",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReferralData();
    }, []);

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">Referred Users</h2>
            </div>
            {loading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">User</th>
                                <th className="py-4 px-5 font-semibold">Email</th>
                                <th className="py-4 px-5 font-semibold">
                                    Phone Number
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Refer Code
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {[...Array(4)].map((_, index) => (
                                <SkeletonRow key={index} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : referralUsers.length === 0 ? (
                <div className="text-center py-5">No referred users found</div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">User</th>
                                <th className="py-4 px-5 font-semibold">Email</th>
                                <th className="py-4 px-5 font-semibold">
                                    Phone Number
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {referralUsers.map((user, index) => (
                                <tr key={index}>
                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                        <div className="flex gap-2 items-center">
                                            <div className="text-sm font-medium">
                                                {user.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {user.email}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {user.full_mobile}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${
                                                user.status === true
                                                    ? "bg-[#3f48cc1c] text-primary__color"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            {user.status === true ? "Active" : "Inactive"}
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
