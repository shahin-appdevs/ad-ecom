"use client";
import Image from "next/image";
import { useState, useEffect, Fragment } from "react";
import QRCode from "react-qr-code";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import {
    google2faGetAPI,
    submitGoogle2faAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";

// Images
import authenticator from "@public/images/security/authenticator.png";

export default function TwoFactorSection() {
    const [copied, setCopied] = useState(false);
    const [qrSecrete, setQrSecrete] = useState(""); // manual key
    const [qrCode, setQrCode] = useState(""); // full otpauth URL
    const [loading, setLoading] = useState(true);
    const [isGoogle2faModalOpen, setIsGoogle2faModalOpen] = useState(false);
    const [qrStatus, setQrStatus] = useState(0);
    const [isUpdated, setIsUpdated] = useState(false);

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
                const response = await google2faGetAPI();
                const { qr_secrete, qr_code, qr_status } =
                    response.data?.data || {};

                let fullOtpAuthURL = "";
                try {
                    // qr_code looks like: https://qrcode.tec-it.com/API/QRCode?data=otpauth://totp/...&issuer=...
                    const qrURL = new URL(qr_code);
                    const dataParam = qrURL.searchParams.get("data"); // this IS the full otpauth://...
                    fullOtpAuthURL = dataParam;
                } catch (err) {
                    console.error("Failed to parse secret:", err);
                }

                setQrSecrete(qr_secrete);
                setQrCode(fullOtpAuthURL);
                setQrStatus(qr_status);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message?.error?.[0] ||
                        "Something went wrong",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchGoogle2fa();
    }, [isUpdated]);

    const handleSubmit2FA = async () => {
        setLoading(true);
        try {
            const response = await submitGoogle2faAPI();
            if (response?.data) {
                toast.success("2FA enabled successfully!");
                setIsGoogle2faModalOpen(false);
                setIsUpdated(!isUpdated);
            } else {
                toast.error(response.data?.message || "Failed to enable 2FA");
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message?.error?.[0] ||
                    "Something went wrong",
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
                        className={
                            loading ? "opacity-0 pointer-events-none" : ""
                        }
                    >
                        <div className="mb-4">
                            <label className="font-medium block mb-2">
                                Two Factor Authenticator{" "}
                                {qrStatus === 1 && (
                                    <span className="text-green-500 px-2 inline-block py-[2px] rounded-full bg-green-50 border border-green-500 ms-2 text-xs">
                                        Enabled
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={qrSecrete}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                            {/* ✅ Full otpauth URL is used here */}
                            <QRCode value={qrCode} size={140} />
                        </div>

                        {qrStatus === 1 ? (
                            <Button
                                title="Disable"
                                // variant="secondary"
                                size="md"
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-neutral-800"
                                onClick={() => setIsGoogle2faModalOpen(true)}
                            />
                        ) : (
                            <Button
                                title="Enable"
                                variant="primary"
                                size="md"
                                className="w-full"
                                onClick={() => setIsGoogle2faModalOpen(true)}
                            />
                        )}
                    </form>
                </div>

                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-6">
                    <h5 className="mb-2">Download Google Authenticator App</h5>
                    <p className="font-medium">
                        Google Authenticator is a product-based authenticator by
                        Google that executes two-step verification services.
                    </p>
                    <div className="flex justify-center bg-white p-4 shadow-primary__shadow my-6">
                        <Image
                            src={authenticator}
                            width={140}
                            priority={true}
                            quality={50}
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
                <Dialog
                    as="div"
                    className="relative z-50"
                    onClose={() => setIsGoogle2faModalOpen(false)}
                >
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
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Confirm Two Factor
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        {qrStatus ? (
                                            <p>
                                                Are you sure you want to disable
                                                2-factor authentication (Powered
                                                by Google)?
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to enable
                                                2-factor authentication (Powered
                                                by Google)?
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setIsGoogle2faModalOpen(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                        {qrStatus ? (
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md bg-primary__color px-4 py-2 text-sm font-medium  bg-yellow-500 hover:bg-yellow-400 text-neutral-800"
                                                onClick={handleSubmit2FA}
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? "Disabling..."
                                                    : "Disable"}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md bg-primary__color px-4 py-2 text-sm font-medium text-white"
                                                onClick={handleSubmit2FA}
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? "Enabling..."
                                                    : "Enable"}
                                            </button>
                                        )}
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
