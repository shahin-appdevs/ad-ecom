"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function AddMoneyCancelPage() {
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
                    Add Money Canceled!
                </h1>
                <p className="text-center mb-6 max-w-md">
                    Thank you for your submission. But your transaction has been
                    canceled and will be processed shortly.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/user/add/money"
                        className="bg-primary__color text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
                    >
                        Continue Add Money
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}