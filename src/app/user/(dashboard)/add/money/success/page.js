// Components
import AddMoneySuccessSection from "@/components/dashboard/pages/addMoney/addMoneySuccess";


export default function AddMoneySuccess() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AddMoneySuccessSection />
                </div>
            </div>
        </>
    );
}