"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function WithdrawSuccessModal({ isOpen, onClose }) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-2"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-2"
                    >
                        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                            {/* Icon */}
                            <div className="flex justify-center">
                                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                            </div>

                            {/* Title */}
                            <Dialog.Title className="mt-4 text-center text-lg font-semibold text-gray-900">
                                Withdrawal Submitted
                            </Dialog.Title>

                            {/* Message */}
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Your withdrawal request has been submitted
                                successfully. Please wait for{" "}
                                <span className="font-medium">
                                    admin approval
                                </span>
                                .
                            </p>

                            {/* Button */}
                            <div className="mt-6">
                                <button
                                    onClick={onClose}
                                    className="w-full rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Okay
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
