import { RHFInput } from "@/components/ui/form/Input";
import RHFSelect from "@/components/ui/form/RHFSelect";
import Modal from "@/components/ui/Modal";
import { handleApiError } from "@/components/utility/handleApiError";
import { handleApiSuccess } from "@/components/utility/handleApiSuccess";
import {
    ArrowTrendingDownIcon,
    CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import {
    dashboardGetAPI,
    stroWalletCardFundAPI,
    stroWalletFeeChargeGetAPI,
    walletCardRemainingLimitsGetAPI,
    walletGetAPI,
} from "@root/services/apiClient/apiClient";
import {
    Calendar1,
    CalendarDays,
    Maximize2,
    Minimize2,
    Wallet,
    WalletIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

//exchange helper function

const getExchangeRate = (fromRate, toRate) => {
    if (!fromRate || !toRate) return 0;
    return Number(fromRate) / Number(toRate);
};

const VirtualCardDepositModal = ({
    open,
    onClose,
    cardCurrencies,
    getRemainingFields,
    myVirtualCard,
}) => {
    const router = useRouter();
    const [calculation, setCalculation] = useState({
        totalCharge: "0.00",
        totalAmount: "0.00",
        exchangeRate: "0.00",
    });
    const [cardCharge, setCardCharge] = useState({});
    const [wallets, setWallets] = useState([]);
    const [walletLoading, setWalletLoading] = useState(false);
    const [remainLimit, setRemainingLimit] = useState({
        dailyLimit: "--",
        monthlyLimit: "--",
    });
    const [remainingLoading, setRemainingLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setValue,
        reset,
        watch,
    } = useForm({
        defaultValues: {
            from_currency: "",
            fund_amount: "",
            currency: cardCurrencies[0]?.code,
            cardId: "", // if you have multiple cards, populate from props/state
        },
    });

    useEffect(() => {
        // fetch wallets
        (async () => {
            try {
                setWalletLoading(true);

                const result = await walletGetAPI();
                const allWallets = result?.data?.data?.userWallets;
                setWallets(allWallets);

                setValue("from_currency", allWallets[0]?.currency?.code);
            } catch (err) {
                toast.error("Failed to load wallets data");
            } finally {
                setWalletLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        // fetch fee and charges
        (async () => {
            try {
                const result = await dashboardGetAPI();

                setCardCharge(result?.data?.data?.card_reload_charge);
            } catch (err) {
                handleApiError(err);
            }
        })();
    }, []);

    const formCurrencyOptions = wallets.map(
        (wallet) => wallet?.currency?.code || "",
    );

    const activeFromCurrency = watch("from_currency");
    const availableBalance = wallets.find(
        (wallet) => wallet?.currency?.code === activeFromCurrency,
    );

    const amount = watch("fund_amount");
    const cardCurrency = cardCurrencies.find(
        (currency) => currency.code === watch("currency"),
    );

    // fee and charge calculation

    useEffect(() => {
        if (amount) {
            const availableWalletRate = parseFloat(
                availableBalance?.currency?.rate,
            );
            const selectedCurrencyRate = parseFloat(cardCurrency?.rate);
            const exchangeRate = availableWalletRate / selectedCurrencyRate;

            const percentCharge =
                (parseFloat(amount * exchangeRate) / 100) *
                parseFloat(cardCharge?.percent_charge);

            const totalCharge =
                parseFloat(cardCharge?.fixed_charge) *
                    parseFloat(cardCurrency?.rate) +
                percentCharge;

            const totalAmount = parseFloat(amount) * exchangeRate + totalCharge;

            setCalculation({ totalCharge, totalAmount, exchangeRate });

            // console.log(totalCharge);
        }
    }, [amount, activeFromCurrency]);

    // fetch remaining limits
    useEffect(() => {
        (async () => {
            if (!cardCharge?.id) {
                return;
            }
            try {
                setRemainingLoading(true);
                const transactionType = getRemainingFields?.transaction_type;
                const attribute = getRemainingFields?.attribute;
                const senderAmount = amount || 0;
                const currencyCode = cardCurrency?.code;
                const chargeId = cardCharge?.id;
                const result = await walletCardRemainingLimitsGetAPI(
                    transactionType,
                    attribute,
                    senderAmount,
                    currencyCode,
                    chargeId,
                );

                const data = result?.data?.data;
                setRemainingLimit({
                    dailyLimit: `${data?.remainingDaily} ${cardCurrency?.code}`,
                    monthlyLimit: `${data?.remainingMonthly} ${cardCurrency?.code}`,
                });
            } catch (error) {
                handleApiError(error, "Failed to fetch remaining limits");
            } finally {
                setRemainingLoading(false);
            }
        })();
    }, [amount, cardCharge, cardCurrency, getRemainingFields, myVirtualCard]);

    // limits calculation
    const limitsCalculation = useMemo(() => {
        if (!activeFromCurrency || !availableBalance) {
            return {
                minLimit: "0.00",
                maxLimit: "0.00",
                dailyLimit: "0.00",
                monthlyLimit: "0.00",
                remainingDailyLimit: "0.00",
                remainingMonthlyLimit: "0.00",
            };
        }

        const availableWalletCurrencyRate = parseFloat(
            availableBalance?.currency?.rate,
        );
        const cardCurrencyRate = parseFloat(cardCurrency?.rate);
        const exchangeRate = availableWalletCurrencyRate / cardCurrencyRate;

        const minLimit = `${cardCharge?.min_limit} ${cardCurrency?.code}`;
        const maxLimit = `${cardCharge?.max_limit} ${cardCurrency?.code}`;
        const monthlyLimit = `${cardCharge?.monthly_limit} ${cardCurrency?.code}`;
        const dailyLimit = `${cardCharge?.daily_limit} ${cardCurrency?.code}`;

        return {
            minLimit,
            maxLimit,
            dailyLimit,
            monthlyLimit,
        };

        // const minLimit =
    }, [cardCurrency, activeFromCurrency, availableBalance, cardCharge]);

    //calculate exchange rate
    const exchangeRate = useMemo(() => {
        if (!availableBalance?.currency?.rate || !cardCurrency?.rate) {
            return { rate: "0.00", display: "0.00" };
        }

        const fromWalletCurrencyRate =
            Number(availableBalance?.currency?.rate) || 0;
        const cardCurrencyRate = Number(cardCurrency?.rate) || 0;
        const rate = getExchangeRate(fromWalletCurrencyRate, cardCurrencyRate);

        const display = `1 ${cardCurrency?.code} = ${rate.toFixed(4)} ${availableBalance?.currency?.code} `;

        return {
            rate,
            display,
        };
    }, [availableBalance, cardCurrency]);

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("fund_amount", amount);
        formData.append("card_id", myVirtualCard?.card_id);
        formData.append("currency", cardCurrency?.code);
        formData.append("from_currency", activeFromCurrency);
        // Add more fields if your API requires (currency, user_id, etc.)
        // formData.append("currency", "GBP");

        try {
            const result = await stroWalletCardFundAPI(formData);

            handleApiSuccess(result, "Deposit successful!");
            reset(); // clear form
            onClose();
            router.refresh();
        } catch (error) {
            handleApiError(error, "Failed to deposit");
        }
    };

    return (
        <Modal
            className={"!max-w-7xl"}
            open={open}
            onClose={onClose}
            title={"Deposit to Card"}
            description={"Move funds within your card, freeze or close it"}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className=" w-full space-y-4">
                    {/* Deposit Amount Input */}

                    {/* Main Form */}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className=" space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RHFInput
                                control={control}
                                name="fund_amount"
                                label="Deposit Amount *"
                                placeholder="0.00"
                                type="number"
                                rules={{
                                    required: "Amount is required",
                                    min: {
                                        value: 0,
                                        message:
                                            "Negative amount is not allowed",
                                    },
                                }}
                            />
                            <RHFSelect
                                label="Card Currency *"
                                name="currency"
                                control={control}
                                options={cardCurrencies?.map(
                                    (currency) => currency?.code,
                                )}
                                rules={{ required: true }}
                            />
                        </div>
                        <RHFSelect
                            label="From Wallet*"
                            name="from_currency"
                            control={control}
                            options={formCurrencyOptions}
                            rules={{
                                required: "Card Currency is Required",
                            }}
                        />
                        {/* Overview */}
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                <span>Overview</span>
                            </label>
                            <div className=" divide-y divide-gray-200">
                                {[
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
                                                <span>Deposit Amount</span>
                                            </div>
                                        ),
                                        value: amount
                                            ? `${Number(amount)?.toFixed(4)} ${cardCurrency.code}`
                                            : "00.0000",
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                                                <span>Fees & Charges</span>
                                            </div>
                                        ),
                                        value: calculation?.totalCharge
                                            ? `${Number(calculation?.totalCharge).toFixed(4)} ${activeFromCurrency}`
                                            : "00.0000",
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2">
                                                <WalletIcon className="w-5 h-5 text-indigo-600" />
                                                <span>Total Payable</span>
                                            </div>
                                        ),
                                        value: calculation.totalAmount
                                            ? `${Number(calculation.totalAmount).toFixed(4)} ${activeFromCurrency}`
                                            : "00.0000",
                                        bold: true,
                                    },
                                ].map((row, idx) => (
                                    <div
                                        key={idx}
                                        className={`py-2 flex justify-between items-center ${row.bold ? "font-medium text-blue-700" : ""}`}
                                    >
                                        <span className="text-gray-600">
                                            {row.label}
                                        </span>
                                        <span className="font-medium">
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Account Funds */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-700 text-xl">
                                        <Wallet />
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">Account Funds</p>

                                    <p className="text-sm text-gray-600">
                                        Balance: {availableBalance?.balance}{" "}
                                        {availableBalance?.currency?.code}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-center my-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                    ↓
                                </div>
                            </div>
                            {/* Selected Card Preview */}
                            <div className="bg-white rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 bg-gradient-to-r border rounded-md flex items-center justify-center text-white text-xs font-bold">
                                        {myVirtualCard?.card_brand ===
                                            "visa" && (
                                            <Image
                                                src="/images/icon/visa.png"
                                                height={10}
                                                width={30}
                                                alt="VISA CARD"
                                            />
                                        )}
                                        {myVirtualCard?.card_brand ===
                                            "mastercard" && (
                                            <Image
                                                src="/images/icon/mastercard.png"
                                                height={10}
                                                width={30}
                                                alt="Master CARD"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {myVirtualCard?.name} -{" "}
                                            {`
                                            ${myVirtualCard?.card_number?.slice(
                                                0,
                                                4,
                                            )}
                                            
                                            ${myVirtualCard?.card_number?.slice(
                                                4,
                                                6,
                                            )}
                                            *******
                                            ${myVirtualCard?.card_number?.slice(
                                                -4,
                                                -2,
                                            )}
                                            
                                            ${myVirtualCard?.card_number?.slice(
                                                -2,
                                            )}
                                            `}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Balance:{" "}
                                            {Number(
                                                myVirtualCard?.amount,
                                            ).toFixed(4)}{" "}
                                            {myVirtualCard?.currency}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse  sm:flex-row gap-4 pt-6">
                            <button
                                onClick={onClose}
                                type="button"
                                className="flex-1 py-3.5 px-6 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 py-3.5 px-6 bg-emerald-700  hover:bg-emerald-800 text-white font-medium rounded-xl transition flex items-center justify-center gap-2
                            ${isSubmitting ? "opacity-70 cursor-wait" : "hover:bg-green-700"}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                        Processing...
                                    </>
                                ) : (
                                    "Deposit"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                {/* Limit Informations */}
                <div className="space-y-4 -order-1 lg:order-2">
                    {exchangeRate?.display && (
                        <p
                            className="text-sm  inline-block  p-4
                         bg-gray-50 border border-gray-200 rounded-2xl w-full"
                        >
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                <span>Exchange Rate</span>
                            </label>
                            <span className="font-medium text-lg text-neutral-700">
                                {exchangeRate?.display}
                            </span>
                        </p>
                    )}
                    <div className="bg-gray-50 border-gray-200 border rounded-2xl p-4">
                        {/* Info Rows */}
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            <span>Limit Information</span>
                        </label>
                        {remainingLoading ? (
                            <LimitsSkeleton />
                        ) : (
                            <div className=" divide-y divide-gray-200">
                                {[
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <Minimize2 className="w-5 h-5 text-indigo-500" />
                                                <span>Min Limit</span>
                                            </div>
                                        ),
                                        value: limitsCalculation?.minLimit,
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <Maximize2 className="w-5 h-5 text-indigo-500" />
                                                <span>Max Limit</span>
                                            </div>
                                        ),
                                        value: limitsCalculation?.maxLimit,
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2">
                                                <Calendar1 className="w-5 h-5 text-emerald-500" />
                                                <span>Daily Limit</span>
                                            </div>
                                        ),
                                        value: limitsCalculation.dailyLimit,
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2">
                                                <CalendarDays className="w-5 h-5 text-emerald-500" />
                                                <span>Monthly Limit</span>
                                            </div>
                                        ),
                                        value: limitsCalculation.monthlyLimit,
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2">
                                                <Calendar1 className="w-5 h-5 text-yellow-500" />
                                                <span>
                                                    Remaining Daily Limit
                                                </span>
                                            </div>
                                        ),
                                        value: remainLimit.dailyLimit,
                                    },
                                    {
                                        label: (
                                            <div className="flex items-center space-x-2">
                                                <CalendarDays className="w-5 h-5 text-yellow-500" />
                                                <span>
                                                    Remaining Monthly Limit
                                                </span>
                                            </div>
                                        ),
                                        value: remainLimit.monthlyLimit,
                                    },
                                ].map((row, idx) => (
                                    <div
                                        key={idx}
                                        className={`py-2 flex justify-between items-center ${row.bold ? "font-medium text-blue-700" : ""}`}
                                    >
                                        <span className="text-gray-600">
                                            {row.label}
                                        </span>
                                        <span className="font-medium">
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default VirtualCardDepositModal;

function LimitsSkeleton() {
    return (
        <div className="divide-y divide-gray-200 animate-pulse">
            {Array.from({ length: 6 }).map((_, idx) => (
                <div
                    key={idx}
                    className="py-2 flex justify-between items-center"
                >
                    {/* Left side (label + icon) skeleton */}
                    <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    </div>

                    {/* Right side (value) skeleton */}
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    );
}
