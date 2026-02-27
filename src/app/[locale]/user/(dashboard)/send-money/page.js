"use client";
// Components
import SendMoneySection from "@/components/dashboard/pages/sendMoney/sendMoney";
import SendMoneyHistorySection from "@/components/dashboard/pages/sendMoney/sendMoneyHistory";
import { useState } from "react";

export default function SendMoney() {
    const [isRefetch, setRefetch] = useState(false);
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <SendMoneySection setRefetch={setRefetch} />
                    <SendMoneyHistorySection isRefetch={isRefetch} />
                </div>
            </div>
        </>
    );
}
