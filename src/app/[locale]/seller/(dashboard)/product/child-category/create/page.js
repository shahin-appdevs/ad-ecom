// Components
import ChildCategoryCreateSection from "@/components/dashboard/pages/seller/product/childCategory/childCategoryCreate/childCategoryCreate";

export default function ChildCategoryCreate() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ChildCategoryCreateSection />
                </div>
            </div>
        </>
    );
}