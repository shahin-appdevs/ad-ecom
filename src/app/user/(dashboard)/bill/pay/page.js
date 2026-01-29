"use client";
// Components

import BillPaySection from "@/components/dashboard/pages/billPay/billPay";
import BillPayHistorySection from "@/components/dashboard/pages/billPay/billPayHistory";
import { useState } from "react";

export default function BillPay() {
    const [billPaySuccess, setBillPaySuccess] = useState(false);

    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <BillPaySection setBillPaySuccess={setBillPaySuccess} />
                    <BillPayHistorySection billPaySuccess={billPaySuccess} />
                </div>
            </div>
        </>
    );
}
