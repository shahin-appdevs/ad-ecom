// Components
import MakePaymentTransactionSection from "@/components/dashboard/pages/transactions/makePayment";


export default function MakePaymentTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MakePaymentTransactionSection />
                </div>
            </div>
        </>
    );
}