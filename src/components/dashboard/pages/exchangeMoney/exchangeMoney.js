"use client";
import { useState, useEffect, useMemo } from "react";
import {
    exchangeGetAPI,
    SubmitExchangeAPI,
    walletCardRemainingLimitsGetAPI,
} from "@root/services/apiClient/apiClient";
import { Listbox } from "@headlessui/react";
import {
    ChevronUpDownIcon,
    CheckIcon,
    CurrencyDollarIcon,
    BanknotesIcon,
    ArrowTrendingDownIcon,
    WalletIcon,
    ArrowsUpDownIcon,
    CalendarDaysIcon,
    ChartBarIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";
import PinVerificationModal from "@/components/dashboard/partials/PinVerificationModal";
import { useWallet } from "@/components/context/WalletContext";
import { handleApiError } from "@/components/utility/handleApiError";

function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

export default function ExchangeMoneySection() {
    const { wallet, updateSelectedCurrency } = useWallet();
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [receiverCurrency, setReceiverCurrency] = useState(
        wallet.currencies[0] || null,
    );
    const [amount, setAmount] = useState("");
    const [receiverAmount, setReceiverAmount] = useState("");
    const [exchangeData, setExchangeData] = useState({
        charges: {
            fixed_charge: "0.00",
            percent_charge: "0.00",
            min_limit: "0.00",
            max_limit: "0.00",
            daily_limit: "0.00",
            monthly_limit: "0.00",
        },
    });
    const [apiLoading, setApiLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [remainingLoading, setRemainingLoading] = useState(false);
    const [remainingLimit, setRemainingLimit] = useState({
        dailyLimit: "0.00",
        monthlyLimit: "0.00",
    });

    useEffect(() => {
        if (wallet.selectedCurrency) {
            setSelectedCurrency(wallet.selectedCurrency);
        }
    }, [wallet.selectedCurrency]);

    useEffect(() => {
        if (wallet.currencies.length > 0 && !receiverCurrency) {
            setReceiverCurrency(wallet.currencies[0]);
        }
    }, [wallet.currencies, receiverCurrency]);

    // fetch remaining limits
    useEffect(() => {
        (async () => {
            if (!exchangeData?.get_remaining_fields || !selectedCurrency) {
                return;
            }
            try {
                setRemainingLoading(true);
                const getRemainingFields = exchangeData?.get_remaining_fields;
                const transactionType = getRemainingFields?.transaction_type;
                const attribute = getRemainingFields?.attribute;
                const senderAmount = amount || "0";
                const currencyCode = selectedCurrency?.code;
                const chargeId = exchangeData?.charges?.id;
                const result = await walletCardRemainingLimitsGetAPI(
                    transactionType,
                    attribute,
                    senderAmount,
                    currencyCode,
                    chargeId,
                );
                const data = result?.data?.data;
                setRemainingLimit({
                    dailyLimit: data?.remainingDaily,
                    monthlyLimit: data?.remainingMonthly,
                });
            } catch (error) {
                handleApiError(error, "Failed to fetch remaining limits");
            } finally {
                setRemainingLoading(false);
            }
        })();
    }, [amount, exchangeData, selectedCurrency]);

    // Calculate exchange rate between sender and receiver currencies
    const exchangeRate = useMemo(() => {
        if (selectedCurrency && receiverCurrency) {
            const senderRate = parseFloat(selectedCurrency.rate || 1);
            const receiverRate = parseFloat(receiverCurrency.rate || 1);
            return receiverRate / senderRate;
        }
        return 1;
    }, [selectedCurrency, receiverCurrency]);

    const exchangeRateText = useMemo(() => {
        if (selectedCurrency && receiverCurrency) {
            return `1 ${selectedCurrency.code} = ${exchangeRate.toFixed(6)} ${receiverCurrency.code}`;
        }
        return "N/A";
    }, [exchangeRate, selectedCurrency, receiverCurrency]);

    // Calculate transaction limits
    const limitText = useMemo(() => {
        if (selectedCurrency) {
            const minLimit =
                parseFloat(exchangeData.charges.min_limit || 0) *
                parseFloat(selectedCurrency.rate || 0);
            const maxLimit =
                parseFloat(exchangeData.charges.max_limit || 0) *
                parseFloat(selectedCurrency.rate || 0);
            return `${minLimit.toFixed(4)} - ${maxLimit.toFixed(4)} ${selectedCurrency.code}`;
        }
        return "0.00 - 0.00";
    }, [selectedCurrency, exchangeData.charges]);

    // Calculate fees and charges
    const feesCalculation = useMemo(() => {
        if (!amount || !selectedCurrency || !receiverCurrency) {
            return {
                totalFees: "0.00",
                fixedCharge: "0.00",
                percentCharge: "0.00",
                conversionAmount: "0.00",
                totalPayable: "0.00",
                willGet: "0.00",
                exchangeRate: "0.00",
            };
        }

        const amountNum = parseFloat(amount) || 0;
        const receiverAmountNum = parseFloat(receiverAmount) || 0;

        const fixedCharge =
            parseFloat(exchangeData.charges.fixed_charge) *
            parseFloat(selectedCurrency.rate);
        const percentCharge =
            (amountNum * parseFloat(exchangeData.charges.percent_charge)) / 100;
        const totalFees = fixedCharge + percentCharge;

        const exchangeRate =
            parseFloat(receiverCurrency.rate) /
            parseFloat(selectedCurrency.rate);
        const willGet = receiverAmountNum;
        const totalPayable = amountNum + totalFees;

        return {
            totalFees: totalFees.toFixed(4),
            fixedCharge: fixedCharge.toFixed(4),
            percentCharge: percentCharge.toFixed(4),
            totalPayable: totalPayable.toFixed(4),
            willGet: willGet.toString(),
            exchangeRate: exchangeRate.toFixed(6),
        };
    }, [
        amount,
        selectedCurrency,
        receiverCurrency,
        receiverAmount,
        exchangeData.charges,
    ]);

    // Calculate limits in sender's currency
    const limitsCalculation = useMemo(() => {
        if (!selectedCurrency || !receiverCurrency) {
            return {
                minLimit: "0.00",
                maxLimit: "0.00",
                dailyLimit: "0.00",
                monthlyLimit: "0.00",
                remainingDailyLimit: "0.00",
                remainingMonthlyLimit: "0.00",
            };
        }

        const exchangeRate =
            parseFloat(receiverCurrency.rate) /
            parseFloat(selectedCurrency.rate);

        const minLimit = (
            parseFloat(exchangeData.charges.min_limit) / exchangeRate
        ).toFixed(4);
        const maxLimit = (
            parseFloat(exchangeData.charges.max_limit) / exchangeRate
        ).toFixed(4);
        const dailyLimit = (
            parseFloat(exchangeData.charges.daily_limit) / exchangeRate
        ).toFixed(4);
        const monthlyLimit = (
            parseFloat(exchangeData.charges.monthly_limit) / exchangeRate
        ).toFixed(4);

        const remainingDailyLimit = Number(remainingLimit?.dailyLimit).toFixed(
            4,
        );

        const remainingMonthlyLimit = Number(
            remainingLimit?.monthlyLimit,
        ).toFixed(4);

        return {
            minLimit,
            maxLimit,
            dailyLimit,
            monthlyLimit,
            remainingDailyLimit,
            remainingMonthlyLimit,
        };
    }, [
        selectedCurrency,
        receiverCurrency,
        exchangeData.charges,
        remainingLimit,
    ]);

    // Update receiver amount when amount or currencies change
    useEffect(() => {
        if (amount && selectedCurrency && receiverCurrency) {
            const calculatedAmount = parseFloat(amount) * exchangeRate;
            // Remove .toFixed(4) to avoid forced decimal formatting
            setReceiverAmount(calculatedAmount.toString());
        } else {
            setReceiverAmount("");
        }
    }, [amount, exchangeRate, selectedCurrency, receiverCurrency]);

    const handleReceiverAmountChange = (e) => {
        const value = e.target.value;
        setReceiverAmount(value);

        if (value && selectedCurrency && receiverCurrency) {
            const calculatedAmount = parseFloat(value) / exchangeRate;
            // Remove .toFixed(4) to avoid forced decimal formatting
            setAmount(calculatedAmount.toString());
        } else {
            setAmount("");
        }
    };

    // Handle amount input change with proper validation
    const handleAmountChange = (e) => {
        const value = e.target.value;

        // Allow empty string, numbers, and decimal points
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    // Handle receiver amount input change with proper validation
    const handleReceiverAmountInputChange = (e) => {
        const value = e.target.value;

        // Allow empty string, numbers, and decimal points
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
            setReceiverAmount(value);

            if (value && selectedCurrency && receiverCurrency) {
                const calculatedAmount = parseFloat(value) / exchangeRate;
                setAmount(calculatedAmount.toString());
            } else {
                setAmount("");
            }
        }
    };

    useEffect(() => {
        const fetchExchangeData = async () => {
            try {
                const response = await exchangeGetAPI();
                setExchangeData({
                    ...response.data.data,
                    charges: response.data.data.charges || exchangeData.charges,
                });
                setApiLoading(false);
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
                setApiLoading(false);
            }
        };

        fetchExchangeData();
    }, []);

    const handleExchangeMoney = async (e) => {
        setLoading(true);
        try {
            const response = await SubmitExchangeAPI(
                amount,
                selectedCurrency.code,
                receiverAmount,
                receiverCurrency.code,
            );
            toast.success(response.data.message.success[0]);
            setAmount("");
            setReceiverAmount("");
            const updatedData = await exchangeGetAPI();
            setExchangeData(updatedData.data.data);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message?.error?.[0] ||
                "Something went wrong.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate amount before submitting
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!selectedCurrency || !receiverCurrency) {
            toast.error("Please select both currencies");
            return;
        }

        setShowPinModal(true);
    };

    // FIXED: Remove updateSelectedCurrency call to prevent both currencies from changing
    const handleSenderCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
        updateSelectedCurrency(currency);
        // Don't call updateSelectedCurrency here as it affects the global state
    };

    // FIXED: Remove updateSelectedCurrency call to prevent both currencies from changing
    const handleReceiverCurrencyChange = (currency) => {
        setReceiverCurrency(currency);
        // Don't call updateSelectedCurrency here as it affects the global state
    };

    if (apiLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-[#F9FAFB] border border-gray-200 p-4 rounded-xl h-[72px]">
                            <Skeleton className="h-4 w-24 mx-auto" />
                            <Skeleton className="h-5 w-32 mx-auto mt-2" />
                        </div>
                        <div className="bg-[#F9FAFB] border border-gray-200 p-4 rounded-xl h-[72px]">
                            <Skeleton className="h-4 w-24 mx-auto" />
                            <Skeleton className="h-5 w-32 mx-auto mt-2" />
                        </div>
                        <div className="bg-[#F9FAFB] border border-gray-200 p-4 rounded-xl h-[72px]">
                            <Skeleton className="h-4 w-24 mx-auto" />
                            <Skeleton className="h-5 w-32 mx-auto mt-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <div className="relative">
                                <Skeleton className="h-10 w-full" />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-20">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </div>
                        </div>
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
                        {[...Array(4)].map((_, i) => (
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
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                    <div className="bg-[#F9FAFB] p-5 rounded-xl border border-gray-200 space-y-4">
                        <Skeleton className="h-5 w-40" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-[#F9FAFB] border border-gray-200 shadow-sm p-4 rounded-xl text-center space-y-1.5">
                            <p className="">Exchange Rate</p>
                            <h6 className="font-medium mt-1">
                                {exchangeRateText}
                            </h6>
                        </div>

                        <div className="bg-[#F9FAFB] border border-gray-200 shadow-sm p-4 rounded-xl text-center space-y-1.5">
                            <p className="">Available Balance</p>
                            <h6 className="font-medium text-emerald-600 mt-1">
                                {wallet.balance} {wallet.selectedCurrency?.code}
                            </h6>
                        </div>

                        <div className="bg-[#F9FAFB] border border-gray-200 shadow-sm p-4 rounded-xl text-center space-y-1.5">
                            <p className="">Charge</p>
                            <h6 className="font-medium mt-1">
                                {exchangeData.charges.fixed_charge}{" "}
                                {selectedCurrency?.currency_code} +{" "}
                                {exchangeData.charges.percent_charge}%
                            </h6>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Exchange From
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    value={amount}
                                    placeholder="Enter Amount..."
                                    onChange={handleAmountChange}
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-20">
                                    <Listbox
                                        value={selectedCurrency}
                                        onChange={handleSenderCurrencyChange}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="w-full text-sm text-gray-700 flex justify-between items-center px-3 py-1 bg-white rounded">
                                                <span>
                                                    {selectedCurrency?.code ||
                                                        "Select"}
                                                </span>
                                                <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-md z-20 max-h-60 overflow-auto">
                                                {wallet.currencies.map(
                                                    (currency) => (
                                                        <Listbox.Option
                                                            key={currency.id}
                                                            value={currency}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer px-3 py-1.5 text-sm ${active ? "bg-indigo-100" : ""}`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <div className="flex justify-between">
                                                                    <span>
                                                                        {
                                                                            currency.code
                                                                        }
                                                                    </span>
                                                                    {selected && (
                                                                        <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Listbox.Option>
                                                    ),
                                                )}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Exchange To
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    value={receiverAmount}
                                    placeholder="Enter Amount..."
                                    onChange={handleReceiverAmountInputChange}
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-20">
                                    <Listbox
                                        value={receiverCurrency}
                                        onChange={handleReceiverCurrencyChange}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="w-full text-sm text-gray-700 flex justify-between items-center px-3 py-1 bg-white rounded">
                                                <span>
                                                    {receiverCurrency?.code ||
                                                        "Select"}
                                                </span>
                                                <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-md z-20 max-h-60 overflow-auto">
                                                {wallet.currencies.map(
                                                    (currency) => (
                                                        <Listbox.Option
                                                            key={currency.id}
                                                            value={currency}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer px-3 py-1.5 text-sm ${active ? "bg-indigo-100" : ""}`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <div className="flex justify-between">
                                                                    <span>
                                                                        {
                                                                            currency.code
                                                                        }
                                                                    </span>
                                                                    {selected && (
                                                                        <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Listbox.Option>
                                                    ),
                                                )}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        title={loading ? "Exchanging..." : "Exchange Money"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={loading}
                    />
                </form>
            </div>
            <PinVerificationModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onVerify={handleExchangeMoney}
            />
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <h5 className="text-base font-semibold text-gray-800">
                        Preview
                    </h5>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
                            <span>Entered Amount</span>
                        </div>
                        <span className="font-medium text-gray-800">
                            {amount || "0.00"} {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>Fees & Charges</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.totalFees} {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                            <span>Converted Amount</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.willGet} {receiverCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 font-semibold text-gray-800">
                        <div className="flex items-center space-x-2">
                            <WalletIcon className="w-5 h-5 text-indigo-600" />
                            <span>Total Payable</span>
                        </div>
                        <span>
                            {feesCalculation.totalPayable}{" "}
                            {selectedCurrency?.code}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                <div className="bg-[#F9FAFB] p-5 rounded-xl border border-gray-200 space-y-4 text-sm shadow-sm">
                    <h5 className="text-base font-semibold text-gray-800">
                        Limit Information
                    </h5>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ArrowsUpDownIcon className="w-5 h-5 text-indigo-500" />
                            <span>Transaction Limit</span>
                        </div>
                        <span className="font-medium text-gray-800">
                            {limitText}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                            <span>Daily Limit</span>
                        </div>
                        <span className="text-gray-800">
                            {limitsCalculation.dailyLimit}{" "}
                            {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-violet-500" />
                            <span>Monthly Limit</span>
                        </div>
                        <span className="text-gray-800">
                            {limitsCalculation.monthlyLimit}{" "}
                            {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CalendarDaysIcon className="w-5 h-5 text-yellow-500" />
                            <span>Daily Remaining Limit</span>
                        </div>
                        {remainingLoading ? (
                            <Skeleton className="h-4 w-36" />
                        ) : (
                            <span className="text-gray-800">
                                {limitsCalculation?.remainingDailyLimit}{" "}
                                {selectedCurrency?.code}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-yellow-500" />
                            <span>Monthly Remaining Limit</span>
                        </div>
                        {remainingLoading ? (
                            <Skeleton className="h-4 w-36" />
                        ) : (
                            <span className="text-gray-800">
                                {limitsCalculation?.remainingMonthlyLimit}{" "}
                                {selectedCurrency?.code}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
