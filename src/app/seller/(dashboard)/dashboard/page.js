// Components
import WalletSection from "@/components/dashboard/pages/seller/dashboard/wallet";
import ChatHistorySection from "@/components/dashboard/pages/seller/dashboard/transactionHistory";

export default function Dashboard() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <WalletSection />
                    <ChatHistorySection />
                </div>
            </div>
        </>
    );
}
