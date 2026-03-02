// Components
import MobileTopupTransactionSection from "@/components/dashboard/pages/transactions/mobileTopup";


export default function MobileTopupTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MobileTopupTransactionSection />
                </div>
            </div>
        </>
    );
}