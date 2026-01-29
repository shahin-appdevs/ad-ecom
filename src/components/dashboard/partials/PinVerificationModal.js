"use client";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { VerifyPinAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import Button from "@/components/utility/Button";

export default function PinVerificationModal({ isOpen, onClose, onVerify }) {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPin("");
        }
    }, [isOpen]);

    const handleVerify = async () => {
        setLoading(true);
        try {
            const response = await VerifyPinAPI(pin);
            if (response?.data?.data?.match_status) {
                toast.success(response?.data?.message?.success?.[0]);
                onVerify();
                onClose();
            } else {
                toast.error(
                    response?.data?.message?.error?.[0] || "Invalid PIN",
                );
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message?.error?.[0] ||
                "PIN verification failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            as="div"
            className="fixed inset-0 z-50 overflow-y-auto"
        >
            <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-black bg-opacity-50" />

                <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">
                        Verify PIN
                    </Dialog.Title>

                    <Dialog.Description className="sr-only">
                        Enter your 4-digit PIN to verify your identity
                    </Dialog.Description>

                    <div className="mb-4">
                        <label
                            htmlFor="pin-input"
                            className="block text-sm font-medium mb-2"
                        >
                            Enter your 4-digit PIN
                        </label>
                        <input
                            id="pin-input"
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.slice(0, 4))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="••••"
                            maxLength={4}
                            autoFocus
                            aria-describedby="pin-help"
                        />
                        <p id="pin-help" className="sr-only">
                            Four digit numeric PIN
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            title="Cancel"
                            variant="secondary"
                            size="md"
                            onClick={onClose}
                            disabled={loading}
                            className="hover:bg-red-600"
                        />
                        <Button
                            type="button"
                            title={loading ? "Verifying..." : "Verify"}
                            variant="primary"
                            size="md"
                            onClick={handleVerify}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
