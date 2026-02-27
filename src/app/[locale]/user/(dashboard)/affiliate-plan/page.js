// Components
import AffiliatePlanSection from "@/components/dashboard/pages/affiliatePlan/affiliatePlan";


export default function AffiliatePlan() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AffiliatePlanSection />
                </div>
            </div>
        </>
    );
}