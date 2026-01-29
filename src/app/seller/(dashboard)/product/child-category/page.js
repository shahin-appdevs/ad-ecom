// Components
import ChildCategorySection from "@/components/dashboard/pages/seller/product/childCategory/childCategory";

export default function ChildCategory() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ChildCategorySection />
                </div>
            </div>
        </>
    );
}