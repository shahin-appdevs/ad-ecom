// Components
import ProductEditSection from "@/components/dashboard/pages/seller/product/productEdit/productEdit";

export default function ProductEdit() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ProductEditSection />
                </div>
            </div>
        </>
    );
}