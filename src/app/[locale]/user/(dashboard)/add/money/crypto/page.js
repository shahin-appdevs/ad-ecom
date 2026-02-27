// Components
import AddMoneyCryptoSection from "@/components/dashboard/pages/addMoney/crypto/crypto";


export default function AddMoneyCrypto() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AddMoneyCryptoSection />
                </div>
            </div>
        </>
    );
}