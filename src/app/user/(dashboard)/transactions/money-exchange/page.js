// Components
import MoneyExchangeTransactionSection from "@/components/dashboard/pages/transactions/moneyExchange";


export default function MoneyExchangeTransaction() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MoneyExchangeTransactionSection />
                </div>
            </div>
        </>
    );
}