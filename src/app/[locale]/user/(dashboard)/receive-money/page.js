// Components
import ReceiveMoneySection from "@/components/dashboard/pages/receiveMoney/receiveMoney";


export default function ReceiveMoney() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ReceiveMoneySection />
                </div>
            </div>
        </>
    );
}