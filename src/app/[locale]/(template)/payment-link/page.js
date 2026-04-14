export const dynamic = "force-dynamic";
// Components
import ShareLinkTokenSection from "@/components/dashboard/pages/paymentLink/shareLink/shareLinkToken";
import Loading from "@/components/partials/Loading";
import { Suspense } from "react";

export default function ShareLinkToken() {
    return (
        <>
            <div className="max-w-5xl mx-auto mt-4 md:mt-6 lg:mt-8">
                <Suspense fallback={<div><Loading/></div>}>
                    <ShareLinkTokenSection />
                </Suspense>
            </div>
        </>
    );
}
