// Components
import WalletSection from "@/components/dashboard/pages/dashboard/wallet";
import WidgetSection from "@/components/dashboard/pages/dashboard/widget";
import ChatAnalyticsSection from "@/components/dashboard/pages/dashboard/chartAnalytics";
import ChatHistorySection from "@/components/dashboard/pages/dashboard/transactionHistory";


export default function Dashboard() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <WalletSection />
                    <WidgetSection />
                    <ChatAnalyticsSection />
                    <ChatHistorySection />
                </div>
            </div>
        </>
    );
}