"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    XMarkIcon,
    CurrencyDollarIcon,
    CreditCardIcon,
} from "@heroicons/react/24/outline";
import { submitGiftOrderAPI } from "@root/services/apiClient/apiClient";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";

export default function GiftCardBuyConfirmModal({
    isOpen,
    closeModal,
    product,
}) {
    const t = useTranslations(
        "Dashboard.cards.giftCard.giftCardBuy.confirmModal",
    );
    const lang = useLocale();
    const [loading, setLoading] = useState(false);
    const handleOrderSubmit = async () => {
        // console.log(product);
        setLoading(true);

        const formData = new FormData();

        formData.append("product_id", product.productId);
        formData.append("amount", product.amount || "");
        formData.append("receiver_email", product.receiverEmail || "");
        formData.append("receiver_country", product.country || "");
        formData.append("receiver_phone_code", product.phoneCode);
        formData.append("receiver_phone", product.phoneNumber?.trim());
        formData.append("from_name", product.fromName || "");
        formData.append("quantity", product.quantity || "");
        formData.append("wallet_currency", product.walletCurrency || "");

        try {
            const result = await submitGiftOrderAPI(formData, lang);
            const messages = result?.data?.message?.success;
            messages.forEach((message) => toast.success(message));
            closeModal();
        } catch (error) {
            const errors = error?.response?.data?.message?.error || [];
            errors?.forEach((err) => toast.error(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 " onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-50 overflow-y-auto ">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full  max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 lg:p-8 text-left shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title className="text-lg font-bold">
                                        {t("title")}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Info rows */}
                                <div className="space-y-3">
                                    {/* Reusable row */}
                                    {[
                                        {
                                            label: t("productId"),
                                            value: product?.productId,
                                            icon: CreditCardIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("productName"),
                                            value: product?.productName,
                                            icon: CreditCardIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("receiverEmail"),
                                            value: product?.receiverEmail,
                                            icon: CreditCardIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("receiverCountry"),
                                            value: product?.country,
                                            icon: CreditCardIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("receiverPhoneCode"),
                                            value: product?.phoneCode,
                                            icon: CreditCardIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("receiverPhone"),
                                            value: product?.phoneNumber,
                                            icon: CreditCardIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("fromName"),
                                            value: product?.fromName,
                                            icon: CreditCardIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("quantity"),
                                            value: product?.quantity,
                                            icon: CurrencyDollarIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("walletCurrency"),
                                            value: `${product?.walletCurrency}`,
                                            icon: CurrencyDollarIcon,
                                            valueColor: "text-green-600",
                                        },
                                        {
                                            label: t("amount"),
                                            value: `${product?.amount}`,
                                            icon: CurrencyDollarIcon,
                                            valueColor: "text-green-600",
                                        },
                                    ].map((row) => (
                                        <div
                                            key={row.label}
                                            className="flex justify-between items-center border-b border-gray-100 py-1"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <row.icon className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {row.label}
                                                </span>
                                            </div>
                                            <span
                                                className={`text-sm font-semibold ${row.valueColor}`}
                                            >
                                                {row.value}
                                            </span>
                                        </div>
                                    ))}

                                    <div className="mt-4!">
                                        <button
                                            onClick={handleOrderSubmit}
                                            className="w-full bg-primary__color  text-white font-medium text-base py-2 rounded-xl shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary__color/50"
                                        >
                                            {loading
                                                ? t("confirming")
                                                : t("confirm")}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
