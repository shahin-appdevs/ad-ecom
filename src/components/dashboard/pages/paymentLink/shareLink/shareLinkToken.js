"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

// Stripe Card Form Component
const StripeCardForm = ({
    formData,
    onFormDataChange,
    publicKey,
    onCardDetailsChange,
}) => {
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
                    Card Name
                </label>
                <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={onFormDataChange}
                    placeholder="Name on card"
                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">
                    Card Details
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
    const router = useRouter();
    const stripe = useStripe();
    const elements = useElements();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const processStripePayment = async () => {
        if (!stripe || !elements) {
            toast.error("Stripe not loaded properly");
            return null;
        }

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            toast.error("Card details not found");
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
            toast.error("Failed to process card details");
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data) return;

        // Basic validation
        if (!formData.fullName || !formData.email || !formData.phone) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (paymentType === "card_payment" && !formData.cardName) {
            toast.error("Please enter card name");
            return;
        }

        if (
            paymentLink.type === "pay" &&
            !paymentLink.price &&
            !formData.amount
        ) {
            toast.error("Please enter amount");
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
                `${window.location.origin}/user/payment/link/share/success`,
                `${window.location.origin}/user/payment/link/share/cancel`,
            );

            toast.success("Payment submitted successfully!");
            if (response.data.data.redirect_url) {
                window.location.href = response.data.data.redirect_url;
            } else if (
                paymentType === "card_payment" ||
                paymentType === "wallet_payment"
            ) {
                // For card and wallet payments that process immediately
                // Redirect to success page after a short delay to show success message
                setTimeout(() => {
                    window.location.href = `${window.location.origin}/user/payment/link/share/success`;
                }, 1500);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message?.error?.[0] || "Payment failed",
            );
        } finally {
            setApiLoading(false);
        }
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
                        <div>
                            <p className="mb-1">
                                <span className="font-medium">Type:</span>{" "}
                                {paymentLink.linkType}
                            </p>
                            <p className="mb-1">
                                <span className="font-medium">Amount:</span>{" "}
                                {paymentLink.amountCalculation}
                            </p>
                            <p className="mb-1">
                                <span className="font-medium">Currency:</span>{" "}
                                {paymentLink.currency} (
                                {paymentLink.currency_symbol})
                            </p>
                            {paymentLink.limit && (
                                <p className="mb-1">
                                    <span className="font-medium">Limit:</span>{" "}
                                    {paymentLink.limit} payments
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paymentLink.type === "pay" && !paymentLink.price && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Amount ({paymentLink.currency_symbol})
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    min={paymentLink.min_amount || 0}
                                    max={paymentLink.max_amount || ""}
                                    step="0.01"
                                    placeholder="Amount"
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                                {paymentLink.min_amount && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Minimum: {paymentLink.min_amount}{" "}
                                        {paymentLink.currency}
                                    </p>
                                )}
                                {paymentLink.max_amount && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Maximum: {paymentLink.max_amount}{" "}
                                        {paymentLink.currency}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Payment Form */}
                <div>
                    <div className="border rounded-lg p-6 space-y-4 shadow-sm">
                        <div className="space-y-4">
                            <div className="">
                                <label className="block text-sm font-medium mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Full Name"
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="">
                                <label className="block text-sm font-medium mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email"
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="">
                                <label className="block text-sm font-medium mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Phone"
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Listbox
                                    value={paymentType}
                                    onChange={setPaymentType}
                                >
                                    <Listbox.Label className="block text-sm font-medium">
                                        Payment Method *
                                    </Listbox.Label>
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                            <span className="block truncate">
                                                {paymentType ===
                                                    "payment_gateway" &&
                                                    "Payment Gateway"}
                                                {paymentType ===
                                                    "card_payment" && "Card"}
                                                {paymentType ===
                                                    "wallet_payment" &&
                                                    "Wallet"}
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
                                                                Payment Gateway
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
                                                                Card
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
                                                                Wallet
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
                                            Select Gateway *
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
                                                        : "Select a gateway"}
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
                                                                Select a gateway
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
                                            Select Wallet Currency *
                                        </Listbox.Label>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                                <span className="block truncate">
                                                    {formData.walletCurrency
                                                        ? `${data.active_currencies.find((c) => c.code === formData.walletCurrency)?.name} (${data.active_currencies.find((c) => c.code === formData.walletCurrency)?.symbol})`
                                                        : "Select a currency"}
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
                                                                Select a
                                                                currency
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
                                    <strong>
                                        Securely save my information for 1-click
                                        checkout
                                    </strong>
                                    <br />
                                    Pay faster on and everywhere Link is
                                    accepted
                                </span>
                            </div>

                            <Button
                                type="submit"
                                title={apiLoading ? "Processing..." : "Pay"}
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
                setError("Invalid payment link");
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
                setError(err.message || "Failed to load payment link");
                toast.error(err.message || "Failed to load payment link");
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
                <h3 className="text-xl font-semibold mb-4">Error</h3>
                <p className="text-red-500 mb-6">{error}</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-4 py-2 bg-primary__color text-white rounded-md hover:bg-blue-600 transition"
                >
                    Go to Home
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
