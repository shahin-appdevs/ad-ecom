// Components
import ProductCreateSection from "@/components/dashboard/pages/seller/product/productCreate/productCreate";

export default function ProductCreate() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ProductCreateSection />
                </div>
            </div>
        </>
    );
}