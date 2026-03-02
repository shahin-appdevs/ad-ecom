// Components
import AddMoneySection from "@/components/dashboard/pages/addMoney/addMoney";
import AddMoneyHistorySection from "@/components/dashboard/pages/addMoney/addMoneyHistory";


export default function AddMoney() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AddMoneySection />
                    <AddMoneyHistorySection />
                </div>
            </div>
        </>
    );
}