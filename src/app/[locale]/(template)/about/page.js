export const dynamic = "force-dynamic";
// Components
import AboutSection from "@/components/pages/about/about";
import { Suspense } from "react";

export default function AboutPage() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <AboutSection />
            </Suspense>
        </>
    );
}
