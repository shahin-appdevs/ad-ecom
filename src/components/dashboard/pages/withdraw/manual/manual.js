'use client';
import { useState } from 'react';
import { ManualWithdrawAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import Button from "@/components/utility/Button";
import { 
    CurrencyDollarIcon,
    BanknotesIcon,
    ArrowTrendingDownIcon,
    WalletIcon,
    ChartBarIcon,
} 
from '@heroicons/react/24/outline';

export default function ManualWithdrawPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        mobileNumber: '',
        pin: '',
        trasnactionId: ''
    });
    const [transactionInfo, setTransactionInfo] = useState(null);

    useState(() => {
        const manualPaymentData = JSON.parse(sessionStorage.getItem('manualPaymentData'));
        if (!manualPaymentData) {
            toast.error("Invalid transaction data");
            window.location.href = '/user/withdraw/money';
            return;
        }
        setTransactionInfo(manualPaymentData);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await ManualWithdrawAPI(
                transactionInfo.trx,
                formData.mobileNumber,
                formData.pin,
                formData.trasnactionId
            );
            
            if (response.data) {
                toast.success(response?.data?.message?.success?.[0]);
                sessionStorage.removeItem('manualPaymentData');
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || "Withdrawal failed");
        } finally {
            setLoading(false);
        }
    };

    if (!transactionInfo) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                            className="prose prose-sm mb-6 col-span-2" 
                            dangerouslySetInnerHTML={{ __html: transactionInfo.details }} 
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2">Mobile Number</label>
                            <input
                                type="text"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                                placeholder="Enter your mobile number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">PIN</label>
                            <input
                                type="password"
                                name="pin"
                                value={formData.pin}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                                placeholder="Enter your PIN"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Transaction ID</label>
                            <input
                                type="text"
                                name="trasnactionId"
                                value={formData.trasnactionId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                                placeholder="Enter transaction ID"
                            />
                        </div>
                    </div>
                    <Button
                        title={loading ? "Confirming..." : "Confirm Withdraw"}
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
                            {transactionInfo.trx}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                            <span>Payment Method</span>
                        </div>
                        <span className="text-gray-800">
                            {transactionInfo.gateway}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
                            <span>Amount</span>
                        </div>
                        <span className="text-gray-800">
                            {transactionInfo.amount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <ChartBarIcon className="w-5 h-5 text-cyan-800" />
                            <span>Exchange Rate</span>
                        </div>
                        <span className="text-gray-800">
                            {transactionInfo.exchangeRate}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 font-semibold text-gray-800">
                        <div className="flex items-center space-x-2">
                            <WalletIcon className="w-5 h-5 text-indigo-600" />
                            <span>Payable Amount</span>
                        </div>
                        <span>
                            {transactionInfo.payable}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}