// Components
import ShareLinkSection from "@/components/dashboard/pages/paymentLink/shareLink/shareLink";


export default function ShareLink() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ShareLinkSection />
                </div>
            </div>
        </>
    );
}