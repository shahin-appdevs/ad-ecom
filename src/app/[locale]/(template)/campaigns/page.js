export const dynamic = "force-dynamic";
// Components
import CampaignSection from "@/components/pages/campaign/campaign";
import { Suspense } from "react";

export default function CampaignPage() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <CampaignSection />
            </Suspense>
        </>
    );
}
