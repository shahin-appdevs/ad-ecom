"use client";
import { useState, useEffect } from "react";
import { dashboardGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

export default function WidgetSection() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardGetAPI();
                setDashboardData(response?.data?.data);
            } catch (error) {
                toast.error("Failed to fetch dashboard data");
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

    const widgets = dashboardData ? [
        { label: "Total Add Money", ...parseAmount(dashboardData.totalAddMoney) },
        { label: "Total Withdraw", ...parseAmount(dashboardData.withdraw_amount) },
        { label: "Total Bill Pay", ...parseAmount(dashboardData.billPay) },
        { label: "Total Mobile TopUp", ...parseAmount(dashboardData.topUps) },
        { label: "Total Transactions", value: dashboardData.totalTransactions ?? 0, currency: "" },
        { label: "Total Purchase Amount", ...parseAmount(dashboardData.total_purchase_amount) },
        { label: "Total Paid Amount", ...parseAmount(dashboardData.total_paid_amount) },
        { label: "Processing Orders", ...parseAmount(dashboardData.processing_orders) },
        { label: "Cancel Orders", value: dashboardData.cancel_orders ?? 0, currency: "" },
        { label: "Returned Orders", value: dashboardData.returned_orders ?? 0, currency: "" },
        { label: "Delivered Orders", value: dashboardData.delivered_orders ?? 0, currency: "" },
        { label: "Total Orders", value: dashboardData.total_orders ?? 0, currency: "" },
    ] : [];

    return (
        <div className="bg-white rounded-[12px] p-4 sm:p-7">
            <div className="">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b-[1.5px] border-[#F5F7FF]">
                    <div>
                        <h2 className="text-[16px] font-semibold mb-1">Widget</h2>
                        <p className="text-xs">Real-time widget for instant engagement</p>
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
                            <div key={index} className="py-8 px-5 xl:px-8 relative border-[1.5px] border-[#F5F7FF] shadow-primary__shadow rounded-md text-center">
                                <h3 className="text-[26px] xl:text-[32px] font-semibold text-primary__color mb-1">
                                    {item.value}{" "} 
                                    <span className="text-[17px] xl:text-[20px] font-bold">{item.currency}</span>
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