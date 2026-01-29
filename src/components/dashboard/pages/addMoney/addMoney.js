"use client";
import { useState, useEffect, useMemo } from "react";
import {
    addMoneyGetAPI,
    InsertAddMoneyAPI,
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
    QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";
import PinVerificationModal from "@/components/dashboard/partials/PinVerificationModal";
import { useWallet } from "@/components/context/WalletContext";
import Image from "next/image";
import getImageUrl from "@/components/utility/getImageUrl";
import { handleApiError } from "@/components/utility/handleApiError";

function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

const DEPOSIT_TYPES = [
    { id: 1, name: "Main Wallet", value: "MAIN_WALLET" },
    { id: 2, name: "Shopping Wallet", value: "SHOPPING_WALLET" },
];

export default function AddMoneySection() {
    const [gateways, setGateways] = useState([]);
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [imagePath, setImagePath] = useState(undefined);
    const [defaultImage, setDefaultImage] = useState(undefined);

    const { wallet, updateSelectedCurrency } = useWallet();
    const [selectedDepositType, setSelectedDepositType] = useState(
        DEPOSIT_TYPES[0],
    );
    const [remainingLoading, setRemainingLoading] = useState(false);
    const [remainingLimit, setRemainingLimit] = useState({
        dailyLimit: "0.00",
        monthlyLimit: "0.00",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await addMoneyGetAPI();
                setApiData(response.data.data);
                setGateways(response.data.data.gateways);
                setImagePath(response.data.data.image_path);
                setDefaultImage(response.data.data.default_image);

                if (response.data.data.gateways.length > 0) {
                    setSelectedGateway(response.data.data.gateways[0]);
                    if (response.data.data.gateways[0].currencies.length > 0) {
                        setSelectedCurrency(
                            response.data.data.gateways[0].currencies[0],
                        );
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedGateway && selectedGateway.currencies.length > 0) {
            setSelectedCurrency(selectedGateway.currencies[0]);
        }
    }, [selectedGateway]);

    // fetch remaining limits
    useEffect(() => {
        (async () => {
            if (!apiData || !selectedCurrency) {
                return;
            }
            try {
                setRemainingLoading(true);
                const getRemainingFields = apiData?.get_remaining_fields;
                const transactionType = getRemainingFields?.transaction_type;
                const attribute = getRemainingFields?.attribute;
                const senderAmount = amount || "0";
                const currencyCode = selectedCurrency?.currency_code;
                const chargeId = selectedCurrency?.id;
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
    }, [amount, apiData, selectedCurrency]);

    const formattedCharges = useMemo(() => {
        if (!selectedCurrency) {
            return {
                fixed_charge: "0.0000",
                percent_charge: "0.0000",
            };
        }

        return {
            fixed_charge: parseFloat(
                selectedCurrency.fixed_charge || 0,
            ).toFixed(4),
            percent_charge: parseFloat(
                selectedCurrency.percent_charge || 0,
            ).toFixed(4),
        };
    }, [selectedCurrency]);

    // Calculate exchange rate
    const exchangeRateText = useMemo(() => {
        if (selectedCurrency && wallet?.selectedCurrency) {
            const gatewayRate = parseFloat(selectedCurrency.rate);
            const walletRate = parseFloat(wallet.selectedCurrency.rate);
            if (walletRate && gatewayRate) {
                const rate = gatewayRate / walletRate;
                return `1 ${wallet.selectedCurrency.code} = ${rate.toFixed(4)} ${selectedCurrency.currency_code}`;
            }
        }
        return "N/A";
    }, [selectedCurrency, wallet?.selectedCurrency]);

    // Calculate transaction limits
    const limitText = useMemo(() => {
        if (selectedCurrency && wallet?.selectedCurrency) {
            const gatewayRate = parseFloat(selectedCurrency.rate);
            const walletRate = parseFloat(wallet.selectedCurrency.rate);
            const min = parseFloat(selectedCurrency.min_limit);
            const max = parseFloat(selectedCurrency.max_limit);
            if (gatewayRate && walletRate && min && max) {
                const minLimit = min / (gatewayRate / walletRate);
                const maxLimit = max / (gatewayRate / walletRate);
                return `${minLimit.toFixed(4)} - ${maxLimit.toFixed(4)} ${wallet.selectedCurrency.code}`;
            }
        }
        return "0.00 - 0.00";
    }, [selectedCurrency, wallet?.selectedCurrency]);

    // Calculate fees and charges
    const feesCalculation = useMemo(() => {
        if (!amount || !selectedCurrency || !wallet?.selectedCurrency) {
            return {
                totalFees: "0.00",
                fixedCharge: "0.00",
                percentCharge: "0.00",
                totalPayable: "0.00",
                willGet: "0.00",
                exchangeRate: "0.00",
            };
        }

        const amountNum = parseFloat(amount);
        const gatewayRate = parseFloat(selectedCurrency.rate);
        const walletRate = parseFloat(wallet.selectedCurrency.rate);
        const exchangeRate = gatewayRate / walletRate;

        const fixedCharge = parseFloat(selectedCurrency.fixed_charge);
        const percentCharge =
            (amountNum * parseFloat(selectedCurrency.percent_charge)) / 100;
        const totalFees = (fixedCharge + percentCharge).toFixed(4);

        const willGet = amountNum.toFixed(4);
        const totalPayable = (
            amountNum * exchangeRate +
            parseFloat(totalFees)
        ).toFixed(4);

        return {
            totalFees,
            fixedCharge: fixedCharge.toFixed(4),
            percentCharge: percentCharge.toFixed(4),
            totalPayable,
            willGet,
            exchangeRate: exchangeRate.toFixed(4),
        };
    }, [amount, selectedCurrency, wallet?.selectedCurrency]);

    // Calculate limits
    const limitsCalculation = useMemo(() => {
        if (!selectedCurrency || !wallet?.selectedCurrency) {
            return {
                minLimit: "0.00",
                maxLimit: "0.00",
                dailyLimit: "0.00",
                monthlyLimit: "0.00",
                remainingDailyLimit: "0.00",
                remainingMonthlyLimit: "0.00",
            };
        }

        const gatewayRate = parseFloat(selectedCurrency.rate);
        const walletRate = parseFloat(wallet.selectedCurrency.rate);
        const exchangeRate = gatewayRate / walletRate;

        const minLimit = (
            parseFloat(selectedCurrency.min_limit) / exchangeRate
        ).toFixed(4);
        const maxLimit = (
            parseFloat(selectedCurrency.max_limit) / exchangeRate
        ).toFixed(4);
        const dailyLimit = (
            parseFloat(selectedCurrency.daily_limit) / exchangeRate
        ).toFixed(4);
        const monthlyLimit = (
            parseFloat(selectedCurrency.monthly_limit) / exchangeRate
        ).toFixed(4);

        const remainingDailyLimit = (
            Number(remainingLimit?.dailyLimit) / exchangeRate
        ).toFixed(4);

        const remainingMonthlyLimit = (
            Number(remainingLimit?.monthlyLimit) / exchangeRate
        ).toFixed(4);

        return {
            minLimit,
            maxLimit,
            dailyLimit,
            monthlyLimit,
            remainingDailyLimit,
            remainingMonthlyLimit,
        };
    }, [selectedCurrency, wallet?.selectedCurrency, remainingLimit]);

    const handleAddMoney = async (e) => {
        setLoading(true);
        try {
            const response = await InsertAddMoneyAPI(
                selectedDepositType.value,
                amount,
                selectedCurrency.alias,
                wallet.selectedCurrency.code,
                "WEB",
                `${window.location.origin}/user/add/money/success`,
                `${window.location.origin}/user/add/money/cancel`,
            );

            if (response.data.data.gateway_type === "AUTOMATIC") {
                if (response.data.data.identify === "paypal") {
                    const approveUrl = response.data.data.url.find(
                        (u) => u.rel === "approve",
                    ).href;
                    window.location.href = approveUrl;
                } else if (response.data.data.identify === "stripe") {
                    window.location.href = response.data.data.url;
                } else {
                    window.location.href = response.data.data.url;
                }
            } else if (response.data.data.gateway_type === "MANUAL") {
                const transactionData = {
                    trx: response.data.data.payment_information?.trx,
                    gateway: response.data.data.gateway_currency_name,
                    amount: response.data.data.payment_information
                        ?.request_amount,
                    payable:
                        response.data.data.payment_information?.payable_amount,
                    details: response.data.data.details,
                    exchangeRate:
                        response.data.data.payment_information?.exchange_rate,
                    inputFields: response.data.data.input_fields,
                    method: response.data.data.method,
                    url: response.data.data.url,
                };
                sessionStorage.setItem(
                    "manualPaymentData",
                    JSON.stringify(transactionData),
                );

                window.location.href = "/user/add/money/manual";
            } else if (
                response.data.data.gateway_info?.gateway_type === "AUTOMATIC"
            ) {
                if (response.data.data.gateway_info.identify === "Tatum") {
                    const cryptoData = {
                        trx: response.data.data.gateway_info.trx,
                        address:
                            response.data.data.gateway_info.address_info
                                .address,
                        coin: response.data.data.gateway_info.address_info.coin,
                        payableAmount:
                            response.data.data.payment_info.payable_amount,
                        inputFields:
                            response.data.data.gateway_info.address_info
                                .input_fields,
                        submitUrl:
                            response.data.data.gateway_info.address_info
                                .submit_url,
                        paymentInfo: response.data.data.payment_info,
                    };
                    sessionStorage.setItem(
                        "cryptoPaymentData",
                        JSON.stringify(cryptoData),
                    );
                    window.location.href = "/user/add/money/crypto";
                } else {
                    window.location.href = response.data.data.url;
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPinModal(true);
    };

    if (!apiData) {
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
                                {formattedCharges.fixed_charge}{" "}
                                {selectedCurrency?.currency_code} +{" "}
                                {formattedCharges.percent_charge}%
                            </h6>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                                Deposit Type
                            </label>
                            <Listbox
                                value={selectedDepositType}
                                onChange={setSelectedDepositType}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        <span>{selectedDepositType.name}</span>
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-lg rounded-md py-1 z-10">
                                        {DEPOSIT_TYPES.map((type) => (
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
                                Select Payment Gateway
                            </label>
                            <Listbox
                                value={selectedCurrency}
                                onChange={setSelectedCurrency}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        <div>
                                            <Image
                                                src={
                                                    selectedGateway?.image
                                                        ? getImageUrl(
                                                              selectedGateway.image,
                                                              imagePath,
                                                          )
                                                        : getImageUrl(
                                                              defaultImage,
                                                          )
                                                }
                                                height={20}
                                                width={20}
                                                alt="payment method logo"
                                                className="inline me-[6px]"
                                            />

                                            {selectedCurrency
                                                ? `${selectedGateway.alias.charAt(0).toUpperCase() + selectedGateway.alias.slice(1)} - ${selectedCurrency.currency_code}`
                                                : "Select Payment Method"}
                                        </div>
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10 max-h-60 overflow-auto">
                                        {gateways.map((gateway) => (
                                            <div
                                                key={gateway.id}
                                                className="px-2 py-1"
                                            >
                                                <div className="text-xs font-medium text-gray-500 px-2 py-1">
                                                    <Image
                                                        src={
                                                            gateway?.image
                                                                ? getImageUrl(
                                                                      gateway.image,
                                                                      imagePath,
                                                                  )
                                                                : getImageUrl(
                                                                      defaultImage,
                                                                  )
                                                        }
                                                        height={20}
                                                        width={20}
                                                        alt="payment method logo"
                                                        className="inline me-[6px]"
                                                    />

                                                    {gateway.alias
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        gateway.alias.slice(1)}
                                                </div>
                                                {gateway.currencies.map(
                                                    (currency) => (
                                                        <Listbox.Option
                                                            key={currency.id}
                                                            value={currency}
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                            }
                                                            onClick={() =>
                                                                setSelectedGateway(
                                                                    gateway,
                                                                )
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <div className="flex justify-between items-center">
                                                                    <span>
                                                                        {
                                                                            currency.currency_code
                                                                        }{" "}
                                                                        (
                                                                        {
                                                                            gateway.alias
                                                                        }{" "}
                                                                        {
                                                                            currency.currency_code
                                                                        }
                                                                        )
                                                                    </span>
                                                                    {selected && (
                                                                        <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Listbox.Option>
                                                    ),
                                                )}
                                            </div>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
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
                                    placeholder={`Enter Amount (${limitsCalculation.minLimit} - ${limitsCalculation.maxLimit})`}
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
                        title={loading ? "Adding..." : "Add Money"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        type="submit"
                        disabled={loading}
                    />
                </form>
            </div>
            <PinVerificationModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onVerify={handleAddMoney}
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
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>Fees & Charges</span>
                        </div>
                        <span className="text-gray-800">
                            {feesCalculation.totalFees}{" "}
                            {selectedCurrency?.currency_code}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                            <span>You Will Get</span>
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
                            {selectedCurrency?.currency_code}
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
}
