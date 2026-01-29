"use client";
// Packages
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { logoutSellerAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useDashboardData } from "@/components/context/seller/DashboardContext";
// Icons
import {
    ChevronRightIcon,
    RectangleStackIcon,
    LockClosedIcon,
    ArrowLeftStartOnRectangleIcon,
    EllipsisHorizontalIcon,
    UserIcon,
    LockOpenIcon,
    PuzzlePieceIcon,
    Bars3CenterLeftIcon,
    QueueListIcon,
    Square3Stack3DIcon,
    LightBulbIcon,
    StopCircleIcon,
    LifebuoyIcon,
    FilmIcon,
} from "@heroicons/react/24/solid";
// Images
import logo from "@public/images/logo/logo.webp";
import rocket from "@public/images/icon/rocket.png";

// Nav Links Data
export const navLink = [
    {
        items: [
            {
                url: "/seller/dashboard",
                label: "Dashboard",
                icon: RectangleStackIcon,
            },
        ],
    },
    {
        heading: "Product",
        headingIcon: QueueListIcon,
        items: [
            {
                url: "/seller/product",
                label: "Product",
                icon: Square3Stack3DIcon,
            },
            // {
            //     url: "/seller/product/category",
            //     label: "Category",
            //     icon: LightBulbIcon,
            // },
            // {
            //     url: "/seller/product/child-category",
            //     label: "Child category",
            //     icon: StopCircleIcon,
            // },
            // {
            //     url: "/seller/product/child-sub-category",
            //     label: "Child sub category",
            //     icon: LifebuoyIcon,
            // },
            // {
            //     url: "/seller/product/brand",
            //     label: "Brand",
            //     icon: FilmIcon,
            // },
        ],
    },
    {
        heading: "Security",
        headingIcon: LockOpenIcon,
        items: [
            {
                url: "/seller/security/google/2fa",
                label: "2FA Security",
                icon: LockClosedIcon,
            },
            {
                url: "/seller/setup/pin",
                label: "Setup Pin",
                icon: EllipsisHorizontalIcon,
            },
        ],
    },
    {
        heading: "Account",
        headingIcon: PuzzlePieceIcon,
        items: [
            {
                url: "/seller/user/profile",
                label: "Profile",
                icon: UserIcon,
            },
            {
                url: "/",
                label: "Logout",
                icon: ArrowLeftStartOnRectangleIcon,
            },
        ],
    },
];

export default function SideNav() {
    const router = useRouter();
    const pathname = usePathname();
    const { isSidebarOpen, setIsSidebarOpen } = useDashboardData();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [openSectionIndex, setOpenSectionIndex] = useState(() => {
        const initialIndex = navLink
            .slice(1)
            .findIndex((section) =>
                section.items.some((item) => item.url === pathname),
            );
        return initialIndex === -1 ? null : initialIndex;
    });

    const onLogout = async (e) => {
        e.preventDefault();

        try {
            const response = await logoutSellerAPI();

            const successMessage = response?.data?.message?.success || [
                "Logout successful",
            ];

            localStorage.removeItem("jwtSellerToken");
            localStorage.removeItem("userInfo");

            sessionStorage.removeItem("jwtSellerToken");
            sessionStorage.removeItem("userInfo");

            successMessage.forEach((msg) => {
                toast.success(msg);
            });

            setIsLogoutModalOpen(false); // Close the modal
            router.push("/seller/auth/login"); // Redirect to login page
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
        }
    };

    return (
        <>
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed top-0 left-0 w-screen h-screen bg-black opacity-20 z-[9997] transition-all block lg:hidden"
                />
            )}

            <section
                className={`w-[250px] h-[calc(100vh-32px)] fixed top-4 z-[9998] lg:left-4 rounded-[12px] px-3 py-6 bg-white transition-all overflow-hidden ${isSidebarOpen ? "left-4" : "-left-full"}`}
            >
                <div className="flex flex-col justify-between h-full">
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="transition-all hover:scale-95 hover:opacity-60 pl-5"
                            >
                                <Image
                                    src={logo}
                                    width={170}
                                    priority={true}
                                    quality={50}
                                    className="sm:h-auto h-[35px] xl:w-[130px] sm:w-[100px] w-auto"
                                    alt="Logo"
                                />
                            </Link>
                        </div>
                        <div className="sidebar-menu overflow-y-auto max-h-[calc(100vh-330px)] space-y-2">
                            {navLink[0].items.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.url}
                                    className={`flex items-center text-sm font-medium rounded-[10px] px-5 py-2 transition-all hover:text-primary__color ${pathname === item.url ? "text-primary__color bg-[#F5F7FF] py-3" : "text-color__paragraph"}`}
                                >
                                    <div className="">
                                        <item.icon
                                            className={`size-5 transition-all ${pathname === item.url ? "fill-primary__color" : "fill-color__paragraph"}`}
                                        />
                                    </div>
                                    <span className="ms-2">{item.label}</span>
                                </Link>
                            ))}
                            {navLink.slice(1).map((section, sectionIndex) => {
                                const isOpen =
                                    openSectionIndex === sectionIndex;

                                return (
                                    <div
                                        key={sectionIndex}
                                        className="space-y-2"
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenSectionIndex(
                                                    isOpen
                                                        ? null
                                                        : sectionIndex,
                                                )
                                            }
                                            className="flex w-full justify-between items-center px-5 py-2 text-left text-[11px] font-medium"
                                        >
                                            <div className="flex items-center">
                                                {section.headingIcon && (
                                                    <section.headingIcon className="size-5 transition-all fill-color__paragraph" />
                                                )}
                                                <span className="flex items-center text-sm font-medium rounded-[10px] transition-all hover:text-primary__color ms-2">
                                                    {section.heading}
                                                </span>
                                            </div>
                                            <ChevronRightIcon
                                                className={`h-3 w-3 transition-transform ${isOpen ? "rotate-90" : ""}`}
                                            />
                                        </button>
                                        <Transition
                                            show={isOpen}
                                            enter="transition-all duration-300 ease-in-out"
                                            enterFrom="opacity-0 max-h-0"
                                            enterTo="opacity-100 max-h-[500px]"
                                            leave="transition-all duration-200 ease-in-out"
                                            leaveFrom="opacity-100 max-h-[500px]"
                                            leaveTo="opacity-0 max-h-0"
                                        >
                                            <div className="pl-5">
                                                <ul className="space-y-1">
                                                    {section.items.map(
                                                        (item, itemIndex) => (
                                                            <li key={itemIndex}>
                                                                {item.label ===
                                                                "Logout" ? (
                                                                    <button
                                                                        onClick={() =>
                                                                            setIsLogoutModalOpen(
                                                                                true,
                                                                            )
                                                                        }
                                                                        className="flex items-center text-sm font-medium rounded-[10px] px-3 py-2 w-full text-left transition-all hover:text-primary__color text-color__paragraph"
                                                                    >
                                                                        <item.icon className="size-4 fill-color__paragraph" />
                                                                        <span className="ms-2">
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                ) : (
                                                                    <Link
                                                                        href={
                                                                            item.url
                                                                        }
                                                                        className={`flex items-center text-sm font-medium rounded-[10px] px-3 py-2 transition-all hover:text-primary__color ${pathname === item.url ? "text-primary__color bg-[#F5F7FF] py-3" : "text-color__paragraph"}`}
                                                                    >
                                                                        <div>
                                                                            <item.icon
                                                                                className={`size-4 transition-all ${pathname === item.url ? "fill-primary__color" : "fill-color__paragraph"}`}
                                                                            />
                                                                        </div>
                                                                        <span className="ms-2">
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                )}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        </Transition>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-5">
                        <div className="w-full p-7 rounded-[12px] bg-[#F5F7FF]">
                            <h4 className="text-[18px] font-bold">
                                Help Center?
                            </h4>
                            <p className="leading-[17px] font-medium mt-2">
                                How can we help you?
                            </p>
                            <Link
                                href="/seller/support/ticket"
                                className="mt-4 bg-primary__color text-white__color flex justify-center items-center py-3 px-5 gap-2 font-semibold rounded-[6px] transition hover:bg-secondary__color hover:scale-x-105"
                            >
                                <Image
                                    src={rocket}
                                    width={20}
                                    priority={true}
                                    quality={50}
                                    className=""
                                    alt="Icon"
                                />
                                Get Support
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
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
                                            Logout
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
