"use client";
import { Link } from "@/i18n/navigation";
// import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const motion = dynamic(() => import("framer-motion").then((mod) => mod.motion), {
    ssr: false,
});

export default function AffiliatePlanSuccessPage() {
    const t = useTranslations("Dashboard.account.affiliatePlan.success");
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
                    <CheckCircleIcon className="h-16 w-16 text-primary__color mb-6" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-3">{t("title")}</h1>
                <p className="text-center mb-6 max-w-md">{t("message")}</p>
                <div className="flex gap-4">
                    <Link
                        href="/user/affiliate-plan"
                        className="bg-primary__color text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
                    >
                        {t("btnText")}
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
