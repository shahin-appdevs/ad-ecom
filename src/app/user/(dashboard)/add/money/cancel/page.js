// Components
import AddMoneyCancelSection from "@/components/dashboard/pages/addMoney/addMoneyCancel";


export default function AddMoneyCancel() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AddMoneyCancelSection />
                </div>
            </div>
        </>
    );
}