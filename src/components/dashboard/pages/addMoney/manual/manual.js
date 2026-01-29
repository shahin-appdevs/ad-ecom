'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
    CurrencyDollarIcon,
    BanknotesIcon,
    ArrowTrendingDownIcon,
    WalletIcon,
    ChartBarIcon,
} 
from '@heroicons/react/24/outline';
import Button from "@/components/utility/Button";
import { ManualAddMoneyAPI } from '@root/services/apiClient/apiClient';

function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

function ManualConfirmationPage() {
    const [paymentData, setPaymentData] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedData = sessionStorage.getItem('manualPaymentData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setPaymentData(parsedData);
            
            // Initialize form values based on input fields
            const initialValues = {};
            if (parsedData.inputFields) {
                parsedData.inputFields.forEach(field => {
                    initialValues[field.name] = '';
                });
            }
            setFormValues(initialValues);
        } else {
            window.location.href = '/user/add/money';
            toast.error('No payment data found');
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Validate required fields
            if (paymentData.inputFields) {
                const missingFields = paymentData.inputFields.filter(field => 
                    field.required && !formValues[field.name]
                );
                
                if (missingFields.length > 0) {
                    throw new Error(`Please fill all required fields: ${missingFields.map(f => f.label).join(', ')}`);
                }
            }

            // Prepare submission data
            const submissionData = {
                track: paymentData.trx,
                ...formValues
            };

            // Submit to API
            const response = await ManualAddMoneyAPI(submissionData);

            if (response.data.message?.success) {
                toast.success(response.data.message.success[0]);
                sessionStorage.removeItem('manualPaymentData');
                // Optionally redirect to success page
                // window.location.href = '/user/add/money/success';
            } else {
                toast.error(response?.data?.message?.error?.[0] || 'Submission failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || error.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const renderInputField = (field) => {
        const commonProps = {
            name: field.name,
            value: formValues[field.name] || '',
            onChange: handleInputChange,
            className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100",
            required: field.required || false,
            maxLength: field.validation?.max || undefined,
            minLength: field.validation?.min || undefined,
            placeholder: `Enter ${field.label.toLowerCase()}`
        };

        switch (field.type) {
            case 'textarea':
                return <textarea {...commonProps} rows={3} />;
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Select {field.label}</option>
                        {field.validation?.options?.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            case 'file':
                return <input type="file" {...commonProps} />;
            case 'number':
                return <input type="number" {...commonProps} />;
            case 'email':
                return <input type="email" {...commonProps} />;
            default:
                return <input type="text" {...commonProps} />;
        }
    };

    if (!paymentData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7 space-y-5">
                    <Skeleton className="h-8 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <div className="relative">
                                <Skeleton className="h-10 w-full" />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-20">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <div className="relative">
                                <Skeleton className="h-10 w-full" />
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-20">
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <Skeleton className="h-5 w-32" />
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                        <div className="border-t pt-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Payment Instructions */}
                    {paymentData.details && (
                        <div 
                            className="prose prose-sm mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200" 
                            dangerouslySetInnerHTML={{ __html: paymentData.details }} 
                        />
                    )}

                    {/* Dynamic Input Fields */}
                    {paymentData.inputFields && paymentData.inputFields.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentData.inputFields.map((field, index) => (
                                <div 
                                    key={field.name} 
                                    className={field.type === 'textarea' ? 'col-span-2' : ''}
                                >
                                    <label className="block text-sm font-medium mb-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {renderInputField(field)}
                                    {field.validation?.max && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maximum {field.validation.max} characters
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No additional information required for this payment method.
                        </div>
                    )}

                    <Button
                        title={loading ? "Confirming..." : "Confirm Payment"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        type="submit"
                        disabled={loading}
                    />
                </form>
            </div>
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <h5 className="text-base font-semibold text-gray-800">Payment Summary</h5>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
                            <span>Transaction ID</span>
                        </div>
                        <span className="font-medium text-gray-800">
                            {paymentData.trx}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>Payment Method</span>
                        </div>
                        <span className="text-gray-800">
                            {paymentData.gateway}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                            <span>Amount</span>
                        </div>
                        <span className="text-gray-800">
                            {paymentData.amount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-cyan-800" />
                            <span>Exchange Rate</span>
                        </div>
                        <span className="text-gray-800">
                            {paymentData.exchangeRate}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 font-semibold text-gray-800">
                        <div className="flex items-center space-x-2">
                            <WalletIcon className="w-5 h-5 text-indigo-600" />
                            <span>Payable Amount</span>
                        </div>
                        <span>
                            {paymentData.payable}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManualConfirmationPage;