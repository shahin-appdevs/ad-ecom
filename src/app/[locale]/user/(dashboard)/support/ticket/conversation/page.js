// Components
import ConversationSection from "@/components/dashboard/pages/supportTicket/conversation/conversation";


export default function Conversation() {
    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <div className="xl:col-span-4 col-span-4 space-y-4">
                    <ConversationSection />
                </div>
            </div>
        </>
    );
}