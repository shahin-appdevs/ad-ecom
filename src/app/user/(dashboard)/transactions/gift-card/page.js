// Components
import BillPayTransactionSection from "@/components/dashboard/pages/transactions/billPay";
import MyGiftCardsLogs from "@/components/dashboard/pages/transactions/giftCard";

export default function GiftCardTransactionPage() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <MyGiftCardsLogs />
                </div>
            </div>
        </>
    );
}
