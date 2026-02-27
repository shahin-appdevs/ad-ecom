// Components
import ReferralBonusTransactionSection from "@/components/dashboard/pages/transactions/referralBonus";


export default function ReferralBonusTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ReferralBonusTransactionSection />
                </div>
            </div>
        </>
    );
}