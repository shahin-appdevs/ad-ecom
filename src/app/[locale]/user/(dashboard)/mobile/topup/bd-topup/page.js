// Components
import MobileTopupManualSection from "@/components/dashboard/pages/mobileTopup/manual/manual";


export default function MobileTopupManual() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MobileTopupManualSection />
                </div>
            </div>
        </>
    );
}