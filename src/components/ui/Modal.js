import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

const Modal = ({ open, onClose, title, description, children, className }) => {
    return (
        <>
            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    {/* Modal wrapper */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel
                                    className={` ${className} w-full max-w-5xl rounded-2xl bg-white shadow-xl  relative`}
                                >
                                    {/* Header */}
                                    {title && (
                                        <>
                                            <div className="flex items-center justify-between p-4 md:p-6">
                                                <div>
                                                    <Dialog.Title className="text-lg font-semibold">
                                                        {title}
                                                    </Dialog.Title>
                                                    {description && (
                                                        <p className="text-sm text-gray-500">
                                                            {description}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={onClose}
                                                    className="p-2 rounded-lg hover:bg-gray-100"
                                                >
                                                    <X />
                                                </button>
                                            </div>
                                            <div className="border-b  border-black/10"></div>
                                        </>
                                    )}

                                    <div className="p-4 md:p-5 ">
                                        {children}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default Modal;
