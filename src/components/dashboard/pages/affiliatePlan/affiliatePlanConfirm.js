"use client";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { affiliatePlanInitializeAPI, affiliatePlanGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { Listbox } from "@headlessui/react";
import { 
    ChevronUpDownIcon, 
    CheckIcon, 
    CurrencyDollarIcon,
    ArrowTrendingDownIcon,
    WalletIcon,
} 
from '@heroicons/react/24/outline';
import Button from "@/components/utility/Button";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

export default function AffiliatePlanConfirm() {
    const searchParams = useSearchParams();
    const idParam = searchParams.get("planId");
    const amount = searchParams.get("amount");

    const [planId, setPlanId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [gateways, setGateways] = useState([]);
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [gatewayImagePath, setGatewayImagePath] = useState("");
    const [payInfo, setPayInfo] = useState({
        pay_information: {
            requested_amount: "0.00",
            total_charge: "0.00",
            total_amount: "0.00",
            sender_cur_code: "BDT",
        },
        redirect_url: null,
    });

    useEffect(() => {
        if (idParam) {
            setPlanId(parseInt(idParam));
        }
    }, [idParam]);

    const requestedAmount = parseFloat(amount || 0);

    const calculatedSummary = useMemo(() => {
        if (!selectedCurrency) return {
            requestedAmount: 0,
            fees: 0,
            total: 0,
        };

        const percentCharge = parseFloat(selectedCurrency.percent_charge || 0);
        const fixedCharge = parseFloat(selectedCurrency.fixed_charge || 0);

        const fees = (requestedAmount * percentCharge) / 100 + fixedCharge;
        const total = requestedAmount + fees;

        return {
            requestedAmount: requestedAmount.toFixed(2),
            fees: fees.toFixed(2),
            total: total.toFixed(2),
        };
    }, [requestedAmount, selectedCurrency]);

    useEffect(() => {
        const initPayment = async () => {
            try {
                const resPlans = await affiliatePlanGetAPI();
                const gwList = resPlans?.data?.data?.gateways || [];
                setGateways(gwList);
                setGatewayImagePath(resPlans?.data?.data?.gateway_image_path || "");
                if (gwList.length > 0) {
                    setSelectedGateway(gwList[0]);
                    setSelectedCurrency(gwList[0].currencies[0]);
                }
            } catch (err) {
                toast.error(err.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };
        initPayment();
    }, []);

    const handleInitialize = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const res = await affiliatePlanInitializeAPI(
                planId,
                amount,
                selectedCurrency.alias,
                'WEB',
                `${window.location.origin}/user/affiliate-plan/success`,
                `${window.location.origin}/user/affiliate-plan/cancel`,
            );
            setPayInfo(res.data.data);
            window.location.href = res.data.data.redirect_url;
        } catch (err) {
            toast.error(err.response?.data?.message?.error?.[0]);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7 space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <div className="relative">
                                <Skeleton className="h-10 w-full" />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-20">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <Skeleton className="h-5 w-32" />
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                        <div className="border-t pt-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7">
                <form onSubmit={handleInitialize}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Select Payment Gateway</label>
                        <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-lg border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none sm:text-sm">
                                    <span className="flex items-center">
                                        {selectedCurrency && (
                                            <img
                                                src={`${backendBaseURL}/${gatewayImagePath}/${selectedCurrency.image}`}
                                                alt={selectedCurrency.alias}
                                                className="w-6 h-6 mr-2 rounded"
                                            />
                                        )}
                                        {selectedCurrency?.alias || "Select Gateway Currency"}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                    </span>
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                                    {gateways.flatMap(gw =>
                                        gw.currencies.map(currency => (
                                            <Listbox.Option
                                                key={currency.id}
                                                value={currency}
                                                className={({ active }) =>
                                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                        active ? "bg-primary__color text-white" : "text-gray-900"
                                                    }`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`flex items-center ${selected ? "font-medium" : "font-normal"}`}>
                                                            <img
                                                                src={`${backendBaseURL}/${gatewayImagePath}/${currency.image}`}
                                                                alt={currency.alias}
                                                                className="w-6 h-6 mr-2 rounded"
                                                            />
                                                            {currency.alias}
                                                        </span>
                                                        {selected && (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                                <CheckIcon className="h-5 w-5" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))
                                    )}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>
                    <Button
                        title={isSubmitting ? 'Confirming...' : 'Confirm'}
                        variant="primary"
                        size="md"
                        className="w-full"
                        type="submit"
                        disabled={isSubmitting}
                    />
                </form>
            </div>
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <h5 className="text-base font-semibold text-gray-800">Preview</h5>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
                            <span>Requested Amount</span>
                        </div>
                        <span className="font-medium text-gray-800">
                            {calculatedSummary.requestedAmount} {selectedCurrency?.currency_code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>Fees & Charges</span>
                        </div>
                        <span className="text-gray-800">
                            {calculatedSummary.fees} {selectedCurrency?.currency_code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 font-semibold text-gray-800">
                        <div className="flex items-center space-x-2">
                            <WalletIcon className="w-5 h-5 text-indigo-600" />
                            <span>Total Payable</span>
                        </div>
                        <span>
                            {calculatedSummary.total} {selectedCurrency?.currency_code}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}