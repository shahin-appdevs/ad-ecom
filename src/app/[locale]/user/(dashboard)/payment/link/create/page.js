// Components
import CreateLinkSection from "@/components/dashboard/pages/paymentLink/createLink/createLink";


export default function CreateLink() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <CreateLinkSection />
                </div>
            </div>
        </>
    );
}