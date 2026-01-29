'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentLinkListAPI, paymentLinkStatusAPI } from "@root/services/apiClient/apiClient";
import { Dialog } from '@headlessui/react';
import Link from "next/link";
import { PlusIcon, ClipboardIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

function SkeletonRow() {
    return (
        <tr>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
        </tr>
    );
}

export default function PaymentLinksSection() {
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const [paymentLinks, setPaymentLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLinkId, setSelectedLinkId] = useState(null);
    const [modalAction, setModalAction] = useState('close');
    const router = useRouter();

    const toggleDropdown = (index) => {
        setDropdownIndex(prevIndex => prevIndex === index ? null : index);
    };

    useEffect(() => {
        const fetchPaymentLinks = async () => {
            try {
                setLoading(true);
                const response = await paymentLinkListAPI();
                if (response.data.data && response.data.data.payment_links) {
                    setPaymentLinks(response.data.data.payment_links);
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message?.error?.[0];
                toast.error(errorMessage);
                if (errorMessage === "Kindly complete your PIN setup before proceeding.") {
                    router.push("/user/setup/pin");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentLinks();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "Closed":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "active":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const getAmountDisplay = (link) => {
        if (link.type === 'pay') {
            if (link.min_amount && link.max_amount) {
                return `${link.min_amount} - ${link.max_amount} ${link.currency}`;
            } else if (link.min_amount) {
                return `Min ${link.min_amount} ${link.currency}`;
            } else if (link.max_amount) {
                return `Max ${link.max_amount} ${link.currency}`;
            }
            return `Unlimited ${link.currency}`;
        }
        return `${link.price} ${link.currency}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleEditClick = (linkId) => {
        router.push(`/user/payment/link/edit?id=${linkId}`);
    };

    const handleCloseClick = (linkId) => {
        setSelectedLinkId(linkId);
        setModalAction('close');
        setIsModalOpen(true);
        setDropdownIndex(null);
    };

    const handleActivateClick = (linkId) => {
        setSelectedLinkId(linkId);
        setModalAction('activate');
        setIsModalOpen(true);
        setDropdownIndex(null);
    };

    const handleConfirmAction = async () => {
        if (!selectedLinkId) return;
        
        try {
            const response = await paymentLinkStatusAPI(selectedLinkId);
            toast.success(response?.data?.message?.success?.[0]);
            setPaymentLinks(prevLinks => 
                    prevLinks.map(link => 
                        link.id === selectedLinkId 
                            ? { 
                                ...link, 
                                string_status: modalAction === 'activate' ? 'active' : 'Closed' 
                              } 
                            : link
                    )
                );
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || 
                      error.response?.data?.message || 
                      `Failed to ${modalAction} payment link`);
        } finally {
            setIsModalOpen(false);
            setSelectedLinkId(null);
        }
    };

    const handleCancelAction = () => {
        setIsModalOpen(false);
        setSelectedLinkId(null);
    };

    return (
        <>
            <div className="bg-white rounded-[12px] p-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                    <h2 className="text-[16px] font-semibold">Payment Links Logs</h2>
                    <Link href="/user/payment/link/create" className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition">
                        <PlusIcon className="h-5 w-5" />
                        Create Link
                    </Link>
                </div>
                {loading ? (
                    <div className="table-wrapper overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                            <thead>
                                <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                    <th className="py-4 px-5 font-semibold">Title</th>
                                    <th className="py-4 px-5 font-semibold">Type</th>
                                    <th className="py-4 px-5 font-semibold">Amount</th>
                                    <th className="py-4 px-5 font-semibold">Status</th>
                                    <th className="py-4 px-5 font-semibold">Created At</th>
                                    <th className="py-4 px-5 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                {[...Array(2)].map((_, index) => (
                                    <SkeletonRow key={index} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : paymentLinks.length === 0 ? (
                    <div className="text-center py-5">No payment link found</div>
                ) : (
                    <div className="table-wrapper overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                            <thead>
                                <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                    <th className="py-4 px-5 font-semibold">Title</th>
                                    <th className="py-4 px-5 font-semibold">Type</th>
                                    <th className="py-4 px-5 font-semibold">Amount</th>
                                    <th className="py-4 px-5 font-semibold">Status</th>
                                    <th className="py-4 px-5 font-semibold">Created At</th>
                                    <th className="py-4 px-5 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                {paymentLinks.map((link, index) => (
                                    <tr key={link.id}>
                                        <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{link.title}</td>
                                        <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                            {link.type === 'pay' ? 'Customers choose what to pay' : 'Products Or Subscriptions'}
                                        </td>
                                        <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                            {getAmountDisplay(link)}
                                        </td>
                                        <td className="py-3.5 px-5 whitespace-nowrap">
                                            <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(link.string_status)}`}>
                                                {link.string_status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                            {formatDate(link.created_at)}
                                        </td>
                                        <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                            <div className="relative flex gap-4" ref={dropdownRef}>
                                                <button onClick={() => copyToClipboard(link.shareLinkApi)}>
                                                    <ClipboardIcon className="h-5 w-5 text-gray-600 cursor-pointer" />
                                                </button>
                                                <button onClick={() => toggleDropdown(index)}>
                                                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-600 cursor-pointer" />
                                                </button>
                                                {dropdownIndex === index && (
                                                    <div className="absolute right-0 top-[-52px] z-10 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-md text-sm">
                                                        <button 
                                                            onClick={() => handleEditClick(link.id)}
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        {link.string_status === 'Closed' ? (
                                                            <button 
                                                                onClick={() => handleActivateClick(link.id)}
                                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                            >
                                                                Activate
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleCloseClick(link.id)}
                                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                            >
                                                                Close
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <Dialog open={isModalOpen} onClose={handleCancelAction} className="relative z-50">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6">
                            <Dialog.Title className="text-lg font-medium mb-4">
                                Confirm Status Change
                            </Dialog.Title>
                            <Dialog.Description className="mb-6">
                                {modalAction === 'activate' 
                                    ? 'Are you sure you want to activate this payment link?'
                                    : 'Are you sure you want to close this payment link?'}
                            </Dialog.Description>
                            
                            <div className="flex justify-end gap-3">
                                <button 
                                    onClick={handleCancelAction}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmAction}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                                        modalAction === 'activate' 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {modalAction === 'activate' ? 'Activate' : 'Close Link'}
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </>
    );
}