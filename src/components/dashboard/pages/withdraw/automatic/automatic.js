'use client';
import { useState, useEffect } from 'react';
import { InsertWithdrawAPI, AutomaticWithdrawAPI, flutterwaveBanksGetAPI, flutterwaveBankBranchesGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { Listbox } from '@headlessui/react';
import Button from "@/components/utility/Button";
import { 
    CurrencyDollarIcon,
    BanknotesIcon,
    ArrowTrendingDownIcon,
    WalletIcon,
    ChartBarIcon,
    ChevronUpDownIcon,
    CheckIcon
} 
from '@heroicons/react/24/outline';

const countries = [
    { code: 'BD', name: 'Bangladesh' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'In', name: 'India' }
];

export default function AutomaticWithdrawPage() {
    const [loading, setLoading] = useState(false);
    const [banksLoading, setBanksLoading] = useState(false);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        bankId: '',
        bankName: '',
        branchId: '',
        branchName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
        beneficiaryName: '',
        beneficiaryAddress: '',
        beneficiaryCountry: ''
    });
    const [transactionInfo, setTransactionInfo] = useState(null);

    const fetchBanks = async (trx) => {
        setBanksLoading(true);
        try {
            const response = await flutterwaveBanksGetAPI(trx);
            if (response.data?.data?.bank_info) {
                setBanks(response.data.data.bank_info);
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || "Failed to load banks");
        } finally {
            setBanksLoading(false);
        }
    };

    const fetchBranches = async (bankId) => {
        if (!bankId || !transactionInfo?.trx) return;
        
        setBranchesLoading(true);
        try {
            const response = await flutterwaveBankBranchesGetAPI(transactionInfo.trx, bankId);
            if (response.data?.data?.bank_branches) {
                setBranches(response.data.data.bank_branches);
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || "Failed to load branches");
        } finally {
            setBranchesLoading(false);
        }
    };

    useState(() => {
        const autoPaymentData = JSON.parse(sessionStorage.getItem('autoPaymentData'));
        if (!autoPaymentData) {
            toast.error("Invalid transaction data");
            window.location.href = '/user/withdraw/money';
            return;
        }
        setTransactionInfo(autoPaymentData);
        fetchBanks(autoPaymentData.trx);
    }, []);

    const handleBankChange = (bankId) => {
        const selectedBank = banks.find(bank => bank.id === bankId);
        setFormData(prev => ({
            ...prev,
            bankId,
            bankName: selectedBank?.name || '',
            branchId: '',
            branchName: '',
            routingNumber: selectedBank?.routing_number || '',
            swiftCode: selectedBank?.swift_code || ''
        }));
        fetchBranches(bankId);
    };

    const handleBranchChange = (branchId) => {
        const selectedBranch = branches.find(branch => branch.id === branchId);
        setFormData(prev => ({
            ...prev,
            branchId,
            branchName: selectedBranch?.name || '',
            routingNumber: selectedBranch?.routing_number || prev.routingNumber,
            swiftCode: selectedBranch?.swift_code || prev.swiftCode
        }));
    };

    const handleCountryChange = (countryCode) => {
        setFormData(prev => ({
            ...prev,
            beneficiaryCountry: countryCode
        }));
    };

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
            const response = await AutomaticWithdrawAPI(
                transactionInfo.trx,
                formData.bankName,
                formData.accountNumber,
                formData.routingNumber,
                formData.swiftCode,
                formData.beneficiaryName,
                formData.beneficiaryAddress,
                formData.beneficiaryCountry
            );
            
            if (response.data) {
                toast.success(response?.data?.message?.success?.[0]);
                sessionStorage.removeItem('autoPaymentData');
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
                        {transactionInfo.details && (
                            <div 
                                className="prose prose-sm mb-6 col-span-2" 
                                dangerouslySetInnerHTML={{ __html: transactionInfo.details }} 
                            />
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-2">Select Bank</label>
                            <Listbox 
                                value={formData.bankId} 
                                onChange={handleBankChange}
                                disabled={banksLoading}
                            >
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
                                        <span className="block truncate">
                                            {formData.bankId 
                                                ? banks.find(bank => bank.id === formData.bankId)?.name || 'Select Bank'
                                                : 'Select Bank'}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                        {banksLoading ? (
                                            <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                                Loading banks...
                                            </div>
                                        ) : banks.map((bank) => (
                                            <Listbox.Option
                                                key={bank.id}
                                                value={bank.id}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                        active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                                    }`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span
                                                            className={`block truncate ${
                                                                selected ? 'font-medium' : 'font-normal'
                                                            }`}
                                                        >
                                                            {bank.name} ({bank.code})
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        {formData.bankId && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Select Branch (Optional)
                                </label>
                                <Listbox 
                                    value={formData.branchId} 
                                    onChange={handleBranchChange}
                                    disabled={branchesLoading || !formData.bankId}
                                >
                                    <div className="relative">
                                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
                                            <span className="block truncate">
                                                {formData.branchId 
                                                    ? branches.find(branch => branch.id === formData.branchId)?.name || 'Select Branch'
                                                    : 'Select Branch'}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon
                                                    className="h-5 w-5 text-gray-400"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                            {branchesLoading ? (
                                                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                                    Loading branches...
                                                </div>
                                            ) : (
                                                <>
                                                    <Listbox.Option
                                                        value=""
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected ? 'font-medium' : 'font-normal'
                                                                    }`}
                                                                >
                                                                    No branch selected
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                    {branches.map((branch) => (
                                                        <Listbox.Option
                                                            key={branch.id}
                                                            value={branch.id}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                    active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                                                }`
                                                            }
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span
                                                                        className={`block truncate ${
                                                                            selected ? 'font-medium' : 'font-normal'
                                                                        }`}
                                                                    >
                                                                        {branch.name} - {branch.city}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </>
                                            )}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium mb-2">Account Number</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                                placeholder="Enter your Account Number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Routing Number</label>
                            <input
                                type="text"
                                name="routingNumber"
                                value={formData.routingNumber}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                                placeholder="Enter your Routing Number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">SWIFT Code</label>
                            <input
                                type="text"
                                name="swiftCode"
                                value={formData.swiftCode}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                                placeholder="Enter your SWIFT/BIC code"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Beneficiary Country</label>
                            <Listbox 
                                value={formData.beneficiaryCountry} 
                                onChange={handleCountryChange}
                            >
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
                                        <span className="block truncate">
                                            {formData.beneficiaryCountry 
                                                ? countries.find(c => c.code === formData.beneficiaryCountry)?.name || 'Select Country'
                                                : 'Select Country'}
                                        </span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                        {countries.map((country) => (
                                            <Listbox.Option
                                                key={country.code}
                                                value={country.code}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                        active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                                    }`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span
                                                            className={`block truncate ${
                                                                selected ? 'font-medium' : 'font-normal'
                                                            }`}
                                                        >
                                                            {country.name}
                                                        </span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Beneficiary Name</label>
                            <input
                                type="text"
                                name="beneficiaryName"
                                value={formData.beneficiaryName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                                placeholder="Enter account holder name"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Beneficiary Address</label>
                            <textarea
                                name="beneficiaryAddress"
                                value={formData.beneficiaryAddress}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                rows={3}
                                required
                                placeholder="Enter Beneficiary Address"
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