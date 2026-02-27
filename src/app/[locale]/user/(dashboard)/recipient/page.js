// Components
import RecipientSection from "@/components/dashboard/pages/recipient/recipient";


export default function Recipient() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <RecipientSection />
                </div>
            </div>
        </>
    );
}