// Components
import AddSection from "@/components/dashboard/pages/recipient/add/add";


export default function AddRecipient() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <AddSection />
                </div>
            </div>
        </>
    );
}