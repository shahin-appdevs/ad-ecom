export const dynamic = "force-dynamic";
// Components
import BrandSection from "@/components/pages/brand/brand";
import Loading from "@/components/partials/Loading";
import { Suspense } from "react";

export default function BrandPage() {
    return (
        <>
            <Suspense fallback={<Loading/>}>
                <BrandSection />
            </Suspense>
        </>
    );
}
