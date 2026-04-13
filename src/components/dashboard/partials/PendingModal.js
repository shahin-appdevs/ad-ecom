import Modal from "@/components/ui/Modal";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "@/i18n/navigation";
import React from "react";
import { useTranslations } from "next-intl";

const PendingModal = ({ open, onClose, title = "", message = "" }) => {
    const router = useRouter();
    const t = useTranslations("Dashboard.cards.virtualCard.pendingModal"); // Adjust namespace as needed

    return (
        <Modal open={open} onClose={onClose} className={"!max-w-xl"}>
            {/* Icon */}
            <div className="flex justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>

            {/* Title */}
            <div className="mt-4 text-center text-lg font-semibold text-gray-900">
                {title || t("title")}
            </div>

            {/* Message */}
            <p className="mt-2 text-center text-sm text-gray-600">
                {message || t("message")}
            </p>

            {/* Button */}
            <div className="mt-6">
                <button
                    onClick={() => {
                        onClose();
                        router.push("/user/cards/virtual-card/update-customer");
                    }}
                    className="w-full rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    {t("updateCustomer")}
                </button>
            </div>
        </Modal>
    );
};

export default PendingModal;
