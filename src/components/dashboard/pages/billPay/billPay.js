"use client";
import { useState, useEffect, useMemo } from "react";
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
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import {
    billPayGetAPI,
    SubmitBillPayAPI,
    walletCardRemainingLimitsGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import PinVerificationModal from "@/components/dashboard/partials/PinVerificationModal";
import { useWallet } from "@/components/context/WalletContext";
import { handleApiError } from "@/components/utility/handleApiError";

function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

const BillPaySection = ({ setBillPaySuccess }) => {
    const [selectedBillType, setSelectedBillType] = useState(null);
    const [selectedBillMonth, setSelectedBillMonth] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [amount, setAmount] = useState("");
    const [billNumber, setBillNumber] = useState("");
    const [billTypes, setBillTypes] = useState([]);
    const [billMonths, setBillMonths] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const { wallet, updateSelectedCurrency } = useWallet();
    const [billPayData, setBillPayData] = useState({
        billPayCharge: {
            fixed_charge: "0.00",
            percent_charge: "0.00",
            min_limit: "0.00",
            max_limit: "0.00",
            daily_limit: "0.00",
            monthly_limit: "0.00",
        },
        base_curr: "BDT",
        base_curr_rate: "1.0000",
    });

    const [remainingLoading, setRemainingLoading] = useState(false);
    const [remainingLimit, setRemainingLimit] = useState({
        dailyLimit: "0.00",
        monthlyLimit: "0.00",
    });

    useEffect(() => {
        const fetchBillPayData = async () => {
            try {
                setIsLoading(true);
                const response = await billPayGetAPI();
                const data = response.data.data;
                setBillPayData({
                    ...data,
                    billPayCharge:
                        data.billPayCharge || billPayData.billPayCharge,
                });

                setBillTypes(data.billTypes);
                setSelectedBillType(data.billTypes[0]);

                setBillMonths(
                    data.bill_months.map((month) => ({
                        id: month.id,
                        name: month.field_name,
                    })),
                );
                setSelectedBillMonth({
                    id: data.bill_months[0].id,
                    name: data.bill_months[0].field_name,
                });
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBillPayData();
    }, []);

    // fetch remaining limits
    useEffect(() => {
        (async () => {
            if (
                !billPayData?.get_remaining_fields ||
                !billPayData?.billPayCharge ||
                !wallet?.selectedCurrency?.code
            ) {
                return;
            }
            try {
                setRemainingLoading(true);
                const getRemainingFields = billPayData?.get_remaining_fields;
                const transactionType = getRemainingFields?.transaction_type;
                const attribute = getRemainingFields?.attribute;
                const senderAmount = amount || "0";
                const currencyCode = wallet?.selectedCurrency?.code;
                const chargeId = billPayData?.billPayCharge?.id;
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
    }, [amount, billPayData, wallet?.selectedCurrency?.code]);

    // Calculate exchange rate
    const exchangeRateText = useMemo(() => {
        if (selectedBillType && wallet?.selectedCurrency) {
            const gatewayRate = parseFloat(
                selectedBillType.receiver_currency_rate,
            );

            const walletRate = parseFloat(wallet.selectedCurrency.rate);
            if (walletRate && gatewayRate) {
                const rate = gatewayRate / walletRate;
                return `1 ${wallet.selectedCurrency.code} = ${rate.toFixed(4)} ${selectedBillType.receiver_currency_code}`;
            }
        }
        return "N/A";
    }, [selectedBillType, wallet?.selectedCurrency]);

    // Calculate transaction limits
    const limitText = useMemo(() => {
        if (selectedBillType && wallet?.selectedCurrency) {
            const gatewayRate = parseFloat(
                selectedBillType.receiver_currency_rate,
            );
            const walletRate = parseFloat(wallet.selectedCurrency.rate);
            const min = parseFloat(selectedBillType.minLocalTransactionAmount);
            const max = parseFloat(selectedBillType.maxLocalTransactionAmount);
            if (gatewayRate && walletRate && min && max) {
                const minLimit = min / (gatewayRate / walletRate);
                const maxLimit = max / (gatewayRate / walletRate);
                return `${minLimit.toFixed(4)} - ${maxLimit.toFixed(4)} ${wallet.selectedCurrency.code}`;
            }
        }
        return "0.00 - 0.00";
    }, [selectedBillType, wallet?.selectedCurrency]);

    // Calculate fees and charges
    const feesCalculation = useMemo(() => {
        if (!amount || !selectedBillType || !wallet?.selectedCurrency) {
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

        const amountNum = parseFloat(amount);
        const gatewayRate = parseFloat(selectedBillType.receiver_currency_rate);
        const walletRate = parseFloat(wallet.selectedCurrency.rate);
        const exchangeRate = gatewayRate / walletRate;

        const fixedCharge =
            parseFloat(billPayData.billPayCharge.fixed_charge) *
            parseFloat(wallet.selectedCurrency.rate);
        const percentCharge =
            (amountNum * parseFloat(billPayData.billPayCharge.percent_charge)) /
            100;
        const totalFees = (fixedCharge + percentCharge).toFixed(4);

        const willGet = (
            amountNum * exchangeRate +
            parseFloat(totalFees)
        ).toFixed(4);
        const conversionAmount = (
            amountNum * exchangeRate +
            parseFloat(totalFees)
        ).toFixed(4);
        const totalPayable = (amountNum + parseFloat(totalFees)).toFixed(4);

        return {
            totalFees,
            fixedCharge: fixedCharge.toFixed(4),
            percentCharge: percentCharge.toFixed(4),
            conversionAmount,
            totalPayable,
            willGet,
            exchangeRate: exchangeRate.toFixed(4),
        };
    }, [
        amount,
        selectedBillType,
        wallet?.selectedCurrency,
        billPayData.billPayCharge,
    ]);

    // Calculate limits
    const limitsCalculation = useMemo(() => {
        if (!wallet?.selectedCurrency) {
            return {
                minLimit: "0.00",
                maxLimit: "0.00",
                dailyLimit: "0.00",
                monthlyLimit: "0.00",
                remainingDailyLimit: "0.00",
                remainingMonthlyLimit: "0.00",
            };
        }

        const dailyLimit = (
            parseFloat(billPayData.billPayCharge.daily_limit) *
            parseFloat(wallet.selectedCurrency.rate)
        ).toFixed(4);
        const monthlyLimit = (
            parseFloat(billPayData.billPayCharge.monthly_limit) *
            parseFloat(wallet.selectedCurrency.rate)
        ).toFixed(4);

        const remainingDailyLimit = Number(remainingLimit?.dailyLimit).toFixed(
            4,
        );
        const remainingMonthlyLimit = Number(
            remainingLimit?.monthlyLimit,
        ).toFixed(4);

        return {
            dailyLimit,
            monthlyLimit,
            remainingDailyLimit,
            remainingMonthlyLimit,
        };
    }, [wallet?.selectedCurrency, billPayData.billPayCharge, remainingLimit]);

    const handleBillPay = async (e) => {
        try {
            setIsSubmitting(true);
            const response = await SubmitBillPayAPI(
                selectedBillType.item_type,
                selectedBillType.id.toString(),
                selectedBillMonth.id.toString(),
                billNumber,
                amount,
                wallet.selectedCurrency.code,
            );

            toast.success(response.data.message.success[0]);
            setBillPaySuccess(true);
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message?.error?.[0] ||
                "Something went wrong.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPinModal(true);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-11 w-full" />
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <Skeleton className="h-6 w-32" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-20" />
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
                                {billPayData.billPayCharge.fixed_charge}{" "}
                                {wallet.selectedCurrency?.code} +{" "}
                                {billPayData.billPayCharge.percent_charge}%
                            </h6>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Bill Type
                            </label>
                            <Listbox
                                value={selectedBillType}
                                onChange={setSelectedBillType}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        {selectedBillType?.name ||
                                            "Select Bill Type"}
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10 max-h-60 overflow-auto">
                                        {billTypes.map((bill) => (
                                            <Listbox.Option
                                                key={bill.name}
                                                value={bill}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span className="flex justify-between">
                                                        {bill.name}
                                                        {selected && (
                                                            <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                        )}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Bill Month
                            </label>
                            <Listbox
                                value={selectedBillMonth}
                                onChange={setSelectedBillMonth}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        {selectedBillMonth?.name ||
                                            "Select Bill Month"}
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10 max-h-60 overflow-auto">
                                        {billMonths.map((bill) => (
                                            <Listbox.Option
                                                key={bill.id}
                                                value={bill}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span className="flex justify-between">
                                                        {bill.name}
                                                        {selected && (
                                                            <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                        )}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Bill Number
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Number..."
                                value={billNumber}
                                onChange={(e) => setBillNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Enter Amount
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    value={amount}
                                    placeholder="Enter Amount..."
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-20">
                                    <Listbox
                                        value={wallet.selectedCurrency}
                                        onChange={updateSelectedCurrency}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="w-full text-sm text-gray-700 flex justify-between items-center px-3 py-1 bg-white rounded">
                                                <span>
                                                    {
                                                        wallet?.selectedCurrency
                                                            ?.code
                                                    }
                                                </span>
                                                <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
                                            </Listbox.Button>
                                            {wallet?.currencies?.length > 0 && (
                                                <Listbox.Options className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-md z-20 max-h-60 overflow-auto">
                                                    {wallet.currencies.map(
                                                        (currency) => (
                                                            <Listbox.Option
                                                                key={
                                                                    currency.id
                                                                }
                                                                value={currency}
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `cursor-pointer px-3 py-1.5 text-sm ${active ? "bg-indigo-100" : ""}`
                                                                }
                                                            >
                                                                {({
                                                                    selected,
                                                                }) => (
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
                                            )}
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        title={isSubmitting ? "Paying..." : "Pay Bill"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        type="submit"
                        disabled={isSubmitting}
                    />
                </form>
            </div>
            <PinVerificationModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onVerify={handleBillPay}
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
                            {amount || "0.00"} {wallet?.selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-cyan-500" />
                            <span>Conversion Amount</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.conversionAmount}{" "}
                            {selectedBillType?.receiver_currency_code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>Fees & Charges</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.totalFees}{" "}
                            {wallet?.selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 font-semibold text-gray-800">
                        <div className="flex items-center space-x-2">
                            <WalletIcon className="w-5 h-5 text-indigo-600" />
                            <span>Total Payable</span>
                        </div>
                        <span>
                            {feesCalculation.totalPayable}{" "}
                            {wallet?.selectedCurrency?.code}
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
                            {wallet?.selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-violet-500" />
                            <span>Monthly Limit</span>
                        </div>
                        <span className="text-gray-800">
                            {limitsCalculation.monthlyLimit}{" "}
                            {wallet?.selectedCurrency?.code}
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
                                {wallet?.selectedCurrency?.code}
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
                                {wallet?.selectedCurrency?.code}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillPaySection;
