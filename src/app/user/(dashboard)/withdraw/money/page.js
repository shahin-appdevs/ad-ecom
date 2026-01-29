// Components
import WithdrawSection from "@/components/dashboard/pages/withdraw/withdraw";
import WithdrawHistorySection from "@/components/dashboard/pages/withdraw/withdrawHistory";


export default function Withdraw() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <WithdrawSection />
                    <WithdrawHistorySection />
                </div>
            </div>
        </>
    );
}