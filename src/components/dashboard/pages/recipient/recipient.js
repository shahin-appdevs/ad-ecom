"use client";
import { Fragment, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    PlusIcon,
    ComputerDesktopIcon,
    PencilIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";

import userOne from "@public/images/chat/userOne.png";
import userTwo from "@public/images/chat/userTwo.png";
import userThree from "@public/images/chat/userThree.png";

export default function RecipientSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);

    const recipientHistory = [
        {
            userAvatar: userOne,
            user: "Selina gomez",
            email: "selinagomez@gmail.com",
            type: "Bank Transfer",
            sendIcon: ComputerDesktopIcon,
            editIcon: PencilIcon,
            deleteIcon: TrashIcon,
        },
        {
            userAvatar: userTwo,
            user: "Marco sneha",
            email: "marcosneha@gmail.com",
            type: "Wallet Transfer",
            sendIcon: ComputerDesktopIcon,
            editIcon: PencilIcon,
            deleteIcon: TrashIcon,
        },
        {
            userAvatar: userThree,
            user: "Runa jerin",
            email: "runajerin@gmail.com",
            type: "Cash Pickup",
            sendIcon: ComputerDesktopIcon,
            editIcon: PencilIcon,
            deleteIcon: TrashIcon,
        },
    ];

    const openModal = (recipient) => {
        setSelectedRecipient(recipient);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedRecipient(null);
    };

    const handleDelete = () => {
        closeModal();
    };

    const getUserAvatar = (initials) => {
        return (
            <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-800">
                    <Image
                        src={initials}
                        width={24}
                        height={24}
                        alt="Flag"
                        className="w-6 h-6 rounded-full object-cover"
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-white rounded-[12px] p-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                    <h2 className="text-[16px] font-semibold">All Recipients</h2>
                    <Link href="/recipient/add" className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition">
                        <PlusIcon className="h-5 w-5" />
                        Add recipient
                    </Link>
                </div>
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">User</th>
                                <th className="py-4 px-5 font-semibold">Email</th>
                                <th className="py-4 px-5 font-semibold">Type</th>
                                <th className="py-4 px-5 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {recipientHistory.map((recipient, index) => (
                                <tr key={index}>
                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                        <div className="flex gap-2 items-center">
                                            {getUserAvatar(recipient.userAvatar)}
                                            <div className="text-sm font-medium">{recipient.user}</div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{recipient.email}</td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{recipient.type}</td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium flex gap-4">
                                        <Link href="/send/remittance"><recipient.sendIcon className="h-5 w-5 text-gray-600 cursor-pointer" /></Link>
                                        <Link href="/recipient/edit"><recipient.editIcon className="h-5 w-5 text-blue-500 cursor-pointer" /></Link>
                                        <button onClick={() => openModal(recipient)}><recipient.deleteIcon className="h-5 w-5 text-red-500 cursor-pointer" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                                        Delete Recipient
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete{" "}
                                            <strong>{selectedRecipient?.user}</strong> from your recipients?
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                                            onClick={handleDelete}
                                        >
                                            Delete
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