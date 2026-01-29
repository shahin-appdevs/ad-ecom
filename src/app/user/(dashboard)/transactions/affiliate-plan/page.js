// Components
import AffiliatePlanTransactionSection from "@/components/dashboard/pages/transactions/affiliatePlan";


export default function AffiliatePlanTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AffiliatePlanTransactionSection />
                </div>
            </div>
        </>
    );
}