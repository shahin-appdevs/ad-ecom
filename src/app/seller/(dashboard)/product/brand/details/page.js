// Components
import BrandDetailsSection from "@/components/dashboard/pages/seller/product/brand/brandDetails/brandDetails";

export default function CategoryDetails() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <BrandDetailsSection />
                </div>
            </div>
        </>
    );
}