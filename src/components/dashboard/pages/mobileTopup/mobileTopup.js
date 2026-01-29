"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";

const topupTypes = [
    { id: 1, name: "BD TopUp" },
    { id: 2, name: "Global" },
];

export default function MobileTopupSection() {
    const [selectedTopupType, setSelectedTopupType] = useState(topupTypes[0]);
    const router = useRouter();

    const handleContinue = (e) => {
        e.preventDefault();
        if (selectedTopupType.id === 1) {
            router.push("/user/mobile/topup/bd-topup");
        } else {
            router.push("/user/mobile/topup/global-topup");
        }
    };

    return (
        <div className="bg-white rounded-[12px] p-7 col-span-7">
            <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">
                            Top Up Type
                        </label>
                        <Listbox
                            value={selectedTopupType}
                            onChange={setSelectedTopupType}
                        >
                            <div className="relative">
                                <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                    {selectedTopupType.name}
                                    <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10">
                                    {topupTypes.map((topup) => (
                                        <Listbox.Option
                                            key={topup.id}
                                            value={topup}
                                            className={({ active }) =>
                                                `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                            }
                                        >
                                            {({ selected }) => (
                                                <span className="flex justify-between">
                                                    {topup.name}
                                                    {selected && (
                                                        <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                    )}
                                                </span>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>
                </div>
                <Button
                    title="Continue"
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleContinue}
                />
            </form>
        </div>
    );
}
