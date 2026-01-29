"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { walletGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useFeatureAccess } from "@/components/hooks/useFeatureAccess";

export default function WalletSection() {
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("user");
    const { canEarnWallet } = useFeatureAccess();

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const response = await walletGetAPI();
                setWalletData(response?.data?.data);
            } catch (error) {
                toast.error("Failed to fetch wallet data");
            } finally {
                setLoading(false);
            }
        };
        fetchWalletData();
    }, []);

    const tabInfo = {
        user: {
            title: "User Balance",
            subtitle: "Payment wallet for instant transactions",
        },
        shopping: {
            title: "Shopping Balance",
            subtitle: "Wallet balance reserved for shopping",
        },
        earning: {
            title: "Reward Points",
            subtitle: "Wallet balance earned from commissions",
        },
    };

    const renderWallets = (type) => {
        if (!walletData?.userWallets) return null;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {walletData.userWallets.map((wallet, index) => {
                    let balanceValue =
                        type === "user"
                            ? wallet.balance
                            : type === "shopping"
                              ? wallet.shopping_balance
                              : wallet.earning_balance;

                    return (
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
                                {wallet.currency.symbol}
                                {balanceValue}
                            </h3>
                            <p className="font-medium">
                                {wallet.currency.name} ({wallet.currency.code})
                            </p>
                            {wallet.currency.default === 1 && (
                                <span className="absolute top-2 right-2 bg-[#F5F7FF] text-[10px] px-2 py-1 font-semibold rounded">
                                    Default
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[12px] p-4 sm:p-7">
            <div>
                <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab("user")}
                        className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium ${
                            activeTab === "user"
                                ? "bg-primary__color text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        User Balance
                    </button>
                    <button
                        onClick={() => setActiveTab("shopping")}
                        className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium ${
                            activeTab === "shopping"
                                ? "bg-primary__color text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        Shopping Balance
                    </button>
                    {canEarnWallet && (
                        <button
                            onClick={() => setActiveTab("earning")}
                            className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium ${
                                activeTab === "earning"
                                    ? "bg-primary__color text-white"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            Reward Points
                        </button>
                    )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b-[1.5px] border-[#F5F7FF]">
                    <div>
                        <h2 className="text-[16px] font-semibold mb-1">
                            {tabInfo[activeTab].title}
                        </h2>
                        <p className="text-xs">{tabInfo[activeTab].subtitle}</p>
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
                    renderWallets(activeTab)
                )}
            </div>
        </div>
    );
}
