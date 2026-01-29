"use client";

import { Controller, useForm } from "react-hook-form";
import {
    ArrowTrendingDownIcon,
    ChevronUpDownIcon,
    CurrencyDollarIcon,
    ExclamationCircleIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import RHFSelect from "@/components/ui/form/RHFSelect";
import {
    Calendar1,
    CalendarDays,
    LoaderCircle,
    Maximize2,
    Minimize2,
    Plus,
    WalletIcon,
    Wifi,
} from "lucide-react";
import Link from "next/link";
import { RHFInput } from "@/components/ui/form/Input";
import {
    dashboardGetAPI,
    myStroWalletCardGetAPI,
    stroWalletBuyCardAPI,
    sudoVirtualBuyCardAPI,
    walletCardRemainingLimitsGetAPI,
    walletGetAPI,
} from "@root/services/apiClient/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { handleApiError } from "@/components/utility/handleApiError";
import { RHFFileUpload } from "@/components/ui/form/RHFFileUpload";
import { RHFTextarea } from "@/components/ui/form/RHFTextarea";
import { Listbox } from "@headlessui/react";
import { handleApiSuccess } from "@/components/utility/handleApiSuccess";

//exchange helper function

const getExchangeRate = (fromRate, toRate) => {
    if (!fromRate || !toRate) return 0;
    return Number(fromRate) / Number(toRate);
};

/* ------------------ Options ------------------ */

export default function CreateSudoVirtualCard() {
    const router = useRouter();
    const [wallets, setWallets] = useState([]);
    const [walletLoading, setWalletLoading] = useState(false);
    const [cardCurrencies, setCardCurrencies] = useState(() => {
        const supportedCurrency = JSON.parse(
            sessionStorage.getItem("base_currency"),
        );
        return supportedCurrency || [];
    });
    const [cardInputFields, setCardInputFields] = useState(() => {
        const dynamicFields = JSON.parse(
            sessionStorage.getItem("card_dynamic_fields"),
        );
        return dynamicFields || [];
    });

    const [cardCharge, setCardCharge] = useState({});
    const [remainingLimit, setRemainingLimit] = useState({
        dailyLimit: "00.0000",
        monthlyLimit: "00.0000",
    });
    const [remainingLoading, setRemainingLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            card_amount: "",
            currency: cardCurrencies[0]?.code || "",
            from_currency: "",
            date_of_birth: "",
            identity_type: "",
            identity_number: "",
            phone_number: "",
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
                toast.error("Failed to load wallets data");
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
                toast.error("Failed to load fee & charges");
            }
        })();
    }, []);

    const onSubmit = async (data) => {
        console.log("Form Data:", data);
        // Create FormData
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            // If value is a FileList (from file input), append first file
            if (value instanceof FileList) {
                if (value.length > 0) {
                    formData.append(key, value[0]);
                    console.log(value[0]);
                }
            } else {
                formData.append(key, value);
            }
        });

        try {
            const result = await sudoVirtualBuyCardAPI(formData);
            handleApiSuccess(result);
            router.replace("/user/cards/sudo-virtual-card");
            sessionStorage.removeItem("base_currency");
            sessionStorage.removeItem("get_remaining_fields");
            sessionStorage.removeItem("card_dynamic_fields");
            reset({});
        } catch (error) {
            handleApiError(error);
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
                handleApiError(error, "Failed to fetch remaining limits");
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

        const availableWalletCurrencyRate = parseFloat(
            fromWallet?.currency?.rate,
        );
        const cardCurrencyRate = parseFloat(cardCurrency?.rate);
        const exchangeRate = availableWalletCurrencyRate / cardCurrencyRate;

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

    // Helper function to render fields dynamically
    const renderField = (field, idx) => {
        const commonProps = {
            // key: field.id,
            name: field?.field_name,
            control,
            label: ` ${field?.label_name}*`,
            rules: {
                required: true ? `${field.label_name} is required` : false,
            },
            placeholder: `Enter ${field.label_name}` || "",
            options: field?.options,
            readOnly: false,
        };

        switch (field.type) {
            case "text":
            case "number":
            case "email":
            case "date":
                return (
                    <RHFInput key={idx} {...commonProps} type={field.type} />
                );
            case "textarea":
                return <RHFTextarea key={idx} {...commonProps} />;
            case "file":
                return (
                    <RHFFileUpload
                        key={idx}
                        name={field.field_name}
                        control={control}
                        label={field.label_name + (field.required ? "*" : "")}
                        rules={{ required: `${field.label_name} is required` }}
                        error={errors[field.field_name]?.message}
                    />
                );
            case "select":
                return (
                    <Controller
                        key={idx}
                        name={commonProps.name}
                        control={control}
                        rules={commonProps.rules}
                        render={({ field: rhfField, fieldState }) => {
                            const selected =
                                commonProps.options.find(
                                    (opt) => opt.value === rhfField.value,
                                ) || null;

                            return (
                                <div>
                                    {/* Label */}
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        {commonProps.label}
                                        {field.required && (
                                            <span className="text-gray-700">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <Listbox
                                        value={selected}
                                        onChange={(option) => {
                                            rhfField.onChange(option.value);
                                        }}
                                        disabled={commonProps.readOnly}
                                    >
                                        <div className="relative">
                                            {/* Button */}
                                            <Listbox.Button
                                                className={`relative w-full cursor-pointer rounded-lg border py-2 xl:py-3 pl-3 pr-10 text-left focus:ring-1 focus:ring-blue-500 ${
                                                    fieldState.error
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                <span className="block truncate">
                                                    {selected
                                                        ? `${selected?.name} - ${selected?.value}` ||
                                                          selected.label
                                                        : commonProps.placeholder}
                                                </span>
                                                <ChevronUpDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                            </Listbox.Button>

                                            {/* Options */}
                                            <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                                                <div className="max-h-48 overflow-auto">
                                                    {commonProps.options.map(
                                                        (option, idx) => (
                                                            <Listbox.Option
                                                                key={idx}
                                                                value={option}
                                                                className={({
                                                                    active,
                                                                }) =>
                                                                    `cursor-pointer select-none px-4 py-2 ${
                                                                        active
                                                                            ? "bg-blue-50 text-blue-700"
                                                                            : "text-gray-900"
                                                                    }`
                                                                }
                                                            >
                                                                {({
                                                                    selected,
                                                                }) => (
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selected
                                                                                ? "font-medium"
                                                                                : "font-normal"
                                                                        }`}
                                                                    >
                                                                        {`${option.name} - ${option?.value}` ||
                                                                            option.label}
                                                                    </span>
                                                                )}
                                                            </Listbox.Option>
                                                        ),
                                                    )}
                                                </div>
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>

                                    {/* Error */}
                                    {fieldState.error && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </div>
                            );
                        }}
                    />
                );

            default:
                return <RHFInput key={idx} {...commonProps} type="text" />;
        }
    };

    if (walletLoading) return <VirtualCardCreateSkeleton />;

    return (
        <div className="min-h-screen space-y-4 ">
            {/* <div className=" flex  items-center justify-end ">
                <Link
                    href={"/user/cards/virtual-card/update-customer"}
                    className=" bg-primary__color text-white__color flex justify-center items-center py-3 px-5 gap-2 font-semibold rounded-[6px] transition hover:bg-secondary__color hover:scale-x-105"
                >
                    <span>Update Customer</span> <Plus />
                </Link>
            </div> */}
            <div className=" grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* FORM */}
                <div className="lg:col-span-2">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className=" bg-white rounded-xl shadow p-4  md:p-6 space-y-4"
                    >
                        <Header title="Create Virtual Card" />

                        {/* <DemoCard /> */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Amount */}
                            <RHFInput
                                label="Amount*"
                                name={"card_amount"}
                                control={control}
                                rules={{ required: "Amount is required" }}
                                placeholder={"Enter Amount"}
                                type="number"
                            />

                            {/* Card Currency - base currency */}

                            <RHFSelect
                                label="Card Currency*"
                                name="currency"
                                control={control}
                                options={cardCurrencies?.map(
                                    (currency) => currency?.code,
                                )}
                                rules={{ required: true }}
                            />
                        </div>
                        {/* Wallet - available */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RHFSelect
                                label="From Wallet*"
                                name="from_currency"
                                control={control}
                                options={formCurrencyOptions}
                                rules={{
                                    required: "Card currency is required",
                                }}
                            />
                            {cardInputFields?.map((field, idx) => {
                                return renderField(field, idx);
                            })}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between gap-2 items-start">
                            <p className="text-sm  inline-block w-full p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                Available Balance <br />
                                <span className="font-medium text-lg text-neutral-700">
                                    {fromWallet?.balance?.toFixed(4)}{" "}
                                    {fromWallet?.currency?.code}
                                </span>
                            </p>

                            {exchangeRate && (
                                <p className="text-sm  inline-block p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-lg w-full">
                                    Exchange Rate <br />{" "}
                                    <span className="font-medium text-lg text-neutral-700">
                                        {exchangeRateDisplay}
                                    </span>
                                </p>
                            )}
                            {/* {calculation?.totalAmount && (
                                <p className="text-sm inline-block p-2 md:p-4 bg-gray-50 border border-gray-200 rounded-lg w-full">
                                    Payable Amount <br />{" "}
                                    <span className="font-medium text-lg text-neutral-700">
                                        {" "}
                                        {`${parseFloat(calculation?.totalAmount).toFixed(6)}  ${cardCurrency.code}`}
                                    </span>
                                </p>
                            )} */}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary__color text-white__color flex justify-center items-center py-3 px-5 gap-2 font-semibold rounded-[6px] transition hover:bg-secondary__color hover:scale-x-105"
                        >
                            <span>Buy Card</span>{" "}
                            {isSubmitting ? (
                                <LoaderCircle
                                    size={20}
                                    className="animate-spin"
                                />
                            ) : (
                                <Plus size={20} />
                            )}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 xl:col-span-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1  gap-4 ">
                    {/* Overview */}
                    <VirtualCardChargeOverview
                        amount={fromAmount}
                        calculation={calculation}
                    />
                    {/* Limit Informations */}
                    <VirtualCardLimits
                        limitsCalculation={limitsCalculation}
                        remainingLoading={remainingLoading}
                    />
                </div>
            </div>
        </div>
    );
}

/* ------------------ Components ------------------ */

const VirtualCardChargeOverview = ({ amount, calculation }) => {
    return (
        <div className="bg-white  border border-gray-200 p-4 rounded-xl ">
            <Header title={"Overview"} />
            <div className=" divide-y divide-gray-200 mt-4">
                {[
                    {
                        label: (
                            <div className="flex items-center space-x-2 text-gray-600">
                                <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
                                <span>Card Amount</span>
                            </div>
                        ),
                        value: amount ? amount : "00.0000",
                    },
                    {
                        label: (
                            <div className="flex items-center space-x-2 text-gray-600">
                                <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                                <span>Fees & Charges</span>
                            </div>
                        ),
                        value: calculation?.totalCharge,
                    },
                    {
                        label: (
                            <div className="flex items-center space-x-2">
                                <WalletIcon className="w-5 h-5 text-indigo-600" />
                                <span>Total Payable</span>
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

const VirtualCardLimits = ({ limitsCalculation, remainingLoading }) => {
    return (
        <div>
            <div className="bg-white border-gray-200 border rounded-2xl p-4">
                {/* Info Rows */}

                <Header title={"Limit Information"} />
                {remainingLoading ? (
                    <LimitsSkeleton />
                ) : (
                    <div className=" divide-y divide-gray-200  mt-4">
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
                                value: limitsCalculation?.dailyLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2">
                                        <CalendarDays className="w-5 h-5 text-emerald-500" />
                                        <span>Monthly Limit</span>
                                    </div>
                                ),
                                value: limitsCalculation?.monthlyLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2">
                                        <Calendar1 className="w-5 h-5 text-yellow-500" />
                                        <span>Remaining Daily Limit</span>
                                    </div>
                                ),
                                value: limitsCalculation?.remainingDailyLimit,
                            },
                            {
                                label: (
                                    <div className="flex items-center space-x-2">
                                        <CalendarDays className="w-5 h-5 text-yellow-500" />
                                        <span>Remaining Monthly Limit</span>
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

function DemoCard() {
    return (
        <div className="flex items-center justify-center cursor-pointer">
            <div className="bg-gradient-to-br w-full max-w-[375px] hover:shadow-lg duration-300 from-blue-500/85 to-blue-700/85 rounded-3xl p-4 md:p-8 text-white shadow relative overflow-hidden">
                {/* Background Pattern (optional subtle) */}
                <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
                        {Array.from({ length: 64 }).map((_, i) => (
                            <div key={i} className="bg-white/10 rounded" />
                        ))}
                    </div>
                </div>

                {/* Card Content */}
                <div className="relative z-10">
                    <div className="flex justify-between items-start ">
                        <div>
                            <h3 className="text-xl text-white font-semibold  ">
                                Demo
                            </h3>
                            <div className="flex gap-2 items-center">
                                <div className=" p-3 rounded-lg">
                                    <div className="chip">
                                        <div className="chip-line"></div>
                                        <div className="chip-line"></div>
                                        <div className="chip-line"></div>
                                        <div className="chip-line"></div>
                                        <div className="chip-main"></div>
                                    </div>
                                </div>
                                <div>
                                    <Wifi className="rotate-90 text-4xl" />
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white p-3 rounded-xl">
                            <div className=" bg-gray-200 border-2 border-dashed rounded-xl" />
                        </div>
                    </div>

                    {/* Card Number */}
                    <div className="text-xs md:text-xl 2xl:text-2xl tracking-wider mb-4 font-mono">
                        4334 51** **** *15 83
                    </div>

                    {/* Expiry & Name */}
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs xl:text-sm opacity-90">
                                EXP. END
                            </p>
                            <p className="text-base 2xl:text-xl font-semibold">
                                00/0000
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm md:text-xl font-semibold uppercase">
                                VISA
                            </p>
                        </div>
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
