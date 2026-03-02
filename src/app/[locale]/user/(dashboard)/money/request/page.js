"use client";
// Components
import RequestMoneySection from "@/components/dashboard/pages/requestMoney/requestMoney";
import RequestMoneyHistorySection from "@/components/dashboard/pages/requestMoney/requestMoneyHistory";
import { useState } from "react";

export default function RequestMoney() {
    const [isRefetch, setRefetch] = useState(false);
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <RequestMoneySection setRefetch={setRefetch} />
                    <RequestMoneyHistorySection isRefetch={isRefetch} />
                </div>
            </div>
        </>
    );
}
