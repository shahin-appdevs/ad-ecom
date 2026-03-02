// Components
import ShareLinkTokenSection from "@/components/dashboard/pages/paymentLink/shareLink/shareLinkToken";


export default function ShareLinkToken() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ShareLinkTokenSection />
                </div>
            </div>
        </>
    );
}