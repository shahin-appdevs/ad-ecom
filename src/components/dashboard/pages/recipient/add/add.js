'use client';
import { useState } from "react";
import { Listbox } from '@headlessui/react';
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Button from "@/components/utility/Button";

const transactionTypes = [
    { name: 'Select Transaction Type', value: '' },
    { name: 'Bank Transfer', value: 'bank' },
    { name: 'Wallet Transfer', value: 'wallet' },
    { name: 'Cash Pickup', value: 'cash' },
];

const countries = [
    { name: 'Select Country', value: '' },
    { name: 'United States', value: 'US' },
    { name: 'United Kingdom', value: 'UK' },
    { name: 'India', value: 'IN' },
    { name: 'Canada', value: 'CA' },
];

const banks = [
    { name: 'Select Bank', value: '' },
    { name: 'Bank of America', value: 'boa' },
    { name: 'HSBC', value: 'hsbc' },
    { name: 'HDFC Bank', value: 'hdfc' },
    { name: 'Royal Bank of Canada', value: 'rbc' },
];

const points = [
    { name: 'Select Points', value: '' },
    { name: 'Bank of America', value: 'boa' },
    { name: 'HSBC', value: 'hsbc' },
    { name: 'HDFC Bank', value: 'hdfc' },
    { name: 'Royal Bank of Canada', value: 'rbc' },
];

export default function AddRecipientSection() {
    const [selectedTransaction, setSelectedTransaction] = useState(transactionTypes[0]);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [selectedBank, setSelectedBank] = useState(banks[0]);
    const [selectedPoint, setSelectedPoint] = useState(points[0]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        state: '',
        city: '',
        zipCode: '',
        phone: '',
        email: '',
        accountNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const renderListbox = (label, selected, setSelected, options) => (
        <div>
            <label className="block text-sm font-medium mb-2">{label}</label>
            <Listbox value={selected} onChange={setSelected}>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-3 pl-4 pr-10 text-left text-sm shadow-sm focus:outline-none">
                        <span className="block truncate">{selected.name}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                        </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        {options.map((option, idx) => (
                            <Listbox.Option
                                key={idx}
                                value={option}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {option.name}
                                        </span>
                                        {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                <CheckIcon className="h-5 w-5" />
                                            </span>
                                        )}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </div>
            </Listbox>
        </div>
    );

    return (
        <div className="bg-white rounded-[12px] p-7">
            <form>
                <div className="mb-5">
                    {renderListbox("Transaction Type", selectedTransaction, setSelectedTransaction, transactionTypes)}
                </div>
                <AnimatePresence>
                    {selectedTransaction.value === 'bank' && (
                        <motion.div
                            key="bank-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                {[
                                    { name: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
                                    { name: 'lastName', label: 'Last Name', placeholder: 'Enter last name' },
                                    { name: 'address', label: 'Address', placeholder: 'Enter address' },
                                    { name: 'state', label: 'State', placeholder: 'Enter state' },
                                    { name: 'city', label: 'City', placeholder: 'Enter city' },
                                    { name: 'zipCode', label: 'Zip Code', placeholder: 'Enter zip code' },
                                    { name: 'phone', label: 'Phone Number', placeholder: 'Enter phone number' },
                                    { name: 'email', label: 'Email Address', placeholder: 'Enter email address' },
                                    { name: 'accountNumber', label: 'Account Number', placeholder: 'Enter account number' },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label htmlFor={field.name} className="block text-sm font-medium mb-2">
                                            {field.label}
                                        </label>
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            onChange={handleChange}
                                            value={formData[field.name]}
                                            className="relative w-full rounded-md border border-gray-300 bg-white py-3 pl-4 pr-10 text-left text-sm shadow-sm focus:outline-none"
                                        />
                                    </div>
                                ))}
                                <div>
                                    {renderListbox("Country", selectedCountry, setSelectedCountry, countries)}
                                </div>
                                <div>
                                    {renderListbox("Bank", selectedBank, setSelectedBank, banks)}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {selectedTransaction.value === 'wallet' && (
                        <motion.div
                            key="wallet-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                {[
                                    { name: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
                                    { name: 'lastName', label: 'Last Name', placeholder: 'Enter last name' },
                                    { name: 'address', label: 'Address', placeholder: 'Enter address' },
                                    { name: 'state', label: 'State', placeholder: 'Enter state' },
                                    { name: 'city', label: 'City', placeholder: 'Enter city' },
                                    { name: 'zipCode', label: 'Zip Code', placeholder: 'Enter zip code' },
                                    { name: 'phone', label: 'Phone Number', placeholder: 'Enter phone number' },
                                    { name: 'email', label: 'Email Address', placeholder: 'Enter email address' },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label htmlFor={field.name} className="block text-sm font-medium mb-2">
                                            {field.label}
                                        </label>
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            onChange={handleChange}
                                            value={formData[field.name]}
                                            className="relative w-full rounded-md border border-gray-300 bg-white py-3 pl-4 pr-10 text-left text-sm shadow-sm focus:outline-none"
                                        />
                                    </div>
                                ))}
                                <div>
                                    {renderListbox("Country", selectedCountry, setSelectedCountry, countries)}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {selectedTransaction.value === 'cash' && (
                        <motion.div
                            key="cash-fields"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                {[
                                    { name: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
                                    { name: 'lastName', label: 'Last Name', placeholder: 'Enter last name' },
                                    { name: 'address', label: 'Address', placeholder: 'Enter address' },
                                    { name: 'state', label: 'State', placeholder: 'Enter state' },
                                    { name: 'city', label: 'City', placeholder: 'Enter city' },
                                    { name: 'zipCode', label: 'Zip Code', placeholder: 'Enter zip code' },
                                    { name: 'phone', label: 'Phone Number', placeholder: 'Enter phone number' },
                                    { name: 'email', label: 'Email Address', placeholder: 'Enter email address' },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label htmlFor={field.name} className="block text-sm font-medium mb-2">
                                            {field.label}
                                        </label>
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            onChange={handleChange}
                                            value={formData[field.name]}
                                            className="relative w-full rounded-md border border-gray-300 bg-white py-3 pl-4 pr-10 text-left text-sm shadow-sm focus:outline-none"
                                        />
                                    </div>
                                ))}
                                <div>
                                    {renderListbox("Country", selectedCountry, setSelectedCountry, countries)}
                                </div>
                                <div>
                                    {renderListbox("Pickup Point", selectedPoint, setSelectedPoint, points)}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Button
                    title="Add Recipient"
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                />
            </form>
        </div>
    );
}