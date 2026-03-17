"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import {
    paymentLinkShareAPI,
    paymentLinkShareSubmitAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import Button from "@/components/utility/Button";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import getJwtToken from "@/components/utility/getJwtToken";
import Image from "next/image";
import getImageUrl from "@/components/utility/getImageUrl";

// Stripe Card Form Component
const StripeCardForm = ({
    formData,
    onFormDataChange,
    publicKey,
    onCardDetailsChange,
}) => {
    const t = useTranslations(
        "Dashboard.wallet.paymentLink.paymentLinkShare.stripeForm",
    );

    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCardChange = (event) => {
        if (event.error) {
            setCardError(event.error.message);
        } else {
            setCardError("");
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    {t("cardNameLabel")}
                </label>
                <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={onFormDataChange}
                    placeholder={t("cardNamePlaceholder")}
                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">
                    {t("cardDetailsLabel")}
                </label>
                <div className="border rounded-md p-3 bg-white">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: "16px",
                                    color: "#424770",
                                    "::placeholder": {
                                        color: "#aab7c4",
                                    },
                                },
                            },
                            hidePostalCode: true,
                        }}
                        onChange={handleCardChange}
                    />
                </div>
                {cardError && (
                    <p className="text-red-500 text-xs mt-1">{cardError}</p>
                )}
            </div>
        </div>
    );
};

const PaymentLinkSkeleton = () => {
    return (
        <div className="bg-white rounded-[12px] p-4 sm:p-6 lg:p-7 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                {/* Left Column Skeleton */}
                <div>
                    <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-8"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-md"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded mt-1"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded mt-1"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div>
                    <div className="border rounded-lg p-6 space-y-4 shadow-sm">
                        <div className="space-y-3">
                            <div className="h-10 bg-gray-200 rounded-md"></div>
                            <div className="h-10 bg-gray-200 rounded-md"></div>
                            <div className="h-10 bg-gray-200 rounded-md"></div>

                            <div className="space-y-2">
                                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded-md"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-10 bg-gray-200 rounded-md"></div>
                                <div className="h-10 bg-gray-200 rounded-md"></div>
                            </div>

                            <div className="h-32 bg-gray-200 rounded-md"></div>

                            <div className="h-12 bg-gray-200 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Payment Component
function PaymentLinkShareContent({
    data,
    publicKey,
    formData,
    setFormData,
    paymentType,
    setPaymentType,
    apiLoading,
    setApiLoading,
}) {
    const t = useTranslations("Dashboard.wallet.paymentLink.paymentLinkShare");

    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const processStripePayment = async () => {
        if (!stripe || !elements) {
            toast.error(t("errors.stripeNotLoaded"));
            return null;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            toast.error(t("errors.cardNotFound"));
            return null;
        }

        try {
            const { error, token } = await stripe.createToken(cardElement);

            if (error) {
                toast.error(error.message);
                return null;
            }

            return {
                token: token.id,
                last4: token.card.last4,
            };
        } catch (err) {
            toast.error(t("errors.cardProcessingFailed"));
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data) return;

        // Basic validation
        if (!formData.fullName || !formData.email || !formData.phone) {
            toast.error(t("errors.requiredFields"));
            return;
        }

        if (paymentType === "card_payment" && !formData.cardName) {
            toast.error(t("errors.cardNameRequired"));
            return;
        }

        if (
            data.payment_link.type === "pay" &&
            !data.payment_link.price &&
            !formData.amount
        ) {
            toast.error(t("errors.amountRequired"));
            return;
        }

        try {
            setApiLoading(true);

            let cardToken = null;
            let last4Card = "";

            // If payment type is card, process Stripe payment first
            if (paymentType === "card_payment") {
                const stripeResult = await processStripePayment();
                if (!stripeResult) {
                    setApiLoading(false);
                    return;
                }

                cardToken = stripeResult.token;
                last4Card = stripeResult.last4;

                // Update form data with last4 card
                setFormData((prev) => ({
                    ...prev,
                    last4Card: last4Card,
                }));
            }

            const response = await paymentLinkShareSubmitAPI(
                data.payment_link.id,
                paymentType,
                formData.email,
                formData.phone,
                formData.fullName,
                formData.userId ? formData.userId.toString() : null,
                formData.walletCurrency,
                formData.amount,
                formData.cardName,
                cardToken,
                last4Card || formData.last4Card,
                formData.paymentGateway,
                "WEB",
                `${window.location.origin}/payment-link/sharelink-success`,
                `${window.location.origin}/payment-link/sharelink-cancel`,
            );

            toast.success(t("success.paymentSubmitted"));
            if (response.data.data.redirect_url) {
                window.location.href = response.data.data.redirect_url;
            } else if (
                paymentType === "card_payment" ||
                paymentType === "wallet_payment"
            ) {
                // For card and wallet payments that process immediately
                setTimeout(() => {
                    window.location.href = `${window.location.origin}/payment-link/sharelink-success`;
                }, 1500);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] ||
                    t("errors.paymentFailed"),
            );
        } finally {
            setApiLoading(false);
        }
    };

    const handlePaymentTypeChange = (paymentType) => {
        const userToken = getJwtToken();

        if (paymentType === "wallet_payment") {
            if (!userToken)
                router.push(`/user/auth/login?pay_link_token=${token}`);
        }
        setPaymentType(paymentType);
    };

    const paymentLink = data.payment_link;

    return (
        <div className="bg-white rounded-[12px] p-4 sm:p-6 lg:p-7">
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10"
            >
                {/* Left Column - Payment Details */}
                <div>
                    <h3 className="text-xl font-bold mb-2">
                        {paymentLink.title}
                    </h3>
                    {paymentLink.details && (
                        <p className="text-gray-600 mb-8">
                            {paymentLink.details}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                        <div className="space-y-4">
                            <p className="mb-1">
                                <span className="font-medium">
                                    {t("labels.type")}:
                                </span>{" "}
                                {paymentLink.linkType}
                            </p>
                            <p className="mb-1">
                                <span className="font-medium">
                                    {t("labels.amount")}:
                                </span>{" "}
                                {paymentLink.amountCalculation}
                            </p>
                            <p className="mb-1">
                                <span className="font-medium">
                                    {t("labels.currency")}:
                                </span>{" "}
                                {paymentLink.currency} (
                                {paymentLink.currency_symbol})
                            </p>
                            {paymentLink.limit && (
                                <p className="mb-1">
                                    <span className="font-medium">
                                        {t("labels.limit")}:
                                    </span>{" "}
                                    {paymentLink.limit} {t("labels.payments")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paymentLink.type === "pay" && !paymentLink.price && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {t("labels.amountWithSymbol", {
                                        symbol: paymentLink.currency_symbol,
                                    })}
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    min={paymentLink.min_amount || 0}
                                    max={paymentLink.max_amount || ""}
                                    step="0.01"
                                    placeholder={t("placeholders.amount")}
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                                {paymentLink.min_amount && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t("labels.minimum")}:{" "}
                                        {paymentLink.min_amount}{" "}
                                        {paymentLink.currency}
                                    </p>
                                )}
                                {paymentLink.max_amount && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {t("labels.maximum")}:{" "}
                                        {paymentLink.max_amount}{" "}
                                        {paymentLink.currency}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    {paymentLink.image && (
                        <div className="mt-6">
                            <Image
                                src={getImageUrl(
                                    paymentLink.image,
                                    data.payment_link_image_path,
                                )}
                                alt={paymentLink.title}
                                width={200}
                                height={200}
                                className="rounded-md"
                            />
                        </div>
                    )}
                </div>

                {/* Right Column - Payment Form */}
                <div>
                    <div className="border rounded-lg p-6 space-y-4 shadow-sm">
                        <div className="space-y-4">
                            <div className="">
                                <label className="block text-sm font-medium mb-1">
                                    {t("labels.fullName")} *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder={t("placeholders.fullName")}
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="">
                                <label className="block text-sm font-medium mb-1">
                                    {t("labels.email")} *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder={t("placeholders.email")}
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="">
                                <label className="block text-sm font-medium mb-1">
                                    {t("labels.phone")} *
                                </label>
                                <input
                                    type="number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder={t("placeholders.phone")}
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Listbox
                                    value={paymentType}
                                    onChange={handlePaymentTypeChange}
                                >
                                    <Listbox.Label className="block text-sm font-medium">
                                        {t("labels.paymentMethod")} *
                                    </Listbox.Label>
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                            <span className="block truncate">
                                                {paymentType ===
                                                    "payment_gateway" &&
                                                    t("paymentMethods.gateway")}
                                                {paymentType ===
                                                    "card_payment" &&
                                                    t("paymentMethods.card")}
                                                {paymentType ===
                                                    "wallet_payment" &&
                                                    t("paymentMethods.wallet")}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon
                                                    className="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                            {data.payment_settings
                                                .payment_gateway_status && (
                                                <Listbox.Option
                                                    key="payment_gateway"
                                                    value="payment_gateway"
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-indigo-100 text-indigo-900"
                                                                : "text-gray-900"
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                            >
                                                                {t(
                                                                    "paymentMethods.gateway",
                                                                )}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                    <CheckIcon
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            )}
                                            {data.payment_settings
                                                .card_status && (
                                                <Listbox.Option
                                                    key="card_payment"
                                                    value="card_payment"
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-indigo-100 text-indigo-900"
                                                                : "text-gray-900"
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                            >
                                                                {t(
                                                                    "paymentMethods.card",
                                                                )}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                    <CheckIcon
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            )}
                                            {data.payment_settings
                                                .wallet_status && (
                                                <Listbox.Option
                                                    key="wallet_payment"
                                                    value="wallet_payment"
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-indigo-100 text-indigo-900"
                                                                : "text-gray-900"
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                            >
                                                                {t(
                                                                    "paymentMethods.wallet",
                                                                )}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                    <CheckIcon
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            )}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>

                            {/* Payment Gateway Selection */}
                            {paymentType === "payment_gateway" && (
                                <div>
                                    <Listbox
                                        value={formData.paymentGateway}
                                        onChange={(value) =>
                                            handleInputChange({
                                                target: {
                                                    name: "paymentGateway",
                                                    value,
                                                },
                                            })
                                        }
                                    >
                                        <Listbox.Label className="block text-sm font-medium mb-1">
                                            {t("labels.selectGateway")} *
                                        </Listbox.Label>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                                <span className="block truncate">
                                                    {formData.paymentGateway
                                                        ? data.payment_gateways.find(
                                                              (g) =>
                                                                  g.alias ===
                                                                  formData.paymentGateway,
                                                          )?.name
                                                        : t(
                                                              "placeholders.selectGateway",
                                                          )}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronUpDownIcon
                                                        className="h-5 w-5 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                                <Listbox.Option
                                                    key="empty"
                                                    value=""
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-indigo-100 text-indigo-900"
                                                                : "text-gray-900"
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                            >
                                                                {t(
                                                                    "placeholders.selectGateway",
                                                                )}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                    <CheckIcon
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                                {data.payment_gateways.map(
                                                    (gateway) => (
                                                        <Listbox.Option
                                                            key={gateway.id}
                                                            value={
                                                                gateway.alias
                                                            }
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active
                                                                        ? "bg-indigo-100 text-indigo-900"
                                                                        : "text-gray-900"
                                                                }`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                                    >
                                                                        {
                                                                            gateway.name
                                                                        }
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                            <CheckIcon
                                                                                className="h-5 w-5"
                                                                                aria-hidden="true"
                                                                            />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ),
                                                )}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </div>
                            )}

                            {/* Card Payment Fields */}
                            {paymentType === "card_payment" && (
                                <div className="stripe-card-form">
                                    <StripeCardForm
                                        formData={formData}
                                        onFormDataChange={handleInputChange}
                                        publicKey={publicKey}
                                    />
                                </div>
                            )}

                            {/* Wallet Payment Selection */}
                            {paymentType === "wallet_payment" && (
                                <div>
                                    <Listbox
                                        value={formData.walletCurrency}
                                        onChange={(value) =>
                                            handleInputChange({
                                                target: {
                                                    name: "walletCurrency",
                                                    value,
                                                },
                                            })
                                        }
                                    >
                                        <Listbox.Label className="block text-sm font-medium mb-1">
                                            {t("labels.selectWalletCurrency")} *
                                        </Listbox.Label>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                                <span className="block truncate">
                                                    {formData.walletCurrency
                                                        ? `${data.active_currencies.find((c) => c.code === formData.walletCurrency)?.name} (${data.active_currencies.find((c) => c.code === formData.walletCurrency)?.symbol})`
                                                        : t(
                                                              "placeholders.selectCurrency",
                                                          )}
                                                </span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronUpDownIcon
                                                        className="h-5 w-5 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                                <Listbox.Option
                                                    key="empty"
                                                    value=""
                                                    className={({ active }) =>
                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                            active
                                                                ? "bg-indigo-100 text-indigo-900"
                                                                : "text-gray-900"
                                                        }`
                                                    }
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                            >
                                                                {t(
                                                                    "placeholders.selectCurrency",
                                                                )}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                    <CheckIcon
                                                                        className="h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                                {data.active_currencies.map(
                                                    (currency) => (
                                                        <Listbox.Option
                                                            key={currency.id}
                                                            value={
                                                                currency.code
                                                            }
                                                            className={({
                                                                active,
                                                            }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active
                                                                        ? "bg-indigo-100 text-indigo-900"
                                                                        : "text-gray-900"
                                                                }`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                                                    >
                                                                        {
                                                                            currency.name
                                                                        }{" "}
                                                                        (
                                                                        {
                                                                            currency.symbol
                                                                        }
                                                                        )
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                            <CheckIcon
                                                                                className="h-5 w-5"
                                                                                aria-hidden="true"
                                                                            />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ),
                                                )}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </div>
                            )}

                            <div className="border rounded-md p-3 bg-gray-50 text-xs text-gray-600 flex items-center gap-2">
                                <span className="text-lg">💯</span>
                                <span>
                                    <strong>{t("secureSave.title")}</strong>
                                    <br />
                                    {t("secureSave.description")}
                                </span>
                            </div>

                            <Button
                                type="submit"
                                title={
                                    apiLoading
                                        ? t("buttons.processing")
                                        : t("buttons.pay")
                                }
                                variant="primary"
                                size="md"
                                className="w-full"
                                disabled={apiLoading}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

// Main Page Component
export default function PaymentLinkSharePage() {
    const t = useTranslations("Dashboard.wallet.paymentLink.paymentLinkShare");

    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState(null);
    const [publicKey, setPublicKey] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentType, setPaymentType] = useState("payment_gateway");
    const [userId, setUserId] = useState(null);
    const [stripePromise, setStripePromise] = useState(null);
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        fullName: "",
        amount: "",
        cardName: "",
        last4Card: "",
        paymentGateway: "",
        walletCurrency: "",
        userId: null,
    });

    useEffect(() => {
        const fetchPaymentLink = async () => {
            const linkToken = searchParams.get("token");

            if (!linkToken) {
                setError(t("errors.invalidLink"));
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // Check for logged in user
                const userInfo = localStorage.getItem("userInfo");
                if (userInfo) {
                    const user = JSON.parse(userInfo);
                    setUserId(user.id.toString());
                    setFormData((prev) => ({
                        ...prev,
                        userId: user.id.toString(),
                    }));
                }

                const response = await paymentLinkShareAPI(linkToken);
                setData(response.data.data);

                const key = response?.data?.data?.payment_settings?.public_key;
                if (key) {
                    setPublicKey(key);
                    // Initialize Stripe with the public key
                    setStripePromise(loadStripe(key));
                }

                if (response.data.data.payment_link.price) {
                    setFormData((prev) => ({
                        ...prev,
                        amount: response.data.data.payment_link.price,
                    }));
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message?.error[0];

                setError(errorMessage || t("errors.loadFailed"));
                toast.error(errorMessage || t("errors.loadFailed"));
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentLink();
    }, [searchParams]);

    if (isLoading) {
        return <PaymentLinkSkeleton />;
    }

    if (error) {
        return (
            <div className="bg-white rounded-[12px] p-7 max-w-2xl mx-auto text-center">
                <h3 className="text-xl font-semibold mb-4">
                    {t("errorTitle")}
                </h3>
                <p className="text-red-500 mb-6">{error}</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 bg-primary__color text-white rounded-md hover:bg-blue-600 transition"
                >
                    {t("buttons.goHome")}
                </button>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    // Wrap with Stripe Elements provider if we have a public key
    if (stripePromise) {
        return (
            <Elements stripe={stripePromise}>
                <PaymentLinkShareContent
                    data={data}
                    publicKey={publicKey}
                    formData={formData}
                    setFormData={setFormData}
                    paymentType={paymentType}
                    setPaymentType={setPaymentType}
                    apiLoading={apiLoading}
                    setApiLoading={setApiLoading}
                />
            </Elements>
        );
    }

    return (
        <PaymentLinkShareContent
            data={data}
            publicKey={publicKey}
            formData={formData}
            setFormData={setFormData}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            apiLoading={apiLoading}
            setApiLoading={setApiLoading}
        />
    );
}
