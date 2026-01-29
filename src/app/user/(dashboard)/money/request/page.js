// Components
import RequestMoneySection from "@/components/dashboard/pages/requestMoney/requestMoney";
import RequestMoneyHistorySection from "@/components/dashboard/pages/requestMoney/requestMoneyHistory";


export default function RequestMoney() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <RequestMoneySection />
                    <RequestMoneyHistorySection />
                </div>
            </div>
        </>
    );
}