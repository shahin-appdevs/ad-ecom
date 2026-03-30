export const dynamic = "force-dynamic";
// Components
import ProductDetailsSection from "@/components/pages/product/productDetails";
import RelatedProductSection from "@/components/pages/product/relatedProduct";

export default async function ProductDetailsPage() {
    return (
        <>
            <ProductDetailsSection />
            <RelatedProductSection />
        </>
    );
}
