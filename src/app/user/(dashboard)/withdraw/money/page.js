"use client";
// Components

import WithdrawSection from "@/components/dashboard/pages/withdraw/withdraw";
import WithdrawHistorySection from "@/components/dashboard/pages/withdraw/withdrawHistory";
import { useState } from "react";

export default function Withdraw() {
    const [isRefetch, setRefetch] = useState(false);
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <WithdrawSection setRefetch={setRefetch} />
                    <WithdrawHistorySection isRefetch={isRefetch} />
                </div>
            </div>
        </>
    );
}
