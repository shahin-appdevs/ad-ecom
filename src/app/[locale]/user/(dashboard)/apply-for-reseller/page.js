// Components
import ApplyResellerSection from "@/components/dashboard/pages/applyReseller/applyReseller";


export default function ApplyReseller() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ApplyResellerSection />
                </div>
            </div>
        </>
    );
}