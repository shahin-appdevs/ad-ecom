// Components
import MoneyOutSection from "@/components/dashboard/pages/moneyOut/moneyOut";
import MoneyOutHistorySection from "@/components/dashboard/pages/moneyOut/moneyOutHistory";


export default function MoneyOut() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MoneyOutSection />
                    <MoneyOutHistorySection />
                </div>
            </div>
        </>
    );
}