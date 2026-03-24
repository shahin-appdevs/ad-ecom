// Components
import OtpSection from "@/components/pages/auth/otp";
import { Suspense } from "react";

export default function OtpPage() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <OtpSection />
            </Suspense>
        </>
    );
}
