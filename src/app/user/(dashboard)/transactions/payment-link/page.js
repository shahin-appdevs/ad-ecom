// Components
import PaymentLinkTransactionSection from "@/components/dashboard/pages/transactions/paymentLink";


export default function PaymentLinkTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <PaymentLinkTransactionSection />
                </div>
            </div>
        </>
    );
}