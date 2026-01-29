"use client";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import QRCode from "react-qr-code";
import {
    ClipboardIcon,
    CheckIcon,
    CogIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import { receiveMoneyGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

export default function ReceiveMoneySection() {
    const [copied, setCopied] = useState(false);
    const [uniqueCode, setUniqueCode] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCopy = (e) => {
        e.preventDefault();
        if (uniqueCode) {
            navigator.clipboard.writeText(uniqueCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const fetchQrAddress = async () => {
            setLoading(true);
            try {
                const response = await receiveMoneyGetAPI();
                const { uniqueCode, qrCode } = response.data?.data || {};
                let extractedCode = uniqueCode;
                if (qrCode) {
                    const match = qrCode.match(/data=(.*)$/);
                    if (match && match[1]) {
                        extractedCode = decodeURIComponent(match[1]);
                    }
                }
                setUniqueCode(uniqueCode);
                setQrCode(extractedCode);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message?.error?.[0] || "Something went wrong",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchQrAddress();
    }, []);

    return (
        <>
            <div className="bg-white rounded-[12px] p-7 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 z-10 rounded-[12px] p-7 animate-pulse space-y-6">
                        <div className="mb-4">
                            <label className="block mb-2 h-4 w-24 bg-gray-200 rounded" />
                            <div className="relative">
                                <div className="w-full h-10 bg-gray-200 rounded-md" />
                            </div>
                        </div>
                        <div className="flex justify-center p-4 shadow-primary__shadow my-6 bg-gray-100 rounded-md">
                            <div className="w-[140px] h-[140px] bg-gray-300 rounded-md" />
                        </div>
                        <div className="w-full h-10 bg-gray-200 rounded-md" />
                    </div>
                )}
                <form
                    className={loading ? "opacity-0 pointer-events-none" : ""}
                >
                    <div className="mb-4">
                        <label className="font-medium block mb-2">
                            QR Address
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                readOnly
                                value={uniqueCode}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            <button
                                onClick={handleCopy}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black"
                            >
                                {copied ? (
                                    <CheckIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                    <ClipboardIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center bg-white p-4 shadow-primary__shadow my-6">
                        <QRCode value={qrCode} size={140} />
                    </div>
                    <Button
                        title="Share"
                        variant="primary"
                        size="md"
                        className="w-full"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsModalOpen(true);
                        }}
                    />
                </form>
            </div>
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setIsModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all relative">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-black"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Share via
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`Send money to this QR Address: ${uniqueCode}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm inline-block"
                                        >
                                            Share on WhatsApp
                                        </a>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
