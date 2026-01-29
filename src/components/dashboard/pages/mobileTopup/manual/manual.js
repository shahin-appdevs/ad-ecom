"use client";
import { useState, useEffect, useMemo } from "react";
import {
    localMobileTopupInfoGetAPI,
    mobileTopupGetAPI,
    submitLocalMobileTopupAPI,
    SubmitMobileTopupAPI,
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

export default function MobileTopupManualSection() {
    const { wallet, updateSelectedCurrency, fetchWalletCurrencies } =
        useWallet();
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [defaultCurrency, setDefaultCurrency] = useState({
        code: "BDT",
        rate: "1.0000",
    });
    const [amount, setAmount] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [apiLoading, setApiLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [mobileTopupData, setMobileTopupData] = useState({
        topupCharge: {
            fixed_charge: "0.00",
            percent_charge: "0.00",
            min_limit: "0.00",
            max_limit: "0.00",
            daily_limit: "0.00",
            monthly_limit: "0.00",
        },
        operators: [],
        countries: [],
    });

    const [remainingLoading, setRemainingLoading] = useState(false);
    const [remainingLimit, setRemainingLimit] = useState({
        dailyLimit: "0.00",
        monthlyLimit: "0.00",
    });

    const [selectedOperator, setSelectedOperator] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [localTopupInfo, setLocalTopupInfo] = useState({});
    const [selectedOperatorType, setSelectedOperatorType] = useState(null);

    useEffect(() => {
        if (wallet.selectedCurrency) {
            setSelectedCurrency(wallet.selectedCurrency);
        }
    }, [wallet.selectedCurrency]);

    // fetch remaining limits
    useEffect(() => {
        (async () => {
            if (
                !mobileTopupData?.get_remaining_fields ||
                !mobileTopupData?.topupCharge ||
                !selectedCurrency
            ) {
                return;
            }
            try {
                setRemainingLoading(true);
                const getRemainingFields =
                    mobileTopupData?.get_remaining_fields;
                const transactionType = getRemainingFields?.transaction_type;
                const attribute = getRemainingFields?.attribute;
                const senderAmount = amount || "0";
                const currencyCode = selectedCurrency?.code;
                const chargeId = mobileTopupData?.topupCharge?.id;
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
    }, [amount, mobileTopupData, selectedCurrency]);

    // Calculate exchange rate between sender and receiver currencies
    const exchangeRate = useMemo(() => {
        if (selectedCurrency && defaultCurrency) {
            const senderRate = parseFloat(selectedCurrency.rate || 1);
            const receiverRate = parseFloat(defaultCurrency.rate || 1);
            return receiverRate / senderRate;
        }
        return 1;
    }, [selectedCurrency, defaultCurrency]);

    const exchangeRateText = useMemo(() => {
        if (selectedCurrency && defaultCurrency) {
            return `1 ${defaultCurrency.code} = ${exchangeRate.toFixed(4)} ${selectedCurrency.code}`;
        }
        return "N/A";
    }, [exchangeRate, selectedCurrency, defaultCurrency]);

    // Calculate fees and charges
    const feesCalculation = useMemo(() => {
        if (!amount || !selectedCurrency || !mobileTopupData.topupCharge) {
            return {
                totalFees: "0.00",
                fixedCharge: "0.00",
                percentCharge: "0.00",
                totalPayable: "0.00",
                willGet: "0.00",
            };
        }

        const amountNum = parseFloat(amount);
        const fixedCharge =
            parseFloat(mobileTopupData.topupCharge.fixed_charge) *
            parseFloat(selectedCurrency.rate);
        const percentCharge =
            (amountNum *
                parseFloat(mobileTopupData.topupCharge.percent_charge)) /
            100;
        const totalFees = (fixedCharge + percentCharge).toFixed(4);
        const totalPayable = (amountNum + parseFloat(totalFees)).toFixed(4);

        return {
            totalFees,
            fixedCharge: fixedCharge.toFixed(4),
            percentCharge: percentCharge.toFixed(4),
            totalPayable,
            willGet: amountNum.toFixed(4),
        };
    }, [amount, selectedCurrency, mobileTopupData.topupCharge]);

    // Calculate limits in sender's currency
    const limitsCalculation = useMemo(() => {
        if (!selectedCurrency || !mobileTopupData.topupCharge) {
            return {
                minLimit: "0.00",
                maxLimit: "0.00",
                dailyLimit: "0.00",
                monthlyLimit: "0.00",
                remainingDailyLimit: "0.00",
                remainingMonthlyLimit: "0.00",
            };
        }

        const minLimit = (
            parseFloat(mobileTopupData.topupCharge.min_limit) *
            parseFloat(selectedCurrency.rate)
        ).toFixed(4);
        const maxLimit = (
            parseFloat(mobileTopupData.topupCharge.max_limit) *
            parseFloat(selectedCurrency.rate)
        ).toFixed(4);
        const dailyLimit = (
            parseFloat(mobileTopupData.topupCharge.daily_limit) *
            parseFloat(selectedCurrency.rate)
        ).toFixed(4);
        const monthlyLimit = (
            parseFloat(mobileTopupData.topupCharge.monthly_limit) *
            parseFloat(selectedCurrency.rate)
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
    }, [selectedCurrency, mobileTopupData.topupCharge, remainingLimit]);

    const limitText = useMemo(() => {
        return `${limitsCalculation.minLimit} - ${limitsCalculation.maxLimit} ${selectedCurrency?.code || ""}`;
    }, [limitsCalculation, selectedCurrency]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setApiLoading(true);
                const response = await localMobileTopupInfoGetAPI();
                const data = response.data.data;

                setLocalTopupInfo(data);

                setSelectedOperatorType(data?.types[0]);
            } catch (error) {
                handleApiError(error);
            } finally {
                setApiLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setApiLoading(true);
                const response = await mobileTopupGetAPI();
                const data = response.data.data;

                setMobileTopupData({
                    topupCharge:
                        data.topupCharge || mobileTopupData.topupCharge,
                    operators: data.topupTypes || [],
                    countries: data.all_countries || [],
                    get_remaining_fields: data?.get_remaining_fields,
                });

                setDefaultCurrency({
                    code: data.base_curr,
                    rate: data.base_curr_rate,
                });

                if (data.topupTypes?.length > 0) {
                    setSelectedOperator(data.topupTypes[0]);
                }

                if (data.all_countries?.length > 0) {
                    setSelectedCountry(
                        data.all_countries.find((c) => c.iso2 === "US") ||
                            data.all_countries[0],
                    );
                }
            } catch (error) {
                toast.error(
                    error.response?.data?.message?.error?.[0] ||
                        error.message ||
                        "Failed to load top-up data",
                );
            } finally {
                setApiLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleMobileTopup = async () => {
        try {
            setLoading(true);

            const topupData = {
                number: mobileNumber,
                amount: amount,
                type: selectedOperatorType?.id,
                operator: selectedOperator?.operator,
                currency: selectedCurrency.code,
            };

            const response = await submitLocalMobileTopupAPI(topupData);

            toast.success(
                response?.data?.message?.success?.[0] || "Top-up successful",
            );
            setAmount("");
            setMobileNumber("");
            setSelectedOperator(null);
            setSelectedOperatorType(null);
            fetchWalletCurrencies();
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] ||
                    error.message ||
                    "Top-up failed",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const bdMobileRegex = /^(?:\+880|880)?01[3-9]\d{8}$/;

        if (!bdMobileRegex.test(mobileNumber)) {
            toast.error("Invalid mobile number");
            return;
        }

        // Validate inputs
        if (!selectedOperator) {
            toast.error("Please select an operator");
            return;
        }

        if (!selectedOperatorType) {
            toast.error("Please select an operator type");
            return;
        }

        if (!mobileNumber) {
            toast.error("Please enter a mobile number");
            return;
        }

        if (!amount) {
            toast.error("Please enter an amount");
            return;
        }

        const amountNum = parseFloat(amount);
        const minLimit = parseFloat(limitsCalculation.minLimit);
        const maxLimit = parseFloat(limitsCalculation.maxLimit);

        if (isNaN(amountNum)) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (amountNum < minLimit) {
            toast.error(
                `Amount must be at least ${minLimit} ${selectedCurrency?.code}`,
            );
            return;
        }

        if (amountNum > maxLimit) {
            toast.error(
                `Amount must not exceed ${maxLimit} ${selectedCurrency?.code}`,
            );
            return;
        }

        setShowPinModal(true);
    };

    const handleSenderCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
        updateSelectedCurrency(currency);
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
                                {mobileTopupData.topupCharge.fixed_charge}{" "}
                                {selectedCurrency?.code} +{" "}
                                {mobileTopupData.topupCharge.percent_charge}%
                            </h6>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {localTopupInfo?.operators?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Operator
                                </label>
                                <Listbox
                                    value={selectedOperator}
                                    onChange={setSelectedOperator}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                            {selectedOperator?.name
                                                ? `${selectedOperator?.name} - ${selectedOperator?.operator}`
                                                : "Select Operator"}
                                            <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10">
                                            {localTopupInfo?.operators?.map(
                                                (operator, idx) => (
                                                    <Listbox.Option
                                                        key={idx}
                                                        value={operator}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span className="flex justify-between">
                                                                {operator.name}{" "}
                                                                -{" "}
                                                                {
                                                                    operator?.operator
                                                                }
                                                                {selected && (
                                                                    <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ),
                                            )}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>
                        )}
                        {localTopupInfo?.types?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Type
                                </label>
                                <Listbox
                                    value={selectedOperatorType}
                                    onChange={setSelectedOperatorType}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                            {selectedOperatorType?.name
                                                ? `${selectedOperatorType?.name}`
                                                : "Select Operator Type"}
                                            <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10">
                                            {localTopupInfo?.types?.map(
                                                (operator) => (
                                                    <Listbox.Option
                                                        key={operator.id}
                                                        value={operator}
                                                        className={({
                                                            active,
                                                        }) =>
                                                            `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span className="flex justify-between">
                                                                {operator.name}
                                                                {selected && (
                                                                    <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ),
                                            )}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>
                        )}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 "
                                    placeholder="Enter Mobile Number..."
                                    value={mobileNumber}
                                    onChange={(e) =>
                                        setMobileNumber(e.target.value)
                                    }
                                />
                                {/* <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                                    +880
                                </div> */}
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Amount
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    value={amount}
                                    placeholder="Enter Amount..."
                                    onChange={(e) => setAmount(e.target.value)}
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
                            <p className="text-xs text-gray-500 mt-1">
                                Limit: {limitText}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        title={loading ? "Processing..." : "Recharge Now"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={loading || !selectedOperator}
                    />
                </form>
            </div>
            <PinVerificationModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onVerify={handleMobileTopup}
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
                            <span>Will get</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.willGet} {selectedCurrency?.code}
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
