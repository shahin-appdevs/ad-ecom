// Components
import SendMoneyTransactionSection from "@/components/dashboard/pages/transactions/sendMoney";


export default function SendMoneyTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <SendMoneyTransactionSection />
                </div>
            </div>
        </>
    );
}