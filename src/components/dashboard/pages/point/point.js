"use client";
import { useEffect, useState } from "react";
import { pointToCashGetAPI, pointConvertAPI } from "@root/services/apiClient/apiClient";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";
import {
    GiftIcon,
    BanknotesIcon,
    CircleStackIcon,
    ArrowRightCircleIcon
} from "@heroicons/react/24/outline";

const formatAmount = (value) => {
    if (!value) return "0.00";
    return parseFloat(value).toFixed(2);
};

function SkeletonCard() {
    return (
        <div className="animate-pulse bg-gray-100 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
            <div className="h-5 bg-gray-300 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
    );
}

export default function PointsPage() {
    const [points, setPoints] = useState([]);
    const [currencySymbol, setCurrencySymbol] = useState("৳");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [converting, setConverting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const response = await pointToCashGetAPI();
                setPoints(response.data.data.points.data || []);
                setCurrencySymbol(response.data.data.base_curr_symbol);
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message?.error?.[0] ||
                    "Failed to load point history.";
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchPoints();
    }, []);

    const handleConvert = async () => {
        if (!selectedPoint) return;
        try {
            setConverting(true);
            const response = await pointConvertAPI(selectedPoint.id, selectedPoint.point_amount);
            setIsOpen(false);
            toast.success(response?.data?.message?.success[0]);
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0] || "Conversion failed!");
        } finally {
            setConverting(false);
        }
    };

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold tracking-tight">
                    Point to Cash
                </h5>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : !points.length ? (
                <div className="p-6">No point history found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {points.map((item) => (
                        <div
                            key={item.id}
                            className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GiftIcon className="w-6 h-6 text-indigo-500" />
                                    <h5 className="font-semibold">
                                        {item.point_amount} Points → {currencySymbol}{" "}
                                        {formatAmount(item.cash_amount)}
                                    </h5>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedPoint(item);
                                        setIsOpen(true);
                                    }}
                                    className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
                                >
                                    <ArrowRightCircleIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                    <BanknotesIcon className="w-4 h-4 text-green-500" />
                                    <span className="font-semibold">
                                        Cash Amount:
                                    </span>{" "}
                                    {currencySymbol}{" "}
                                    {formatAmount(item.cash_amount)}
                                </p>
                                <p className="flex items-center gap-2">
                                    <CircleStackIcon className="w-4 h-4 text-amber-500" />
                                    <span className="font-semibold">Points:</span>{" "}
                                    {item.point_amount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <Dialog.Title className="text-lg font-semibold text-gray-800">
                            Convert Points
                        </Dialog.Title>
                        <Dialog.Description className="mt-2 text-gray-600">
                            Are you sure you want to convert{" "}
                            <b>{selectedPoint?.point_amount}</b> points into{" "}
                            <b>
                                {currencySymbol}{" "}
                                {formatAmount(selectedPoint?.cash_amount)}
                            </b>
                            ?
                        </Dialog.Description>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConvert}
                                disabled={converting}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {converting ? "Converting..." : "Confirm"}
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}
