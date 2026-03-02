"use client";
// Components
import MoneyOutSection from "@/components/dashboard/pages/moneyOut/moneyOut";
import MoneyOutHistorySection from "@/components/dashboard/pages/moneyOut/moneyOutHistory";
import { useState } from "react";

export default function MoneyOut() {
    const [isRefetch, setRefetch] = useState(false);
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MoneyOutSection setRefetch={setRefetch} />
                    <MoneyOutHistorySection isRefetch={isRefetch} />
                </div>
            </div>
        </>
    );
}
