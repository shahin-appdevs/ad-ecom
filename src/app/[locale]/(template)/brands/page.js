export const dynamic = "force-dynamic";
// Components
import BrandSection from "@/components/pages/brand/brand";
import { Suspense } from "react";

export default function BrandPage() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <BrandSection />
            </Suspense>
        </>
    );
}
