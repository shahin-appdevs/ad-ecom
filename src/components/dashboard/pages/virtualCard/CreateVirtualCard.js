"use client";

import { useForm } from "react-hook-form";
import {
    ArrowPathIcon,
    ArrowTrendingDownIcon,
    CurrencyDollarIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import RHFSelect from "@/components/ui/form/RHFSelect";
import {
    CalendarIcon,
    CalendarDaysIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    PlusIcon,
    WalletIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@/i18n/navigation";
import { RHFInput } from "@/components/ui/form/Input";
import {
    dashboardGetAPI,
    stroWalletBuyCardAPI,
    walletCardRemainingLimitsGetAPI,
    walletGetAPI,
} from "@root/services/apiClient/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import { handleApiError } from "@/components/utility/handleApiError";
import { useTranslations } from "next-intl";

//exchange helper function

const getExchangeRate = (fromRate, toRate) => {
    if (!fromRate || !toRate) return 0;
    return Number(fromRate) / Number(toRate);
};

/* ------------------ Options ------------------ */

export default function CreateVirtualCard() {
    const t = useTranslations("Dashboard.cards.virtualCard.createVirtualCard");
    const router = useRouter();
    const [wallets, setWallets] = useState([]);
    const [walletLoading, setWalletLoading] = useState(false);
    const [cardCurrencies] = useState(() => {
        const supportedCurrency = JSON.parse(
            sessionStorage.getItem("base_currency"),
        );
        return supportedCurrency || [];
    });

    const [cardCharge, setCardCharge] = useState({});
    const [remainingLimit, setRemainingLimit] = useState({
        dailyLimit: "00.0000",
        monthlyLimit: "00.0000",
    });
    const [remainingLoading, setRemainingLoading] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            name_on_card: "",
            card_amount: "",
            currency: cardCurrencies[0]?.code || "",
            from_currency: "",
        },
    });

    useEffect(() => {
        // fetch wallets
        (async () => {
            try {
                setWalletLoading(true);

                const result = await walletGetAPI();
                const userWallets = result?.data?.data?.userWallets;
                setWallets(userWallets);
                setValue("from_currency", userWallets[0]?.currency?.code);
            } catch (err) {
                handleApiError(err, t("walletLoadError"));
            } finally {
                setWalletLoading(false);
            }
        })();

        // fetch fee and charges
        (async () => {
            try {
                const result = await dashboardGetAPI();
                setCardCharge(result?.data?.data?.card_create_charge);
            } catch (err) {
                handleApiError(err, t("feeLoadError"));
            }
        })();
    }, []);

    const onSubmit = async (data) => {
        // console.log("Form Data:", data);
        // Create FormData
        const formData = new FormData();

        // Append all fields
        formData.append("name_on_card", data.name_on_card?.trim() || "");
        formData.append("card_amount", data.card_amount || "");
        formData.append("currency", data.currency || "");
        formData.append("from_currency", data.from_currency || "");

        try {
            const result = await stroWalletBuyCardAPI(formData);
            const messages = result?.data?.message?.success;
            messages?.forEach((message) => {
                toast.success(message);
            });

            router.replace("/user/cards/virtual-card");
            sessionStorage.removeItem("base_currency");
            sessionStorage.removeItem("get_remaining_fields");
            reset({});
        } catch (error) {
            const errors = error?.response?.data?.message?.error;

            if (Array.isArray(errors) && errors.length > 0) {
                errors?.forEach((err) => {
                    toast.error(err);
                });
            } else {
                toast.error(t("genericError"));
            }
        }
    };

    // options

    const formCurrencyOptions = wallets.map(
        (wallet) => wallet?.currency?.code || "",
    );

    const fromWalletCurrency = watch("from_currency");
    const amount = watch("card_amount");
    const selectedCardCurrency = watch("currency");

    // from user wallet
    const fromWallet = useMemo(() => {
        return wallets.find(
            (wallet) => wallet?.currency?.code === fromWalletCurrency,
        );
    }, [wallets, fromWalletCurrency]);

    // card currency
    const cardCurrency = useMemo(() => {
        return cardCurrencies.find(
            (currency) => currency.code === selectedCardCurrency,
        );
    }, [cardCurrencies, selectedCardCurrency]);

    const fromAmount = `${Number(amount).toFixed(4)} ${cardCurrency?.code}`;

    // fetch remaining limits
    useEffect(() => {
        (async () => {
            if (!cardCharge?.id) {
                return;
            }

            const getRemainingFields = JSON.parse(
                sessionStorage?.getItem("get_remaining_fields"),
            );

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
                    dailyLimit: `${data?.remainingDaily}`,
                    monthlyLimit: `${data?.remainingMonthly}`,
                });
            } catch (error) {
                handleApiError(error, t("failedToFetchLimits"));
                const data = error?.response?.data?.data;

                setRemainingLimit({
                    dailyLimit: data?.remainingDaily || "0.00",
                    monthlyLimit: data?.remainingMonthly || "0.00",
                });
            } finally {
                setRemainingLoading(false);
            }
        })();
    }, [amount, cardCharge, cardCurrency]);

    //calculate exchange rate
    const exchangeRate = useMemo(() => {
        const fromWalletCurrencyRate = Number(fromWallet?.currency?.rate) || 0;
        const cardCurrencyRate = Number(cardCurrency?.rate) || 0;
        return getExchangeRate(fromWalletCurrencyRate, cardCurrencyRate);
    }, [fromWallet, cardCurrency]);

    // exchange rate display

    const exchangeRateDisplay = `1 ${cardCurrency?.code} = ${exchangeRate.toFixed(4)} ${fromWallet?.currency?.code} `;

    // charge calculation
    const calculation = useMemo(() => {
        if (!amount) {
            return {
                totalCharge: `00.0000 ${fromWallet?.currency?.code}`,
                totalAmount: `00.0000 ${fromWallet?.currency?.code}`,
            };
        }
        const percentCharge =
            (parseFloat(amount * exchangeRate) / 100) *
            parseFloat(cardCharge?.percent_charge);
        const fixedCharge =
            parseFloat(cardCharge?.fixed_charge) *
            parseFloat(cardCurrency?.rate);

        const charge = fixedCharge + percentCharge;

        const totalCharge = `${charge.toFixed(4)} ${fromWallet?.currency?.code}`;
        const totalAmount = `${(Number(amount * exchangeRate) + charge).toFixed(4)} ${fromWallet?.currency?.code}`;

        return { totalCharge, totalAmount };
    }, [amount, fromWallet, cardCharge, exchangeRate, cardCurrency]);

    //  limits calculation
    const limitsCalculation = useMemo(() => {
        if (!fromWalletCurrency || !fromWallet) {
            return {
                minLimit: "0.00",
                maxLimit: "0.00",
                dailyLimit: "0.00",
                monthlyLimit: "0.00",
                remainingDailyLimit: "0.00",
                remainingMonthlyLimit: "0.00",
            };
        }

        // const availableWalletCurrencyRate = parseFloat(
        //     fromWallet?.currency?.rate,
        // );
        // const cardCurrencyRate = parseFloat(cardCurrency?.rate);
        // const exchangeRate = availableWalletCurrencyRate / cardCurrencyRate;

        const minLimit = `${cardCharge?.min_limit} ${cardCurrency?.code}`;
        const maxLimit = `${cardCharge?.max_limit} ${cardCurrency?.code}`;
        const monthlyLimit = `${cardCharge?.monthly_limit} ${cardCurrency?.code}`;
        const dailyLimit = `${cardCharge?.daily_limit} ${cardCurrency?.code}`;
        const remainingDailyLimit = `${remainingLimit?.dailyLimit} ${cardCurrency?.code}`;
        const remainingMonthlyLimit = `${remainingLimit?.monthlyLimit} ${cardCurrency?.code}`;
        return {
            minLimit,
            maxLimit,
            dailyLimit,
            monthlyLimit,
            remainingDailyLimit,
            remainingMonthlyLimit,
        };

        // const minLimit =
    }, [
        cardCharge,
        cardCurrency,
        fromWallet,
        fromWalletCurrency,
        remainingLimit,
    ]);

    if (walletLoading) return <VirtualCardCreateSkeleton />;

    return (
        <div className="min-h-screen space-y-4 ">
            <div className=" flex  items-center justify-end ">
                <Link
                    href={"/user/cards/virtual-card/update-customer"}
                    className=" bg-primary__color text-white__color flex justify-center items-center py-3 px-5 gap-2 font-semibold rounded-[6px] transition hover:bg-secondary__color hover:scale-x-105"
                >
                    <span>{t("updateCustomer")}</span>{" "}
                    <PlusIcon className="h-5 w-5" />
                </Link>
            </div>
            <div className=" grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* FORM */}
                <div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="lg:col-span-2 bg-white rounded-xl shadow p-4  md:p-6 space-y-6"
                    >
                        <Header title={t("formTitle")} />

                        {/* <DemoCard /> */}
                        {/* Name */}
                        <RHFInput
                            label={t("cardHolderName")}
                            name={"name_on_card"}
                            control={control}
                            rules={{ required: t("nameRequired") }}
                            placeholder={t("enterCardHolderName")}
                            type="text"
                        />

                        {/* Amount */}
                        <RHFInput
                            label={t("amount")}
                            name={"card_amount"}
                            control={control}
                            rules={{ required: t("amountRequired") }}
                            placeholder={t("enterAmount")}
                            type="number"
                        />

                        {/* Card Currency - base currency */}

                        <RHFSelect
                            label={t("cardCurrency")}
                            name="currency"
                            control={control}
                            options={cardCurrencies?.map(
                                (currency) => currency?.code,
                            )}
                            rules={{ required: true }}
                        />

                        {/* Wallet - available */}

                        <RHFSelect
                            label={t("fromWallet")}
                            name="from_currency"
                            control={control}
                            options={formCurrencyOptions}
                            rules={{ required: t("cardCurrencyRequired") }}
                        />

                        <div className="flex flex-col md:flex-row justify-between gap-2 items-start">
                            <p className="text-sm  inline-block w-full p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                {t("availableBalance")} <br />
                                <span className="font-medium text-lg text-neutral-700">
                                    {fromWallet?.balance?.toFixed(4)}{" "}
                                    {fromWallet?.currency?.code}
                                </span>
                            </p>

                            {exchangeRate && (
                                <p className="text-sm  inline-block p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-lg w-full">
                                    {t("exchangeRate")} <br />{" "}
                                    <span className="font-medium text-lg text-neutral-700">
                                        {exchangeRateDisplay}
                                    </span>
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary__color text-white__color flex justify-center items-center py-3 px-5 gap-2 font-semibold rounded-[6px] transition hover:bg-secondary__color hover:scale-x-105"
                        >
                            <span>{t("buyCard")}</span>{" "}
                            {isSubmitting ? (
                                <ArrowPathIcon className="animate-spin w-[20px]" />
                            ) : (
                                <PlusIcon className="w-[20px]" />
                            )}
                        </button>
                    </form>
                </div>

                <div className="space-y-4 ">
                    {/* Overview */}
                    <VirtualCardChargeOverview
                        amount={fromAmount}
                        calculation={calculation}
                        t={t}
                    />
                    {/* Limit Informations */}
                    <VirtualCardLimits
                        limitsCalculation={limitsCalculation}
                        remainingLoading={remainingLoading}
                        t={t}
                    />
                </div>
            </div>
        </div>
    );
}

/* ------------------ Components ------------------ */

const VirtualCardChargeOverview = ({ amount, calculation, t }) => {
    return (
        <div className="bg-white  border border-gray-200 p-4 rounded-xl ">
            <Header title={t("overview")} />
            <div className=" divide-y divide-gray-200 mt-4">
                {[
                    {
                        label: (
                            <div className="flex items-center space-x-2 text-gray-600">
                                <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
                                <span>{t("cardAmount")}</span>
                            </div>
                        ),
                        value: amount ? amount : "00.0000",
                    },
                    {
                        label: (
                            <div className="flex items-center space-x-2 text-gray-600">
                                <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                                <span>{t("feesCharges")}</span>
                            </div>
                        ),
                        value: calculation?.totalCharge,
                    },
                    {
                        label: (
                            <div className="flex items-center space-x-2">
                                <WalletIcon className="w-5 h-5 text-indigo-600" />
                                <span>{t("totalPayable")}</span>
                            </div>
                        ),
                        value: calculation.totalAmount,
                        bold: true,
                    },
                ].map((row, idx) => (
                    <div
                        key={idx}
                        className={`py-3 flex justify-between items-center ${row.bold ? "font-medium text-blue-700" : ""}`}
                    >
                        <span className="text-gray-600">{row.label}</span>
                        <span className="font-medium">{row.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VirtualCardLimits = ({ limitsCalculation, remainingLoading, t }) => {
    return (
        <div>
            <div className="bg-white border-gray-200 border rounded-2xl p-4">
                {/* Info Rows */}

                <Header title={t("limitInformation")} />
                {remainingLoading ? (
                    <LimitsSkeleton />
                ) : (
                    <div className=" divide-y divide-gray-200  mt-4">
                        {[
                            {
                                label: (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <ArrowsPointingInIcon className="w-5 h-5 text-indigo-500" />
                                        <span>{t("minLimit")}</span>
                                    </div>
                                ),
                                value: limitsCalculation?.minLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <ArrowsPointingOutIcon className="w-5 h-5 text-indigo-500" />
                                        <span>{t("maxLimit")}</span>
                                    </div>
                                ),
                                value: limitsCalculation?.maxLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-5 h-5 text-emerald-500" />
                                        <span>{t("dailyLimit")}</span>
                                    </div>
                                ),
                                value: limitsCalculation?.dailyLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2">
                                        <CalendarDaysIcon className="w-5 h-5 text-emerald-500" />
                                        <span>{t("monthlyLimit")}</span>
                                    </div>
                                ),
                                value: limitsCalculation?.monthlyLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-5 h-5 text-yellow-500" />
                                        <span>{t("remainingDailyLimit")}</span>
                                    </div>
                                ),
                                value: limitsCalculation?.remainingDailyLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2">
                                        <CalendarDaysIcon className="w-5 h-5 text-yellow-500" />
                                        <span>
                                            {t("remainingMonthlyLimit")}
                                        </span>
                                    </div>
                                ),
                                value: limitsCalculation?.remainingMonthlyLimit,
                            },
                        ].map((row, idx) => (
                            <div
                                key={idx}
                                className={`py-3 flex justify-between items-center ${row.bold ? "font-medium text-blue-700" : ""}`}
                            >
                                <span className="text-gray-600">
                                    {row.label}
                                </span>
                                <span className="font-medium">{row.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

function Header({ title }) {
    return (
        <div className="flex items-center gap-2">
            <ExclamationCircleIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
    );
}

//Skeleton

function VirtualCardCreateSkeleton() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT: Form Skeleton */}
            <div className="xl:col-span-2 rounded-xl border bg-white p-6">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-11 w-full bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Balance Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {[...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-lg border p-4 space-y-2 animate-pulse"
                        >
                            <div className="h-3 w-32 bg-gray-200 rounded" />
                            <div className="h-5 w-40 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>

                {/* Button */}
                <div className="mt-6">
                    <div className="h-12 w-full rounded-lg bg-gray-300 animate-pulse" />
                </div>
            </div>

            {/* RIGHT: Overview + Limit Info */}
            <div className="space-y-6">
                {/* Overview Card */}
                <div className="rounded-xl border bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center"
                            >
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Limit Information */}
                <div className="rounded-xl border bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
                        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

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
