"use client";
import { useState, useEffect } from "react";
import { dashboardGetAPI } from "@root/services/apiClient/apiClient";
import { useTranslations } from "next-intl";
import { handleApiError } from "@/components/utility/handleApiError";

export default function WidgetSection() {
    const t = useTranslations("Dashboard.homepage.widget");
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardGetAPI();
                setDashboardData(response?.data?.data);
            } catch (error) {
                handleApiError(error, t("failedFetch"));
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const parseAmount = (str) => {
        if (!str || typeof str !== "string") return { value: 0, currency: "" };
        const [value, currency] = str.split(" ");
        return {
            value: parseFloat(value) || 0,
            currency: currency || "",
        };
    };

    const widgets = dashboardData
        ? [
              {
                  label: t("totalAddMoney"),
                  ...parseAmount(dashboardData.totalAddMoney),
              },
              {
                  label: t("totalWithdraw"),
                  ...parseAmount(dashboardData.withdraw_amount),
              },
              {
                  label: t("totalBillPay"),
                  ...parseAmount(dashboardData.billPay),
              },
              {
                  label: t("totalMobileTopUp"),
                  ...parseAmount(dashboardData.topUps),
              },
              {
                  label: t("totalTransactions"),
                  value: dashboardData.totalTransactions ?? 0,
                  currency: "",
              },
              {
                  label: t("totalPurchaseAmount"),
                  ...parseAmount(dashboardData.total_purchase_amount),
              },
              {
                  label: t("totalPaidAmount"),
                  ...parseAmount(dashboardData.total_paid_amount),
              },
              {
                  label: t("processingOrders"),
                  ...parseAmount(dashboardData.processing_orders),
              },
              {
                  label: t("cancelOrders"),
                  value: dashboardData.cancel_orders ?? 0,
                  currency: "",
              },
              {
                  label: t("returnedOrders"),
                  value: dashboardData.returned_orders ?? 0,
                  currency: "",
              },
              {
                  label: t("deliveredOrders"),
                  value: dashboardData.delivered_orders ?? 0,
                  currency: "",
              },
              {
                  label: t("totalOrders"),
                  value: dashboardData.total_orders ?? 0,
                  currency: "",
              },
          ]
        : [];

    return (
        <div className="bg-white rounded-[12px] p-4 sm:p-7">
            <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b-[1.5px] border-[#F5F7FF]">
                    <div>
                        <h2 className="text-[16px] font-semibold mb-1">
                            {t("title")}
                        </h2>
                        <p className="text-xs">{t("subtitle")}</p>
                    </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {widgets.map((item, index) => (
                            <div
                                key={index}
                                className="py-8 px-5 xl:px-8 relative border-[1.5px] border-[#F5F7FF] shadow-primary__shadow rounded-md text-center"
                            >
                                <h3
                                    dir="ltr"
                                    className="text-[26px] xl:text-[32px] font-semibold text-primary__color mb-1"
                                >
                                    {item.value}{" "}
                                    <span className="text-[17px] xl:text-[20px] font-bold">
                                        {item.currency}
                                    </span>
                                </h3>
                                <p className="font-medium">{item.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
