// Components
import ChildCategoryDetailsSection from "@/components/dashboard/pages/seller/product/childCategory/childCategoryDetails/childCategoryDetails";

export default function ChildCategoryDetails() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ChildCategoryDetailsSection />
                </div>
            </div>
        </>
    );
}