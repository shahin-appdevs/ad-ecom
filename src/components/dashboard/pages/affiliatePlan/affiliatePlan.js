"use client";
import { useEffect, useState } from "react";
import { affiliatePlanGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

function SkeletonCard() {
    return (
        <div className="relative flex flex-col p-2 rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse">
            <div className="px-6 py-4 rounded-xl bg-gray-100">
                <div className="h-5 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-7 w-32 bg-gray-200 rounded"></div>
            </div>
            <ul className="space-y-2 flex-1 p-4">
                {[...Array(5)].map((_, i) => (
                    <li key={i} className="flex items-center space-x-2">
                        <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    </li>
                ))}
            </ul>
            <div className="p-4">
                <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );
}

export default function AffiliatePlan() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([]);
    const [activePlan, setActivePlan] = useState(null);
    const [currency, setCurrency] = useState({ code: "BDT", symbol: "৳" });
    const router = useRouter();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await affiliatePlanGetAPI();
                const data = res?.data?.data;
                setPlans(data?.all_plans || []);
                setActivePlan(data?.my_active_plan || null);
                setCurrency({
                    code: data?.base_curr,
                    symbol: data?.base_curr_symbol,
                });
            } catch (err) {
                toast.error("Failed to load plans");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-[12px] p-7">
                <div className="grid md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="grid md:grid-cols-4 gap-4">
                {plans.map((plan) => {
                    const isActive = activePlan?.id === plan.id;
                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col p-2 rounded-2xl border transition hover:shadow-lg ${
                                isActive
                                    ? "bg-[#f9faff] shadow-lg"
                                    : "border-gray-200 bg-white shadow-sm"
                            }`}
                        >
                            {isActive && (
                                <span className="absolute top-4 right-4 bg-blue-100 text-primary__color text-xs font-medium px-2 py-1 rounded-full">
                                    Active
                                </span>
                            )}
                            <div className={`px-6 py-4 rounded-xl ${
                                isActive
                                    ? "bg-white shadow-sm"
                                    : "bg-[#f9faff]"
                                }`}>
                                <h6 className="font-semibold mb-4">{plan.name}</h6>
                                <div className="text-[22px] font-bold text-color__heading mb-2">
                                    {currency.symbol}
                                    {plan.joining_fee}
                                    <span className="text-sm font-medium text-gray-500 ml-1">
                                        one time
                                    </span>
                                </div>
                            </div>
                            <ul className="space-y-2 flex-1 p-4">
                                {plan.features.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center text-sm"
                                    >
                                        <CheckBadgeIcon
                                            className={`h-5 w-5 mr-2 ${
                                                f.value
                                                    ? "text-primary__color"
                                                    : "text-gray-300"
                                            }`}
                                        />
                                        <span
                                            className={`capitalize ${
                                                f.value
                                                    ? "text-gray-700"
                                                    : "text-gray-400 line-through"
                                            }`}
                                        >
                                            {f.name.replaceAll("_", " ")}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="p-4">
                                <button
                                    disabled={isActive}
                                    onClick={() =>
                                        !isActive &&
                                        router.push(`/user/affiliate-plan/confirm?planId=${plan.id}&amount=${plan.joining_fee}`)
                                    }
                                    className={`w-full rounded-[6px] py-3 font-semibold transition ${
                                        isActive
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            : "bg-primary__color text-white"
                                    }`}
                                >
                                    {isActive ? "Current Plan" : `Choose ${plan.name}`}
                                </button> 
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
