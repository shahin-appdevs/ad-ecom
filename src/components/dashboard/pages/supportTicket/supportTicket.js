import Link from "next/link";
import {
    PlusIcon,
    ComputerDesktopIcon
} from "@heroicons/react/24/outline";

export default function SupportTicketSection() {
    const supportTicket = [
        {
            ticketId: "#AM11979613",
            name: "Selina gomez",
            email: "selinagomez@gmail.com",
            subject: "For Customization",
            status: "Active",
            time: "25-04-25 01:48:42 AM",
            action: ComputerDesktopIcon,
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-800";
            case "Canceled":
                return "bg-red-100 text-red-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Active":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">Support Tickets</h2>
                <Link href="/support/ticket/create" className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition">
                    <PlusIcon className="h-5 w-5" />
                    Add New
                </Link>
            </div>
            <div className="table-wrapper overflow-x-auto">
                <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                            <th className="py-4 px-5 font-semibold">Ticket ID</th>
                            <th className="py-4 px-5 font-semibold">Full Name</th>
                            <th className="py-4 px-5 font-semibold">Email</th>
                            <th className="py-4 px-5 font-semibold">Subject</th>
                            <th className="py-4 px-5 font-semibold">status</th>
                            <th className="py-4 px-5 font-semibold">Last Replied</th>
                            <th className="py-4 px-5 font-semibold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                        {supportTicket.map((supportTicket, index) => (
                            <tr key={index}>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{supportTicket.ticketId}</td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{supportTicket.name}</td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{supportTicket.email}</td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{supportTicket.subject}</td>
                                <td className="py-3.5 px-5 whitespace-nowrap">
                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(supportTicket.status)}`}>
                                        {supportTicket.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{supportTicket.time}</td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium flex gap-4">
                                    <Link href="/support/ticket/conversation"><supportTicket.action className="h-5 w-5 text-gray-600 cursor-pointer" /></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}