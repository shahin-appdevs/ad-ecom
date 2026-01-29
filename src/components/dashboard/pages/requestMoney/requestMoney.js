"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import {
    requestMoneyGetAPI,
    SubmitRequestMoneyAPI,
    requestMoneyCheckUserAPI,
    requestMoneyScanAPI,
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

export default function RequestMoneySection() {
    const { wallet, updateSelectedCurrency } = useWallet();
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [defaultCurrency, setDefaultCurrency] = useState({
        code: "BDT",
        rate: "1.0000",
    });
    const [amount, setAmount] = useState("");
    const [credentials, setCredentials] = useState("");
    const [remark, setRemark] = useState("");
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userData, setUserData] = useState(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [requestMoneyData, setRequestMoneyData] = useState({
        requestMoneyCharge: {
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
            const rate =
                parseFloat(defaultCurrency.rate) *
                parseFloat(selectedCurrency.rate);
            return `1 ${defaultCurrency.code} = ${rate.toFixed(4)} ${selectedCurrency.code}`;
        }
        return "N/A";
    }, [selectedCurrency, defaultCurrency]);

    // Calculate transaction limits
    const limitText = useMemo(() => {
        if (selectedCurrency) {
            const minLimit =
                parseFloat(requestMoneyData.requestMoneyCharge.min_limit || 0) *
                parseFloat(selectedCurrency.rate || 0);
            const maxLimit =
                parseFloat(requestMoneyData.requestMoneyCharge.max_limit || 0) *
                parseFloat(selectedCurrency.rate || 0);
            return `${minLimit.toFixed(4)} - ${maxLimit.toFixed(4)} ${selectedCurrency.code}`;
        }
        return "0.00 - 0.00";
    }, [selectedCurrency, requestMoneyData.requestMoneyCharge]);

    // Calculate fees and charges
    const feesCalculation = useMemo(() => {
        if (!amount || !selectedCurrency || !defaultCurrency) {
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

        const fixedCharge =
            parseFloat(requestMoneyData.requestMoneyCharge.fixed_charge) *
            parseFloat(selectedCurrency.rate);
        const percentCharge =
            (amountNum *
                parseFloat(
                    requestMoneyData.requestMoneyCharge.percent_charge,
                )) /
            100;
        const totalFees = (fixedCharge + percentCharge).toFixed(4);

        const exchangeRate =
            parseFloat(defaultCurrency.rate) /
            parseFloat(selectedCurrency.rate);
        const willGet = amountNum.toFixed(4);
        const totalPayable = (amountNum + parseFloat(totalFees)).toFixed(4);

        return {
            totalFees,
            fixedCharge: fixedCharge.toFixed(4),
            percentCharge: percentCharge.toFixed(4),
            totalPayable,
            willGet,
            exchangeRate: exchangeRate.toFixed(4),
        };
    }, [
        amount,
        selectedCurrency,
        defaultCurrency,
        requestMoneyData.requestMoneyCharge,
    ]);

    // Calculate limits in sender's currency
    const limitsCalculation = useMemo(() => {
        if (!selectedCurrency) {
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
            parseFloat(requestMoneyData.requestMoneyCharge.min_limit) *
            parseFloat(selectedCurrency.rate)
        ).toFixed(4);
        const maxLimit = (
            parseFloat(requestMoneyData.requestMoneyCharge.max_limit) *
            parseFloat(selectedCurrency.rate)
        ).toFixed(4);
        const dailyLimit = (
            parseFloat(requestMoneyData.requestMoneyCharge.daily_limit) *
            parseFloat(selectedCurrency.rate)
        ).toFixed(4);
        const monthlyLimit = (
            parseFloat(requestMoneyData.requestMoneyCharge.monthly_limit) *
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
    }, [selectedCurrency, requestMoneyData.requestMoneyCharge, remainingLimit]);

    useEffect(() => {
        fetchRequestMoneyData();
    }, []);

    useEffect(() => {
        if (credentials && credentials.length > 3) {
            const timer = setTimeout(() => {
                checkUser();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [credentials]);

    const fetchRequestMoneyData = async () => {
        try {
            setIsLoading(true);
            const response = await requestMoneyGetAPI();
            const data = response.data.data;
            setRequestMoneyData({
                ...data,
                requestMoneyCharge:
                    data.requestMoneyCharge ||
                    requestMoneyData.requestMoneyCharge,
            });
            setDefaultCurrency({
                code: data.base_curr,
                rate: data.base_curr_rate,
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] ||
                    "Failed to load request money data",
            );
        } finally {
            setIsLoading(false);
        }
    };

    // fetch remaining limits
    useEffect(() => {
        (async () => {
            if (
                !requestMoneyData?.get_remaining_fields ||
                !requestMoneyData?.requestMoneyCharge ||
                !selectedCurrency
            ) {
                return;
            }
            try {
                setRemainingLoading(true);
                const getRemainingFields =
                    requestMoneyData?.get_remaining_fields;
                const transactionType = getRemainingFields?.transaction_type;
                const attribute = getRemainingFields?.attribute;
                const senderAmount = amount || "0";
                const currencyCode = selectedCurrency?.code;
                const chargeId = requestMoneyData?.requestMoneyCharge?.id;
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
    }, [amount, requestMoneyData, selectedCurrency]);

    const checkUser = async () => {
        try {
            const response = await requestMoneyCheckUserAPI(credentials);
            setUserData(response.data.data);
            toast.success("User found and valid for request money");
        } catch (error) {
            setUserData(null);
            if (error.response?.status !== 404) {
                toast.error(
                    error.response?.data?.message?.error?.[0] ||
                        "Error checking user",
                );
            }
        }
    };

    const handleRequestMoney = async (e) => {
        try {
            setIsSubmitting(true);
            const response = await SubmitRequestMoneyAPI(
                amount,
                selectedCurrency.code,
                credentials,
                remark,
            );

            toast.success("Money request sent successfully!");
            setAmount("");
            setCredentials("");
            setRemark("");
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] ||
                    "Failed to send money request",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPinModal(true);
    };

    const handleScanSuccess = async (qrCode) => {
        try {
            const response = await requestMoneyScanAPI(qrCode);
            const userData = response.data.data;
            setCredentials(userData.email || userData.mobile);
            toast.success("QR code scanned successfully");
            closeCamera();
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] ||
                    "Failed to scan QR code",
            );
            closeCamera();
        }
    };

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
            toast.error(
                "Could not access the camera. Please make sure you've granted camera permissions.",
            );
            setIsCameraOpen(false);
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setIsCameraOpen(false);
    };

    const handleSenderCurrencyChange = (currency) => {
        setSelectedCurrency(currency);
        updateSelectedCurrency(currency);
    };

    if (isLoading) {
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
                                {
                                    requestMoneyData.requestMoneyCharge
                                        .fixed_charge
                                }{" "}
                                {selectedCurrency?.code} +{" "}
                                {
                                    requestMoneyData.requestMoneyCharge
                                        .percent_charge
                                }
                                %
                            </h6>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Phone/Email (User)
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter Email/Phone..."
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
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Note (Optional)
                            </label>
                            <textarea
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                                placeholder="Write a note about this transaction..."
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        title={isSubmitting ? "Confirming..." : "Confirm"}
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
                onVerify={handleRequestMoney}
            />
            <Dialog
                open={isCameraOpen}
                onClose={closeCamera}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/75" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-6 relative">
                        <div className="absolute top-4 right-4">
                            <button
                                onClick={closeCamera}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <Dialog.Title className="text-xl font-semibold mb-4">
                            Scan QR Code
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
                            Point your camera at a QR code to scan
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                onClick={() =>
                                    handleScanSuccess("MOCK_QR_CODE")
                                }
                            >
                                Scan QR Code
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
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
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>Fees & Charges</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.totalFees}{" "}
                            {wallet?.selectedCurrency?.code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                            <span>Will get</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.willGet}{" "}
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
