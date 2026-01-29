// Components
import BrandCreateSection from "@/components/dashboard/pages/seller/product/brand/brandCreate/brandCreate";

export default function BrandCreate() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <BrandCreateSection />
                </div>
            </div>
        </>
    );
}