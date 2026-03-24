export const dynamic = "force-dynamic";
// Components
import NewProductSection from "@/components/pages/product/newProduct";
import { Suspense } from "react";

export default function NewProductPage() {
    return (
        <>
            <Suspense fallback={<div>Loading...</div>}>
                <NewProductSection />
            </Suspense>
        </>
    );
}
