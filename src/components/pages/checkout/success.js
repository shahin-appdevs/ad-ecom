"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function OrderSuccessPage() {
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
                <h1 className="text-2xl font-bold mb-3">
                    Order Confirmed!
                </h1>
                <p className="text-center mb-6 max-w-md">
                    Thank you for your purchase. Your order has been
                    successfully placed and will be processed shortly.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="bg-primary__color text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}