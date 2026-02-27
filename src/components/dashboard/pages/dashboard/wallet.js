"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { dashboardGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useFeatureAccess } from "@/components/hooks/useFeatureAccess";
import { useTranslations } from "next-intl";

export default function WalletSection() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("user");
    const { canEarnWallet } = useFeatureAccess();
    const t = useTranslations("DashboardPage.wallet");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardGetAPI();
                setDashboardData(response?.data?.data);
            } catch (error) {
                toast.error(t("failedFetch"));
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [t]);

    const tabInfo = {
        user: {
            title: t("myBalance"),
            subtitle: t("myBalanceSubtitle"),
        },
        shopping: {
            title: t("shoppingBalance"),
            subtitle: t("shoppingBalanceSubtitle"),
        },
        earning: {
            title: t("rewardPoints"),
            subtitle: t("rewardPointsSubtitle"),
        },
    };

    const renderWallets = (type) => {
        if (!dashboardData?.userWallets) return null;

        let walletsToShow =
            type === "earning"
                ? dashboardData.userWallets.filter(
                      (wallet) => wallet.currency.default === 1,
                  )
                : dashboardData.userWallets;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {walletsToShow.map((wallet, index) => {
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
                                {type === "earning"
                                    ? `${balanceValue} ${t("points")}`
                                    : `${wallet.currency.symbol}${balanceValue}`}
                            </h3>
                            <p className="font-medium">
                                {type === "earning"
                                    ? `${wallet.currency.country}`
                                    : `${wallet.currency.name} (${wallet.currency.code})`}
                            </p>
                            {wallet.currency.default === 1 &&
                                type !== "earning" && (
                                    <span className="absolute top-2 right-2 bg-[#F5F7FF] text-[10px] px-2 py-1 font-semibold rounded">
                                        {t("default")}
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
            <div className="">
                <div className="flex  border-b-[1px] border-gray-200 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("user")}
                        className={`px-3 relative text-nowrap sm:px-4  pb-3 text-sm font-medium ${
                            activeTab === "user"
                                ? " after:absolute after:bottom-[0px] after:left-0  after:h-[2px] after:rounded-lg after:w-full after:z-10 bg-white text-primary__color !border-primary__color  after:!bg-primary__color "
                                : " text-gray-600"
                        }`}
                    >
                        {t("myBalance")}
                    </button>
                    <button
                        onClick={() => setActiveTab("shopping")}
                        className={`px-3 relative  text-nowrap sm:px-4  pb-3 text-sm font-medium ${
                            activeTab === "shopping"
                                ? "after:absolute after:bottom-[0px] after:left-0  after:h-[2px] after:rounded-lg after:w-full after:z-10 bg-white text-primary__color !border-primary__color  after:!bg-primary__color "
                                : " text-gray-600"
                        }`}
                    >
                        {t("shoppingBalance")}
                    </button>
                    {canEarnWallet && (
                        <button
                            onClick={() => setActiveTab("earning")}
                            className={`px-3 relative  text-nowrap sm:px-4  pb-3 text-sm font-medium ${
                                activeTab === "earning"
                                    ? "after:absolute after:bottom-[0px] after:left-0  after:h-[2px] after:rounded-lg after:w-full after:z-10 bg-white text-primary__color !border-primary__color  after:!bg-primary__color "
                                    : " text-gray-600"
                            }`}
                        >
                            {t("rewardPoints")}
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
                    {activeTab !== "earning" && (
                        <Link
                            href="/user/wallets"
                            className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition"
                        >
                            <PlusIcon className="h-5 w-5" />
                            {t("viewAll")}
                        </Link>
                    )}
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, index) => (
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
