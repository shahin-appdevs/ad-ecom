"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    profiledGetAPI,
    SetupPinAPI,
    UpdatePinAPI,
} from "@root/services/apiClient/apiClient";
import Button from "@/components/utility/Button";
import { toast } from "react-hot-toast";

export default function SetupPinSection() {
    const [pinCode, setPinCode] = useState("");
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [status, setStatus] = useState("");
    const [apiLoading, setApiLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const t = useTranslations("Dashboard.security.setupPin");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setApiLoading(true);
                const response = await profiledGetAPI();
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
            const response = await SetupPinAPI(pinCode);
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
            const response = await UpdatePinAPI(oldPin, newPin);
            toast.success(response?.data?.message?.success?.[0]);
            setOldPin("");
            setNewPin("");
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message?.error?.[0] ||
                t("somethingWrong");
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
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h5>{t("setupTitle")}</h5>
                    </div>
                    <form className="space-y-5" onSubmit={handleSetupSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                    {t("setupLabel")}
                                </label>
                                <input
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) =>
                                        setPinCode(e.target.value.slice(0, 4))
                                    }
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder={t("placeholder")}
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            title={loading ? t("saving") : t("saveChange")}
                            variant="primary"
                            size="md"
                            className="w-full"
                            disabled={loading}
                        />
                    </form>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h5>{t("updateTitle")}</h5>
                    </div>
                    <form className="space-y-5" onSubmit={handleUpdateSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                    {t("oldPinLabel")}
                                </label>
                                <input
                                    type="text"
                                    value={oldPin}
                                    onChange={(e) =>
                                        setOldPin(e.target.value.slice(0, 4))
                                    }
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder={t("oldPinPlaceholder")}
                                    maxLength={4}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                    {t("newPinLabel")}
                                </label>
                                <input
                                    type="text"
                                    value={newPin}
                                    onChange={(e) =>
                                        setNewPin(e.target.value.slice(0, 4))
                                    }
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder={t("newPinPlaceholder")}
                                    maxLength={4}
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            title={loading ? t("updating") : t("updateButton")}
                            variant="primary"
                            size="md"
                            className="w-full"
                            disabled={loading}
                        />
                    </form>
                </div>
            )}
        </div>
    );
}
