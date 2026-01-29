'use client';
import { useState, useEffect } from 'react';
import { profiledGetSellerAPI, SetupPinSellerAPI, UpdatePinSellerAPI } from "@root/services/apiClient/apiClient";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";
  
export default function SetupPinSection() {
    const [pinCode, setPinCode] = useState("");
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [status, setStatus] = useState('');
    const [apiLoading, setApiLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setApiLoading(true);
                const response = await profiledGetSellerAPI();
                const data = response.data.data.user;
                setStatus(data.pin_status);
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setApiLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleSetupSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await SetupPinSellerAPI(pinCode);
            toast.success(response?.data?.message?.success?.[0]);
            setPinCode("");
            setStatus(true);
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await UpdatePinSellerAPI(oldPin, newPin);
            toast.success(response?.data?.message?.success?.[0]);
            setOldPin("");
            setNewPin("");
        } catch (error) {
            const errorMessage = error?.response?.data?.message?.error?.[0] || "Something went wrong.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const SkeletonLoader = () => (
        <div className="space-y-5 animate-pulse">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded-md"></div>
                </div>
            </div>
            <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
    );

    return (
        <div className="bg-white rounded-[12px] p-7 col-span-7">
            {apiLoading ? (
                <SkeletonLoader />
            ) : !status ? (
                <form className="space-y-5" onSubmit={handleSetupSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Setup PIN(Max:4)</label>
                            <input
                                type="text"
                                value={pinCode}
                                onChange={(e) => setPinCode(e.target.value.slice(0, 4))}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter PIN..."
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        title={loading ? "Saving..." : "Save & Change"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={loading}
                    />
                </form>
            ) : (
                <form className="space-y-5" onSubmit={handleUpdateSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Old PIN</label>
                            <input
                                type="text"
                                value={oldPin}
                                onChange={(e) => setOldPin(e.target.value.slice(0, 4))}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter old PIN..."
                                maxLength={4}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">New PIN</label>
                            <input
                                type="text"
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter new PIN..."
                                maxLength={4}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        title={loading ? "Updating..." : "Update PIN"}
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={loading}
                    />
                </form>
            )}
        </div>
    );
}