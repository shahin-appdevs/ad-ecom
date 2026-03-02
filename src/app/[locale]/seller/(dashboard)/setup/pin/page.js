// Components
import SetupPinSection from "@/components/dashboard/pages/seller/setupPin/setupPin";


export default function SetupPin() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <SetupPinSection />
                </div>
            </div>
        </>
    );
}