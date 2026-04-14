export const dynamic = "force-dynamic";
// Components
import NewProductSection from "@/components/pages/product/newProduct";
import Loading from "@/components/partials/Loading";
import { Suspense } from "react";

export default function NewProductPage() {
    return (
        <>
            <Suspense fallback={<Loading/>}>
                <NewProductSection />
            </Suspense>
        </>
    );
}
