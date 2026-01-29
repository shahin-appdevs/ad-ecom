// Components
import ReferralSection from "@/components/dashboard/pages/referral/referral";
import ReferralHistorySection from "@/components/dashboard/pages/referral/referralHistory";


export default function ReferralStatus() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ReferralSection />
                    <ReferralHistorySection />
                </div>
            </div>
        </>
    );
}