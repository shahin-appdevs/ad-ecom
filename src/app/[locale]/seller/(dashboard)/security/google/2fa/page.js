// Components
import TwoFactorSection from "@/components/dashboard/pages/seller/twoFactor/twoFactor";


export default function TwoFactor() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <TwoFactorSection />
                </div>
            </div>
        </>
    );
}