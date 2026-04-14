"use client";
import { Link } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { productOrderGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import { ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useLocale, useTranslations } from "next-intl";
import { getBaseCurrency } from "@/components/utility/getBaseCurrency";

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
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
        </tr>
    );
}

export default function OrderSection() {
    const [apiData, setApiData] = useState(null);
    const [orders, setOrders] = useState([]);
    const router = useRouter();
    const t = useTranslations("Dashboard.ecommerce.orderLog");
    const lang = useLocale();
    const { baseCurrencySymbol } = getBaseCurrency(apiData);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await productOrderGetAPI(lang);
                setApiData(response.data.data);
                setOrders(response.data.data.orders?.data || []);
            } catch (error) {
                const errorMessage = error.response?.data?.message?.error?.[0];
                toast.error(errorMessage);
                if (
                    errorMessage ===
                    "Kindly complete your PIN setup before proceeding."
                ) {
                    router.push("/user/setup/pin");
                }
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "placed":
                return "bg-green-100 text-green-800";
            case "Rejected":
                return "bg-red-100 text-red-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Waiting":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">{t("title")}</h2>
            </div>

            {!apiData ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr
                                dir="ltr"
                                className="bg-[#F5F7FF] text-left text-sm text-color__paragraph"
                            >
                                <th className="py-4 px-5 font-semibold">
                                    {t("trx")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("gateway")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("requestAmount")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("payable")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("exchangeRate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("feesAndCharges")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("currentBalance")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("timeAndDate")}
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
            ) : orders.length === 0 ? (
                <div className="text-center py-5">{t("noOrders")}</div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left rtl:text-right text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">
                                    {t("orderId")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("productTotal")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("deliveryFee")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("deliveryMethod")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("paymentMethod")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("grandTotal")}
                                </th>
                                {/* <th className="py-4 px-5 font-semibold">Profit Amount</th> */}
                                <th className="py-4 px-5 font-semibold">
                                    {t("status")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("timeAndDate")}
                                </th>
                                <th className="py-4 px-5 font-semibold">
                                    {t("action")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {orders.map((order, index) => (
                                <tr
                                    dir="ltr"
                                    className="rtl:text-right"
                                    key={index}
                                >
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">
                                        #{order.order_id || "N/A"}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {baseCurrencySymbol}{" "}
                                        {parseFloat(
                                            order.product_total,
                                        ).toFixed(2)}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {baseCurrencySymbol}{" "}
                                        {parseFloat(order.delivery_fee).toFixed(
                                            2,
                                        )}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {order.delivery_method}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {order.payment_method}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {baseCurrencySymbol}{" "}
                                        {parseFloat(order?.grand_total).toFixed(
                                            2,
                                        )}
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                        <span
                                            className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(order.status)}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="py-3.5 px-5 text-sm">
                                        <Link
                                            href={`/user/order/details?orderId=${order.order_id}`}
                                            className="p-2 rounded-full hover:bg-gray-100 transition"
                                        >
                                            <ComputerDesktopIcon className="h-5 w-5" />
                                        </Link>
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
