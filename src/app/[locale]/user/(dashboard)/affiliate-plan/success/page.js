// Components
import AffiliatePlanSuccessSection from "@/components/dashboard/pages/affiliatePlan/affiliatePlanSuccess";


export default function AffiliatePlanSuccess() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AffiliatePlanSuccessSection />
                </div>
            </div>
        </>
    );
}