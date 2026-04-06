"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    sendMoneyGetAPI,
    SubmitSendMoneyAPI,
    SendMoneyCheckUserAPI,
    SendMoneyScanAPI,
    walletCardRemainingLimitsGetAPI,
} from "@root/services/apiClient/apiClient";
import { Dialog } from "@headlessui/react";
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
    CameraIcon,
    XMarkIcon,
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

const transfer_types = [
    { id: 1, name: "Main Wallet", value: "p2p" },
    { id: 2, name: "Shopping Wallet", value: "main_to_shopping" },
];

export default function SendMoneySection({ setRefetch }) {
    const t = useTranslations("Dashboard.wallet.sendMoney");
    const { wallet, updateSelectedCurrency } = useWallet();
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [receiverCurrency, setReceiverCurrency] = useState(
        wallet.currencies[0] || null,
    );
    const [amount, setAmount] = useState("");
    const [receiverAmount, setReceiverAmount] = useState("");
    const [credentials, setCredentials] = useState("");
    const [remark, setRemark] = useState("");
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [selectedTransferType, setSelectedTransferType] = useState(
        transfer_types[0],
    );
    const [sendMoneyData, setSendMoneyData] = useState({
        sendMoneyCharge: {
            fixed_charge: "0.00",
            percent_charge: "0.00",
            min_limit: "0.00",
            max_limit: "0.00",
            daily_limit: "0.00",
            monthly_limit: "0.00",
        },
    });
    const [remainingLoading, setRemainingLoading] = useState(false);
    const [remainingLimit, setRemainingLimit] = useState({
        dailyLimit: "0.00",
        monthlyLimit: "0.00",
    });

    const videoRef = useRef(null);
    const streamRef = useRef(null);

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
            if (
                !sendMoneyData?.get_remaining_fields ||
                !sendMoneyData?.sendMoneyCharge ||
                !selectedCurrency
            ) {
                return;
            }
            try {
                setRemainingLoading(true);
                const getRemainingFields = sendMoneyData?.get_remaining_fields;
                const transactionType = getRemainingFields?.transaction_type;
                const attribute = getRemainingFields?.attribute;
                const senderAmount = amount || "0";
                const currencyCode = selectedCurrency?.code;
                const chargeId = sendMoneyData?.sendMoneyCharge?.id;
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
                const data = error?.response?.data?.data;

                setRemainingLimit({
                    dailyLimit: data?.remainingDaily || "0.00",
                    monthlyLimit: data?.remainingMonthly || "0.00",
                });
            } finally {
                setRemainingLoading(false);
            }
        })();
    }, [amount, sendMoneyData, selectedCurrency]);

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
            return `1 ${selectedCurrency.code} = ${exchangeRate.toFixed(4)} ${receiverCurrency.code}`;
        }
        return "N/A";
    }, [exchangeRate, selectedCurrency, receiverCurrency]);

    // Calculate transaction limits
    const limitText = useMemo(() => {
        if (selectedCurrency) {
            const minLimit =
                parseFloat(sendMoneyData.sendMoneyCharge.min_limit || 0) *
                parseFloat(selectedCurrency.rate || 0);
            const maxLimit =
                parseFloat(sendMoneyData.sendMoneyCharge.max_limit || 0) *
                parseFloat(selectedCurrency.rate || 0);
            return `${minLimit.toFixed(4)} - ${maxLimit.toFixed(4)} ${selectedCurrency.code}`;
        }
        return "0.00 - 0.00";
    }, [selectedCurrency, sendMoneyData.sendMoneyCharge]);

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
            parseFloat(sendMoneyData.sendMoneyCharge.fixed_charge) *
            parseFloat(selectedCurrency.rate);
        const percentCharge =
            (amountNum *
                parseFloat(sendMoneyData.sendMoneyCharge.percent_charge)) /
            100;
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
            exchangeRate: exchangeRate.toFixed(4),
        };
    }, [
        amount,
        selectedCurrency,
        receiverCurrency,
        receiverAmount,
        sendMoneyData.sendMoneyCharge,
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
            parseFloat(sendMoneyData.sendMoneyCharge.min_limit) / exchangeRate
        ).toFixed(4);
        const maxLimit = (
            parseFloat(sendMoneyData.sendMoneyCharge.max_limit) / exchangeRate
        ).toFixed(4);
        const dailyLimit = (
            parseFloat(sendMoneyData.sendMoneyCharge.daily_limit) / exchangeRate
        ).toFixed(4);
        const monthlyLimit = (
            parseFloat(sendMoneyData.sendMoneyCharge.monthly_limit) /
            exchangeRate
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
        sendMoneyData.sendMoneyCharge,
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

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await sendMoneyGetAPI();
                const data = response.data.data;
                setSendMoneyData({
                    ...data,
                    sendMoneyCharge:
                        data.sendMoneyCharge || sendMoneyData.sendMoneyCharge,
                });
                setIsLoading(false);
            } catch (error) {
                toast.error(
                    error.response?.data?.message?.error?.[0] ||
                        t("failedLoad"),
                );
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [wallet.selectedCurrency, sendMoneyData.sendMoneyCharge]);

    useEffect(() => {
        const checkUser = async () => {
            if (credentials && credentials.length > 3) {
                try {
                    await SendMoneyCheckUserAPI(credentials);
                } catch (error) {
                    toast.error(
                        error.response?.data?.message?.error?.[0] ||
                            t("userNotFound"),
                    );
                }
            }
        };

        const debounceTimer = setTimeout(() => {
            checkUser();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [credentials]);

    const openCamera = async () => {
        try {
            setIsCameraOpen(true);
            await new Promise((resolve) => setTimeout(resolve, 100));

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                },
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            handleApiError(err, t("cameraError"));
            setIsCameraOpen(false);
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsCameraOpen(false);
    };

    const handleScanSuccess = async (qrCode) => {
        try {
            const response = await SendMoneyScanAPI(qrCode);
            setCredentials(response.data.data.credentials);
            closeCamera();
            toast.success(response?.data?.message?.success?.[0]);
        } catch (error) {
            handleApiError(error, t("failedScan"));
        }
    };

    const handleSendMoney = async () => {
        try {
            setIsSubmitting(true);
            const response = await SubmitSendMoneyAPI(
                selectedTransferType.value,
                credentials,
                amount,
                selectedCurrency.code,
                receiverAmount,
                receiverCurrency.code,
                remark,
            );

            toast.success(response?.data?.message?.success?.[0]);
            setAmount("");
            setReceiverAmount("");
            setCredentials("");
            setRemark("");
        } catch (error) {
            handleApiError(error, t("failedTransfer"));
        } finally {
            setIsSubmitting(false);
            setRefetch((isRefetch) => !isRefetch);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 xl:col-span-7 space-y-5">
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
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 xl:col-span-5">
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 xl:col-span-7">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-[#F9FAFB] border  border-gray-200 shadow-sm p-4 rounded-xl text-center space-y-1.5">
                            <p className="">{t("exchangeRate")}</p>
                            <h6 className="font-medium mt-1 [direction:ltr]">
                                {exchangeRateText}
                            </h6>
                        </div>

                        <div className="bg-[#F9FAFB] border border-gray-200 shadow-sm p-4 rounded-xl text-center space-y-1.5">
                            <p className="">{t("availableBalance")}</p>
                            <h6 className="font-medium text-emerald-600 mt-1 [direction:ltr]">
                                {wallet.balance} {wallet.selectedCurrency?.code}
                            </h6>
                        </div>

                        <div className="bg-[#F9FAFB] border border-gray-200 shadow-sm p-4 rounded-xl text-center space-y-1.5">
                            <p className="">{t("charge")}</p>
                            <h6 className="font-medium mt-1 [direction:ltr]">
                                {sendMoneyData.sendMoneyCharge.fixed_charge}{" "}
                                {selectedCurrency?.currency_code} +{" "}
                                {sendMoneyData.sendMoneyCharge.percent_charge}%
                            </h6>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t("transferType")}
                            </label>
                            <Listbox
                                value={selectedTransferType}
                                onChange={setSelectedTransferType}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        <span>{selectedTransferType.name}</span>
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-lg rounded-md py-1 z-10">
                                        {transfer_types.map((type) => (
                                            <Listbox.Option
                                                key={type.id}
                                                value={type}
                                                className={({ active }) =>
                                                    `cursor-default select-none relative py-2 pl-10 pr-4 ${
                                                        active
                                                            ? "bg-indigo-100 text-indigo-900"
                                                            : "text-gray-900"
                                                    }`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span
                                                            className={`block truncate ${
                                                                selected
                                                                    ? "font-medium"
                                                                    : "font-normal"
                                                            }`}
                                                        >
                                                            {type.name}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                <CheckIcon className="w-5 h-5" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t("phoneEmail")}
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder={t("enterEmailPhone")}
                                    value={credentials}
                                    onChange={(e) =>
                                        setCredentials(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                                    onClick={openCamera}
                                >
                                    <CameraIcon className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {t("senderAmount")}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    value={amount}
                                    placeholder={t("enterAmount")}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <div className="absolute ltr:right-2 rtl:left-2 top-1/2 transform -translate-y-1/2 w-20">
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
                                {t("receiverAmount")}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    value={receiverAmount}
                                    placeholder={t("enterAmount")}
                                    onChange={handleReceiverAmountChange}
                                />
                                <div className="absolute ltr:right-2 rtl:left-2 top-1/2 transform -translate-y-1/2 w-20">
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
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                {t("note")}
                            </label>
                            <textarea
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                placeholder={t("notePlaceholder")}
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        title={
                            isSubmitting ? t("transferring") : t("submitButton")
                        }
                        variant="primary"
                        size="md"
                        className={`w-full ${isSubmitting ? "cursor-not-allowed !bg-gray-400" : ""}`}
                        type="submit"
                        disabled={isSubmitting}
                    />
                </form>
            </div>
            <PinVerificationModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onVerify={handleSendMoney}
            />
            <Dialog
                open={isCameraOpen}
                onClose={closeCamera}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-sm 2xl:max-w-2xl rounded-xl bg-white p-6 relative">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={closeCamera}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <Dialog.Title className="text-xl font-semibold mb-4">
                            {t("scanQrCode")}
                        </Dialog.Title>

                        <div className="relative aspect-square w-full bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="border-4 border-white w-64 h-64 rounded-md opacity-50"></div>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-600">
                            {t("pointCamera")}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                onClick={() =>
                                    handleScanSuccess("MOCK_QR_CODE")
                                }
                            >
                                {t("scanQrCode")}
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 xl:col-span-5">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <h5 className="text-base font-semibold text-gray-800">
                        {t("preview")}
                    </h5>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center  gap-2 text-gray-600">
                            <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
                            <span>{t("enteredAmount")}</span>
                        </div>
                        <span className="font-medium text-gray-800 [direction:ltr]">
                            {amount || "0.00"} {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>{t("feesAndCharges")}</span>
                        </div>
                        <span className="text-gray-800 [direction:ltr]">
                            {feesCalculation.totalFees} {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                            <span>{t("recipientReceived")}</span>
                        </div>
                        <span className="text-gray-800 [direction:ltr]">
                            {feesCalculation.willGet} {receiverCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                            <WalletIcon className="w-5 h-5 text-indigo-600" />
                            <span>{t("totalPayable")}</span>
                        </div>
                        <span className="[direction:ltr]">
                            {feesCalculation.totalPayable}{" "}
                            {selectedCurrency?.code}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                <div className="bg-[#F9FAFB] p-5 rounded-xl border border-gray-200 space-y-4 text-sm shadow-sm">
                    <h5 className="text-base font-semibold text-gray-800">
                        {t("limitInfo")}
                    </h5>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <ArrowsUpDownIcon className="w-5 h-5 text-indigo-500" />
                            <span>{t("transactionLimit")}</span>
                        </div>
                        <span className="font-medium text-gray-800 [direction:ltr]">
                            {limitText}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                            <span>{t("dailyLimit")}</span>
                        </div>
                        <span className="text-gray-800 [direction:ltr]">
                            {limitsCalculation.dailyLimit}{" "}
                            {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-violet-500" />
                            <span>{t("monthlyLimit")}</span>
                        </div>
                        <span className="text-gray-800 [direction:ltr]">
                            {limitsCalculation.monthlyLimit}{" "}
                            {selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <CalendarDaysIcon className="w-5 h-5 text-yellow-500" />
                            <span>{t("dailyRemaining")}</span>
                        </div>
                        {remainingLoading ? (
                            <Skeleton className="h-4 w-36" />
                        ) : (
                            <span className="text-gray-800 [direction:ltr]">
                                {limitsCalculation?.remainingDailyLimit}{" "}
                                {selectedCurrency?.code}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-yellow-500" />
                            <span>{t("monthlyRemaining")}</span>
                        </div>
                        {remainingLoading ? (
                            <Skeleton className="h-4 w-36" />
                        ) : (
                            <span className="text-gray-800 [direction:ltr]">
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
