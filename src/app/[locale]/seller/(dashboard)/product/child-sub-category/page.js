// Components
import ChildSubCategorySection from "@/components/dashboard/pages/seller/product/childSubCategory/childSubCategory";

export default function ChildSubCategory() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ChildSubCategorySection />
                </div>
            </div>
        </>
    );
}