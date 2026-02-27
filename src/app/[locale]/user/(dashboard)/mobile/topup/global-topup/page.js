// Components
import MobileTopupAutomaticSection from "@/components/dashboard/pages/mobileTopup/automatic/automatic";


export default function MobileTopupAutomatic() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MobileTopupAutomaticSection />
                </div>
            </div>
        </>
    );
}