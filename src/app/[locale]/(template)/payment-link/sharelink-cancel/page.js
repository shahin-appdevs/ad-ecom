export const dynamic = "force-dynamic";
// Components
import ShareLinkCancelSection from "@/components/dashboard/pages/paymentLink/shareLink/shareLinkCancel";
import Loading from "@/components/partials/Loading";
import { Suspense } from "react";

export default function ShareLinkCancelPage() {
    return (
        <section className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <Suspense fallback={<div><Loading/></div>}>
                <ShareLinkCancelSection />
            </Suspense>
        </section>
    );
}
