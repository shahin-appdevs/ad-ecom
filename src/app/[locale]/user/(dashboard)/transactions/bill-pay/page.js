// Components
import BillPayTransactionSection from "@/components/dashboard/pages/transactions/billPay";


export default function BillPayTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <BillPayTransactionSection />
                </div>
            </div>
        </>
    );
}