export const dynamic = "force-dynamic";
// Components
import CampaignSection from "@/components/pages/campaign/campaign";
import Loading from "@/components/partials/Loading";
import { Suspense } from "react";

export default function CampaignPage() {
    return (
        <>
            <Suspense fallback={<Loading/>}>
                <CampaignSection />
            </Suspense>
        </>
    );
}
