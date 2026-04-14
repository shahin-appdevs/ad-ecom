"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
// import { motion } from "framer-motion";
import { XCircleIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";

const motion = dynamic(() => import("framer-motion").then((mod) => mod.motion), {
    ssr: false,
});

export default function OrderCancelPage() {
    const t = useTranslations("Checkout.orderCancel");
    return (
        <section className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                }}
                className="flex flex-col items-center text-center"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <XCircleIcon className="h-16 w-16 text-red-600 mb-6" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-3">
                    {t("orderCanceled")}
                </h1>
                <p className="text-center mb-6 max-w-md">
                    {t("thankYouMessage")}
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="bg-primary__color text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
                    >
                        {t("continueShopping")}
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
