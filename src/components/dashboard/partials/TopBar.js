"use client";
// Packages
import { useState, useEffect, Fragment } from "react";
import { dashboardGetAPI, logoutAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Images
import userProfile from "@public/images/user/userProfile.png";
import Link from "next/link";
import { LoaderCircle, Lock, LogOut, ShieldCheck, User } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";

export default function TopBar() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState([]);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const router = useRouter();

    const pathSegments = pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "Dashboard";
    const formattedTitle = lastSegment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardGetAPI();
                const userData = response?.data?.data?.user || [];
                setUserData(userData);
            } catch (error) {
                toast.error(
                    error?.response?.data?.message?.error?.[0] ||
                        "Something went wrong",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const onLogout = async (e) => {
        e.preventDefault();
        setLogoutLoading(true);

        try {
            const response = await logoutAPI();

            const successMessage = response?.data?.message?.success || [
                "Logout successful",
            ];

            localStorage.removeItem("jwtToken");
            localStorage.removeItem("userInfo");
            localStorage.removeItem("email_verified");
            localStorage.removeItem("sms_verified");
            localStorage.removeItem("two_factor_verified");
            // sessionStorage.removeItem("active_virtual_system");

            successMessage.forEach((msg) => {
                toast.success(msg);
            });

            setIsLogoutModalOpen(false); // Close the modal
            router.push("/user/auth/login"); // Redirect to login page
        } catch (err) {
            setIsLogoutModalOpen(false); // Close the modal on error too
            if (err.response?.data?.message?.error) {
                const errors = err.response?.data?.message?.error;
                errors.forEach((msg) => {
                    toast.error(msg);
                });
            } else {
                toast.error(err.message || "Something went wrong");
            }
        } finally {
            setLogoutLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white__color rounded-[12px] sm:px-8 px-4 py-4 mb-4">
                <div className="flex items-center">
                    <div className="flex  sm:flex-row items-center justify-between w-full gap-4 md:gap-0">
                        {/* Title */}
                        {loading ? (
                            <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
                        ) : (
                            <h5 className="font-semibold text-[16px]">
                                {formattedTitle}
                            </h5>
                        )}

                        {/* User Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="flex items-center gap-3">
                                {/* Avatar + Dropdown */}
                                <div className="relative group focus-within:group">
                                    {loading ? (
                                        <div className="h-[42px] w-[42px] rounded-full bg-gray-200 animate-pulse" />
                                    ) : (
                                        <button
                                            type="button"
                                            className="outline-none"
                                        >
                                            <Image
                                                src={
                                                    userData.userImage ||
                                                    userProfile
                                                }
                                                width={42}
                                                height={42}
                                                priority
                                                quality={50}
                                                className="h-[42px] w-[42px] bg-[#F5F7FF] rounded-full object-cover cursor-pointer"
                                                alt="User"
                                                onError={(e) => {
                                                    e.target.src =
                                                        userProfile.src;
                                                }}
                                            />
                                        </button>
                                    )}

                                    {/* Dropdown Menu */}
                                    {!loading && (
                                        <div className="absolute right-0 mt-2 w-52 rounded-md bg-white shadow-lg ring-1 ring-black/5 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-20">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                {/* User Info (moved here, unchanged) */}
                                                <div className="relative top-1">
                                                    {loading ? (
                                                        <div className="space-y-2">
                                                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <h5 className="text-[14px] md:text-[16px] font-semibold flex gap-2 items-start leading-[15px]">
                                                                {
                                                                    userData.username
                                                                }
                                                                <span className="relative top-[-2px] text-[10px] rounded-[4px] text-[#008B3E] bg-[#008b3e1c] py-[2px] px-2">
                                                                    {
                                                                        userData
                                                                            ?.kycStringStatus
                                                                            ?.value
                                                                    }
                                                                </span>
                                                            </h5>
                                                            <span className="text-sm text-color__heading">
                                                                {
                                                                    userData.mobile
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Menu Items  */}
                                            <ul className="py-1 text-sm text-gray-700">
                                                <li>
                                                    <Link
                                                        href="/user/user/profile"
                                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                                                    >
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <span>Profile</span>
                                                    </Link>
                                                </li>

                                                <li>
                                                    <Link
                                                        href="/user/setup/pin"
                                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                                                    >
                                                        <ShieldCheck className="h-4 w-4 text-gray-500" />
                                                        <span>Setup Pin</span>
                                                    </Link>
                                                </li>

                                                <li>
                                                    <Link
                                                        href="/user/security/google/2fa"
                                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                                                    >
                                                        <Lock className="h-4 w-4 text-gray-500" />
                                                        <span>
                                                            2FA Verification
                                                        </span>
                                                    </Link>
                                                </li>

                                                <li>
                                                    <button
                                                        onClick={() =>
                                                            setIsLogoutModalOpen(
                                                                true,
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span>Logout</span>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* User text info */}
                                <div className="relative top-1 hidden">
                                    {loading ? (
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    ) : (
                                        <>
                                            <h5 className="text-[14px] md:text-[16px] font-semibold flex gap-2 items-start leading-[15px]">
                                                {userData.username}
                                                <span className="relative top-[-2px] text-[10px] rounded-[4px] text-[#008B3E] bg-[#008b3e1c] py-[2px] px-2">
                                                    {
                                                        userData
                                                            ?.kycStringStatus
                                                            ?.value
                                                    }
                                                </span>
                                            </h5>
                                            <span className="text-xs text-color__heading">
                                                {userData.mobile}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Transition appear show={isLogoutModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-[9999]"
                    onClose={() => setIsLogoutModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Confirm Logout
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to logout?
                                        </p>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                            onClick={() =>
                                                setIsLogoutModalOpen(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                            onClick={onLogout}
                                        >
                                            <span className="flex items-center gap-2">
                                                {logoutLoading && (
                                                    <LoaderCircle className="animate-spin text-white" />
                                                )}

                                                <span>Logout</span>
                                            </span>
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}
