'use client';
import Image from "next/image";
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import Button from "@/components/utility/Button";
import { google2faGetSellerAPI, submitGoogle2faSellerAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// Images
import authenticator from "@public/images/security/authenticator.png";
  
export default function ReceiveMoneySection() {
    const [copied, setCopied] = useState(false);
    const [qrSecrete, setQrSecrete] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [isGoogle2faModalOpen, setIsGoogle2faModalOpen] = useState(false);

    const handleCopy = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(qrSecrete);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        const fetchGoogle2fa = async () => {
            setLoading(true);
            try {
                const response = await google2faGetSellerAPI();
                const { qr_secrete, qr_code } = response.data?.data || {};

                let extractedSecret = "";
                try {
                    const qrURL = new URL(qr_code);
                    const dataParam = qrURL.searchParams.get("data");
                    const dataURL = new URL(dataParam);
                    extractedSecret = dataURL.searchParams.get("secret");
                } catch (err) {
                    console.error("Failed to parse secret:", err);
                }

                setQrSecrete(qr_secrete);
                setQrCode(extractedSecret);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message?.error?.[0] || "Something went wrong",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchGoogle2fa();
    }, []);

    const handleSubmit2FA = async () => {
        setLoading(true);
        try {
            const response = await submitGoogle2faSellerAPI()
            
            if (response.data?.success) {
                toast.success("2FA enabled successfully!");
                setIsGoogle2faModalOpen(false);
            } else {
                toast.error(response.data?.message || "Failed to enable 2FA");
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message?.error?.[0] || "Something went wrong",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white relative rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-6">
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
                            <label className="font-medium block mb-2">Two Factor Authenticator</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={qrSecrete}
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
                            title="Enable"
                            variant="primary"
                            size="md"
                            className="w-full"
                            onClick={() => setIsGoogle2faModalOpen(true)}
                        />
                    </form>
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-6">
                    <h5 className="mb-2">Download Google Authenticator App</h5>
                    <p className="font-medium">Google Authenticator is a product based authenticator by Google that executes two-venture confirmation administrations for verifying clients of any programming applications.</p>
                    <div className="flex justify-center bg-white p-4 shadow-primary__shadow my-6">
                        <Image
                            src={authenticator}
                            width={140}
                            priority={true}
                            quality={50}
                            className=""
                            alt="Google Authenticator"
                        />
                    </div>
                    <Button
                        href="https://play.google.com/store/apps"
                        title="Download App"
                        variant="primary"
                        size="md"
                        className="w-full"
                    />
                </div>
            </div>
            <Transition appear show={isGoogle2faModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsGoogle2faModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Confirm Two Factor
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">Are you sure to Enable 2 factor authentication (Powered by google)?</p>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsGoogle2faModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md bg-primary__color px-4 py-2 text-sm font-medium text-white"
                                            onClick={handleSubmit2FA}
                                            disabled={loading}
                                        >
                                            {loading ? 'Enabling...' : 'Enable'}
                                        </button>
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