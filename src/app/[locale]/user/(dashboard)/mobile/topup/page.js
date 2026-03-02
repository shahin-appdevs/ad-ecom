// Components
import MobileTopupSection from "@/components/dashboard/pages/mobileTopup/mobileTopup";
import MobileTopupHistorySection from "@/components/dashboard/pages/mobileTopup/mobileTopupHistory";


export default function MobileTopup() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MobileTopupSection />
                    <MobileTopupHistorySection />
                </div>
            </div>
        </>
    );
}