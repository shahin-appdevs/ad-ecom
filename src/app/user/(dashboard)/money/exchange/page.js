// Components
import ExchangeMoneySection from "@/components/dashboard/pages/exchangeMoney/exchangeMoney";
import ExchangeMoneyHistorySection from "@/components/dashboard/pages/exchangeMoney/exchangeMoneyHistory";


export default function ExchangeMoney() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ExchangeMoneySection />
                    <ExchangeMoneyHistorySection />
                </div>
            </div>
        </>
    );
}