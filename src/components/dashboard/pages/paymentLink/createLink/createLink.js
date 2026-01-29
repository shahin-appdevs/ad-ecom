'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentLinkListAPI, paymentLinkStoreAPI } from "@root/services/apiClient/apiClient";
import { Listbox } from '@headlessui/react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { 
    ChevronUpDownIcon, 
    CheckIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon
} 
from '@heroicons/react/24/outline';
import Button from "@/components/utility/Button";
import Image from 'next/image';
import { toast } from "react-hot-toast";
import PinVerificationModal from '@/components/dashboard/partials/PinVerificationModal';

import logo from "@public/images/logo/favicon.jpeg";
import mockup from "@public/images/payment/mockup.png";

const CreateLinkSkeleton = () => {
    return (
        <div className="bg-white rounded-[12px] p-4 sm:p-6 lg:p-7 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                <div>
                    <div className="h-6 w-1/4 bg-gray-200 rounded mb-6"></div>
                    <div className="h-10 bg-gray-200 rounded-md mb-6"></div>
                    <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-4">
                        <div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-md"></div>
                        </div>
                        <div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-24 bg-gray-200 rounded-md"></div>
                        </div>
                        <div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-32 bg-gray-200 rounded-md"></div>
                        </div>
                        <div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-md"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded-md"></div>
                            </div>
                            <div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                                <div className="h-10 bg-gray-200 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded-md mt-6"></div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
                        <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
                    </div>
                    <div className="relative w-full max-w-[300px] h-[500px] sm:h-[600px] mx-auto">
                        <div className="absolute inset-0 bg-gray-200 rounded-xl"></div>
                        <div className="absolute z-20 top-[70px] left-[18px] right-[18px] bottom-[100px] bg-gray-100 rounded-xl p-4 space-y-4">
                            <div>
                                <div className="h-4 w-1/4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-10 bg-gray-300 rounded-md"></div>
                            </div>
                            <div className="h-24 bg-gray-300 rounded-md mx-auto"></div>
                            <div className="space-y-3">
                                <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                                <div className="h-10 bg-gray-300 rounded-md"></div>
                                <div className="h-10 bg-gray-300 rounded-md"></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-10 bg-gray-300 rounded-md"></div>
                                    <div className="h-10 bg-gray-300 rounded-md"></div>
                                </div>
                                <div className="h-20 bg-gray-300 rounded-md"></div>
                                <div className="h-12 bg-gray-300 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const paymentTypes = [
    { id: 1, name: 'Customers Choose What To Pay', value: 'pay' },
    { id: 2, name: 'Products Or Subscriptions', value: 'product' },
];

export default function CreateLinkSection() {
    const [selectedPaymentType, setSelectedPaymentType] = useState(paymentTypes[0]);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showLimits, setShowLimits] = useState(false);
    const [previewMode, setPreviewMode] = useState("desktop");
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [description, setDescription] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [currencies, setCurrencies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const router = useRouter();
    const [showPinModal, setShowPinModal] = useState(false);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await paymentLinkListAPI();
                const currencyData = response.data.data.currency_data;
                setCurrencies(currencyData);
                
                const defaultCurrency = currencyData.find(c => c.code === 'USD') || currencyData[0];
                if (defaultCurrency) {
                    setSelectedCurrency(defaultCurrency);
                }
            } catch (error) {
                toast.error("Failed to load currencies");
                console.error("Error fetching currencies:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };
        
        fetchCurrencies();
    }, []);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1
    });

    const handleCreateLink = async (e) => {
        setIsLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('currency', selectedCurrency.code);
            formData.append('currency_name', selectedCurrency.name);
            formData.append('currency_symbol', selectedCurrency.symbol);
            formData.append('country', selectedCurrency.country);
            formData.append('type', selectedPaymentType.value);
            formData.append('title', title);
            
            if (selectedPaymentType.value === 'product') {
                formData.append('sub_currency', selectedCurrency.code);
                formData.append('sub_title', subTitle);
                if (price) formData.append('price', price);
                if (quantity) formData.append('qty', quantity);
            } else {
                formData.append('details', description);
                formData.append('limit', showLimits ? 1 : 0);
                if (showLimits) {
                    formData.append('min_amount', minAmount);
                    formData.append('max_amount', maxAmount);
                }
            }
            
            if (file) {
                formData.append('image', file);
            }
            
            const response = await paymentLinkStoreAPI(formData);
            
            if (response.data?.data?.payment_link) {
                toast.success(response?.data?.message?.success?.[0]);
                setTitle("");
                setSubTitle("");
                setDescription("");
                setMinAmount("");
                setMaxAmount("");
                setPrice("");
                setQuantity("");
                setShowLimits(false);
                setPreview(null);
                setFile(null);
                router.push(`/user/payment/link/share?token=${response.data.data.payment_link.token}`);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || "Failed to create payment link");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPinModal(true);
    };

    if (isInitialLoading) {
        return <CreateLinkSkeleton />;
    }

    return (
        <div className="bg-white rounded-[12px] p-4 sm:p-6 lg:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                <form onSubmit={handleSubmit}>
                    <h5 className="font-semibold mb-4">Select Type</h5>
                    <div className="mb-4">
                        <Listbox value={selectedPaymentType} onChange={setSelectedPaymentType}>
                            <div className="relative">
                                <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                    {selectedPaymentType.name}
                                    <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10">
                                    {paymentTypes.map((payment) => (
                                        <Listbox.Option
                                                key={payment.id}
                                                value={payment}
                                                className={({ active }) =>
                                                `cursor-pointer select-none px-4 py-2 text-sm ${active ? 'bg-indigo-100' : ''}`
                                            }
                                        >
                                            {({ selected }) => (
                                                <span className="flex justify-between">
                                                    {payment.name}
                                                    {selected && <CheckIcon className="w-4 h-4 text-indigo-600" />}
                                                </span>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>
                    <div className="border-b border-gray-200 mb-4">
                        <button className="text-primary__color border-b-2 border-primary__color px-2 pb-2 text-sm font-semibold">
                            Payment Page
                        </button>
                    </div>
                    {selectedPaymentType.value === 'product' && (
                        <>
                            <label className="block text-sm font-medium mb-2">Sub Title*</label>
                            <input
                                type="text"
                                placeholder="Product subtitle"
                                className="w-full border rounded-md p-2 mb-4 text-sm focus:outline-none"
                                value={subTitle}
                                onChange={(e) => setSubTitle(e.target.value)}
                                maxLength={180}
                            />

                            <label className="block text-sm font-medium mb-2">Currency</label>
                            <div className="mb-4">
                                {selectedCurrency && (
                                    <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
                                        <div className="relative">
                                            <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                                <span>{selectedCurrency.name}</span>
                                                <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute right-0 mt-1 w-full max-h-[100px] overflow-auto bg-white border border-gray-200 rounded shadow-md z-20">
                                                {currencies.map((currency) => (
                                                    <Listbox.Option
                                                        key={currency.id}
                                                        value={currency}
                                                        className={({ active }) =>
                                                            `cursor-pointer px-3 py-1.5 text-sm ${active ? 'bg-indigo-100' : ''}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="flex justify-between">
                                                                <span>{currency.name}</span>
                                                                {selected && <CheckIcon className="w-4 h-4 text-indigo-600" />}
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                )}
                            </div>
                            
                            <label className="block text-sm font-medium mb-2">Price (Optional)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full border rounded-md p-2 mb-4 text-sm focus:outline-none"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                            
                            <label className="block text-sm font-medium mb-2">Quantity (Optional)</label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full border rounded-md p-2 mb-4 text-sm focus:outline-none"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="0"
                                step="1"
                            />
                        </>
                    )}
                    {selectedPaymentType.value === 'pay' && (
                        <>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                placeholder="Name of cause or service"
                                className="w-full border rounded-md p-2 mb-4 text-sm focus:outline-none"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={180}
                            />
                            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                            <textarea
                                placeholder="Give customers more detail about what they're paying for."
                                rows={4}
                                className="w-full border rounded-md p-2 mb-2 text-sm focus:outline-none resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <label className="block text-sm font-medium mb-2">Image</label>
                            <div
                                {...getRootProps()}
                                className="border-dashed border border-gray-300 rounded-md h-36 flex items-center justify-center cursor-pointer text-center text-gray-500 text-sm p-3 mb-4"
                            >
                                <input {...getInputProps()} />
                                    {preview ? (
                                    <Image src={preview} width={96} height={96} alt="Preview" className="h-24 rounded-md object-cover" />
                                ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <DocumentArrowUpIcon className="w-6 h-6 text-gray-400" />
                                    <p>{isDragActive ? 'Drop the file...' : 'Drop your file Or ...'}</p>
                                </div>
                                )}
                            </div>
                            <label className="block text-sm font-medium mb-2">Currency</label>
                            <div className="mb-4">
                                {selectedCurrency && (
                                    <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
                                        <div className="relative">
                                            <Listbox.Button className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                                <span>{selectedCurrency.name}</span>
                                                <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute right-0 mt-1 w-full max-h-[100px] overflow-auto bg-white border border-gray-200 rounded shadow-md z-20">
                                                {currencies.map((currency) => (
                                                    <Listbox.Option
                                                        key={currency.id}
                                                        value={currency}
                                                        className={({ active }) =>
                                                            `cursor-pointer px-3 py-1.5 text-sm ${active ? 'bg-indigo-100' : ''}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <div className="flex justify-between">
                                                                <span>{currency.name}</span>
                                                                {selected && <CheckIcon className="w-4 h-4 text-indigo-600" />}
                                                            </div>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="limits"
                                    className="w-auto"
                                    checked={showLimits}
                                    onChange={(e) => setShowLimits(e.target.checked)}
                                />
                                <label htmlFor="limits" className="text-sm">Set limits</label>
                            </div>
                            {showLimits && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                    <label className="block text-sm font-medium mb-1">Minimum Amount</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                    </div>
                                    <div>
                                    <label className="block text-sm font-medium mb-1">Maximum Amount</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <Button
                        type="submit"
                        title={isLoading ? "Creating..." : "Create New Link"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={isLoading}
                    />
                </form>
                <PinVerificationModal
                    isOpen={showPinModal}
                    onClose={() => setShowPinModal(false)}
                    onVerify={handleCreateLink}
                />
                <div>
                    <div className="flex items-center justify-between">
                        <h5 className="font-semibold mb-4">Preview</h5>
                        <div className="flex justify-end bg-white shadow-md p-[7px] rounded-md mb-4">
                            <button
                                onClick={() => setPreviewMode("mobile")}
                                className={`py-[5px] px-[8px] rounded-[5px] ${
                                previewMode === "mobile" ? "bg-primary__color text-white" : "bg-white text-gray-600"
                                }`}
                            >
                                <DevicePhoneMobileIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPreviewMode("desktop")}
                                className={`py-[5px] px-[8px] rounded-[5px] ${
                                previewMode === "desktop" ? "bg-primary__color text-white" : "bg-white text-gray-600"
                                }`}
                            >
                                <ComputerDesktopIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {previewMode === "mobile" ? (
                        <div className="relative w-full max-w-[300px] h-[500px] sm:h-[600px] mx-auto">
                            <Image
                                src={mockup}
                                width={300}
                                height={600}
                                alt="Mobile Mockup"
                                className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
                            />
                            <div className="absolute z-20 top-[70px] left-[18px] right-[18px] bottom-[100px] overflow-auto bg-white rounded-xl shadow-inner p-4 text-sm">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Amount</label>
                                    <div className="flex items-center border rounded-md px-2">
                                        <span className="text-sm mr-1 text-gray-500">$</span>
                                        <input
                                            type="text"
                                            value={showLimits ? `${minAmount || '0.00'} - ${maxAmount || '0.00'}` : "0.00"}
                                            readOnly
                                            className="w-full border-none p-2 text-sm focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    {preview ? (
                                        <Image src={preview} width={96} height={96} alt="Preview" className="h-24 rounded-md object-cover" />
                                    ) : (
                                        <Image src={logo} width={96} height={96} alt="QR" className="h-24 rounded-md object-cover" />
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Pay with Debit & Credit Card</p>
                                    <input
                                        type="email"
                                        value="Email"
                                        readOnly
                                        className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value="Name on card"
                                        readOnly
                                        className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                    />
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <input
                                            type="text"
                                            value="Card"
                                            readOnly
                                            className="w-full md:w-1/2 border rounded-md p-2 text-sm focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value="MM / YY / CVC"
                                            readOnly
                                            className="w-full md:w-1/2 border rounded-md p-2 text-sm focus:outline-none"
                                        />
                                    </div>
                                    <div className="border rounded-md p-3 bg-gray-50 text-xs text-gray-600 flex items-center gap-2">
                                        <span className="text-lg">💯</span>
                                        <span>
                                            <strong>Securely save my information for 1-click checkout</strong><br />
                                            Pay faster on and everywhere Link is accepted
                                        </span>
                                    </div>
                                    <Button
                                        title="Pay"
                                        variant="primary"
                                        size="md"
                                        className="w-full opacity-80 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-6 space-y-4 shadow-sm">
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount</label>
                                <div className="flex items-center border rounded-md px-2">
                                    <span className="text-sm mr-1 text-gray-500">$</span>
                                    <input
                                        type="text"
                                        value={showLimits ? `${minAmount || '0.00'} - ${maxAmount || '0.00'}` : "0.00"}
                                        readOnly
                                        className="w-full border-none p-2 text-sm focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center">
                                {preview ? (
                                    <Image src={preview} width={96} height={96} alt="Preview" className="h-24 rounded-md object-cover" />
                                ) : (
                                    <Image src={logo} width={96} height={96} alt="QR" className="h-24 rounded-md object-cover" />
                                )}
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm font-medium">Pay with Debit & Credit Card</p>
                                <input
                                    type="email"
                                    value="Email"
                                    readOnly
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value="Name on card"
                                    readOnly
                                    className="w-full border rounded-md p-2 text-sm focus:outline-none"
                                />
                                <div className="flex flex-col md:flex-row gap-2">
                                    <input
                                        type="text"
                                        value="Card"
                                        readOnly
                                        className="w-full md:w-1/2 border rounded-md p-2 text-sm focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        value="MM / YY / CVC"
                                        readOnly
                                        className="w-full md:w-1/2 border rounded-md p-2 text-sm focus:outline-none"
                                    />
                                </div>
                                <div className="border rounded-md p-3 bg-gray-50 text-xs text-gray-600 flex items-center gap-2">
                                    <span className="text-lg">💯</span>
                                    <span>
                                        <strong>Securely save my information for 1-click checkout</strong><br />
                                        Pay faster on and everywhere Link is accepted
                                    </span>
                                </div>
                                <Button
                                    title="Pay"
                                    variant="primary"
                                    size="md"
                                    className="w-full opacity-80 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}