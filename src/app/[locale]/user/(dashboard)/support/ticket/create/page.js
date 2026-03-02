// Components
import CreateTicketSection from "@/components/dashboard/pages/supportTicket/createTicket/createTicket";


export default function CreateTicket() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <CreateTicketSection />
                </div>
            </div>
        </>
    );
}