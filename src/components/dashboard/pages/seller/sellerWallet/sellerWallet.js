"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { walletGetSellerAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

export default function WalletSection() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await walletGetSellerAPI();
                setDashboardData(response?.data?.data);
            } catch (error) {
                toast.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b-[1.5px] border-[#F5F7FF]">
                    <div>
                        <h2 className="text-[16px] font-semibold mb-1">Wallet</h2>
                        <p className="text-xs">Payment wallet for instant transaction</p>
                    </div>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 20 }).map((_, index) => (
                            <div
                                key={index}
                                className="py-8 px-5 xl:px-8 relative border-[1.5px] border-[#F5F7FF] rounded-md text-center animate-pulse shadow-primary__shadow"
                            >
                                <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {dashboardData?.userWallets?.map((wallet, index) => (
                            <div
                                key={index}
                                className="py-8 px-5 xl:px-8 relative border-[1.5px] border-[#F5F7FF] rounded-md text-center shadow-primary__shadow"
                            >
                                <div className="flex justify-center mb-3">
                                    <Image
                                        src={wallet.currency.currencyImage}
                                        alt={wallet.currency.code}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                </div>
                                <h3 className="text-[22px] font-bold mb-1">
                                    {wallet.currency.symbol}{wallet.balance}
                                </h3>
                                <p className="font-medium">
                                    {wallet.currency.name} ({wallet.currency.code})
                                </p>
                                {wallet.currency.default === 1 &&  (
                                    <span className="absolute top-2 right-2 bg-[#F5F7FF] text-[10px] px-2 py-1 font-semibold rounded">
                                        Default
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}