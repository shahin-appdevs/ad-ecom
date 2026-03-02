"use client";
// Components
import MakePaymentSection from "@/components/dashboard/pages/makePayment/makePayment";
import MakePaymentHistorySection from "@/components/dashboard/pages/makePayment/makePaymentHistory";
import { useState } from "react";

export default function MakePayment() {
    const [isRefetch, setRefetch] = useState(false);
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MakePaymentSection setRefetch={setRefetch} />
                    <MakePaymentHistorySection isRefetch={isRefetch} />
                </div>
            </div>
        </>
    );
}
