'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import QRCode from "react-qr-code";
import { 
    CurrencyDollarIcon,
    BanknotesIcon,
    ArrowTrendingDownIcon,
    ChartBarIcon,
    ClipboardIcon,
    CheckIcon
} 
from '@heroicons/react/24/outline';
import Button from "@/components/utility/Button";
import { tatumAddMoneyAPI } from '@root/services/apiClient/apiClient';

function CryptoConfirmationPage() {
    const [paymentData, setPaymentData] = useState(null);
    const [txnHash, setTxnHash] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const storedData = sessionStorage.getItem('cryptoPaymentData');
        if (storedData) {
            setPaymentData(JSON.parse(storedData));
        } else {
            window.location.href = '/user/add/money';
            toast.error('No payment data found');
        }
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(paymentData?.address || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Address copied to clipboard!');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (!txnHash) {
                throw new Error('Please enter transaction hash');
            }
            if (!/^0x[a-fA-F0-9]{64}$/.test(txnHash)) {
                throw new Error('Please enter a valid transaction hash');
            }

            const response = await tatumAddMoneyAPI(txnHash, paymentData.trx);

            if (response.data.message?.success) {
                toast.success(response.data.message.success[0]);
                sessionStorage.removeItem('cryptoPaymentData');
            } else {
                toast.error(response?.data?.message?.error?.[0] || 'Submission failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    if (!paymentData) return <div className="text-center py-10">Loading payment details...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Address</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={paymentData.address}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                    type="button"
                                    onClick={copyToClipboard}
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
                        <div className="col-span-2">
                            <div className="flex justify-center bg-white p-4 shadow-primary__shadow my-6">
                                <QRCode 
                                    value={paymentData.address}
                                    size={128}
                                    level="H"
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Transaction Hash (Txn Hash)</label>
                            <input
                                type="text"
                                value={txnHash}
                                onChange={(e) => setTxnHash(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Txn Hash..."
                                required
                                pattern="^0x[a-fA-F0-9]{64}$"
                                title="Enter a valid Ethereum transaction hash (0x followed by 64 characters)"
                            />
                        </div>
                    </div>
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
                    <h5 className="text-base font-semibold text-gray-800">Preview</h5>
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
                            <span>Request Amount</span>
                        </div>
                        <span className="text-gray-800">
                            {paymentData.paymentInfo.request_amount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                            <span>Network Fee</span>
                        </div>
                        <span className="text-gray-800">
                            {paymentData.paymentInfo.total_charge}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-cyan-800" />
                            <span>Exchange Rate</span>
                        </div>
                        <span className="text-gray-800">
                            {paymentData.paymentInfo.exchange_rate}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CryptoConfirmationPage;