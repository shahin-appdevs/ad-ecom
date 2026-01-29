"use client";
// Packages
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { logoutAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useFeatureAccess } from "@/components/hooks/useFeatureAccess";
// Icons
import {
    ChevronRightIcon,
    RectangleStackIcon,
    ReceiptPercentIcon,
    CheckBadgeIcon,
    LinkIcon,
    BanknotesIcon,
    TicketIcon,
    DevicePhoneMobileIcon,
    PaperAirplaneIcon,
    ReceiptRefundIcon,
    DocumentMinusIcon,
    SquaresPlusIcon,
    ArrowsPointingOutIcon,
    ArrowUpOnSquareIcon,
    ChartBarSquareIcon,
    LockClosedIcon,
    ArrowLeftStartOnRectangleIcon,
    PresentationChartBarIcon,
    EllipsisHorizontalIcon,
    UserIcon,
    WalletIcon,
    ServerIcon,
    LockOpenIcon,
    MapIcon,
    PuzzlePieceIcon,
    Bars3CenterLeftIcon,
    ShoppingBagIcon,
    ArrowDownOnSquareStackIcon,
    CircleStackIcon,
    CurrencyPoundIcon,
    TrophyIcon,
    SignalIcon,
} from "@heroicons/react/24/solid";
// Images
import logo from "@public/images/logo/logo.webp";
import rocket from "@public/images/icon/rocket.png";
import { CreditCardIcon, GiftIcon } from "@heroicons/react/24/outline";
import { useDashboardData } from "@/components/context/DashboardContext";

// Nav Links Data
export const navLink = [
    {
        items: [
            {
                url: "/user/dashboard",
                label: "Dashboard",
                icon: RectangleStackIcon,
            },
        ],
    },
    {
        heading: "Wallet",
        headingIcon: WalletIcon,
        items: [
            {
                url: "/user/add/money",
                label: "Add Balance",
                icon: SquaresPlusIcon,
                featureKey: "add_money",
            },
            {
                url: "/user/withdraw/money",
                label: "Payment Request",
                icon: ArrowsPointingOutIcon,
                featureKey: "withdraw_money",
            },
            {
                url: "/user/money/exchange",
                label: "Rate Converter",
                icon: PresentationChartBarIcon,
                featureKey: "money_exchange",
            },
            {
                url: "/user/receive-money",
                label: "My QR Code",
                icon: ReceiptRefundIcon,
                featureKey: "receive_money",
            },
            {
                url: "/user/send-money",
                label: "P2P Transfer",
                icon: PaperAirplaneIcon,
                featureKey: "send_money",
            },
            {
                url: "/user/make/payment",
                label: "Merchant Pay",
                icon: BanknotesIcon,
                featureKey: "make_payment",
            },
            {
                url: "/user/money/out",
                label: "Cash Out",
                icon: ArrowUpOnSquareIcon,
                featureKey: "money_out",
            },
            {
                url: "/user/money/request",
                label: "Request Money",
                icon: DocumentMinusIcon,
                featureKey: "request_money",
            },
            {
                url: "/user/payment/link",
                label: "Payment Link",
                icon: LinkIcon,
                featureKey: "pay_link",
            },
        ],
    },
    {
        heading: "Services",
        headingIcon: ServerIcon,
        items: [
            {
                url: "/user/bill/pay",
                label: "Utility Pay",
                icon: TicketIcon,
                featureKey: "bill_pay",
            },
            {
                url: "/user/mobile/topup",
                label: "Mobile TopUp",
                icon: DevicePhoneMobileIcon,
                featureKey: "mobile_top_up",
            },
        ],
    },
    {
        heading: "Ecommerce",
        headingIcon: ShoppingBagIcon,
        items: [
            {
                url: "/user/order",
                label: "Orders",
                icon: ArrowDownOnSquareStackIcon,
            },
        ],
    },
    {
        heading: "Security",
        headingIcon: LockOpenIcon,
        items: [
            {
                url: "/user/security/google/2fa",
                label: "2FA Security",
                icon: LockClosedIcon,
            },
            {
                url: "/user/setup/pin",
                label: "Setup Pin",
                icon: EllipsisHorizontalIcon,
            },
        ],
    },
    {
        heading: "Cards",
        headingIcon: CreditCardIcon,
        items: [
            {
                url: "/user/cards/virtual-card",
                label: "Virtual Card",
                icon: CreditCardIcon,
                featureKey: "virtual_card",
            },
            {
                url: "/user/cards/gift-card",
                label: "Gift Card",
                icon: GiftIcon,
                featureKey: "gift_cards",
            },
        ],
    },
    {
        heading: "Transactions",
        headingIcon: MapIcon,
        items: [
            {
                url: "/user/transactions/all",
                label: "All Transactions",
                icon: ChartBarSquareIcon,
            },
            {
                url: "/user/transactions/add-money",
                label: "Add Balance",
                icon: SquaresPlusIcon,
                featureKey: "add_money",
            },
            {
                url: "/user/transactions/withdraw",
                label: "Payment Request",
                icon: ArrowsPointingOutIcon,
                featureKey: "withdraw_money",
            },
            {
                url: "/user/transactions/money-exchange",
                label: "Rate Converter",
                icon: PresentationChartBarIcon,
                featureKey: "money_exchange",
            },
            {
                url: "/user/transactions/send-money",
                label: "P2P Transfer",
                icon: WalletIcon,
                featureKey: "send_money",
            },
            {
                url: "/user/transactions/make-payment",
                label: "Merchant Pay",
                icon: BanknotesIcon,
                featureKey: "make_payment",
            },
            {
                url: "/user/transactions/money-out",
                label: "Cash Out",
                icon: ArrowUpOnSquareIcon,
                featureKey: "money_out",
            },
            {
                url: "/user/transactions/request-money",
                label: "Request Money",
                icon: DocumentMinusIcon,
                featureKey: "request_money",
            },
            {
                url: "/user/transactions/payment-link",
                label: "Payment Link",
                icon: LinkIcon,
                featureKey: "pay_link",
            },
            {
                url: "/user/transactions/bill-pay",
                label: "Utility Bill",
                icon: TicketIcon,
                featureKey: "bill_pay",
            },
            {
                url: "/user/transactions/mobile-topup",
                label: "Mobile TopUp",
                icon: DevicePhoneMobileIcon,
                featureKey: "mobile_top_up",
            },
            {
                url: "/user/transactions/point-conversion",
                label: "Point Conversion",
                icon: CurrencyPoundIcon,
            },
            {
                url: "/user/transactions/referral-bonus",
                label: "Referral Bonus",
                icon: TrophyIcon,
            },
            {
                url: "/user/transactions/affiliate-plan",
                label: "Verify Plan",
                icon: SignalIcon,
            },
            {
                url: "/user/transactions/virtual-card",
                label: "Virtual Card",
                icon: CreditCardIcon,
                featureKey: "virtual_card",
            },
            {
                url: "/user/transactions/gift-card",
                label: "Gift Card",
                icon: GiftIcon,
                featureKey: "gift_cards",
            },
        ],
    },
    {
        heading: "Account",
        headingIcon: PuzzlePieceIcon,
        items: [
            {
                url: "/user/user/profile",
                label: "Profile",
                icon: UserIcon,
            },
            {
                url: "/user/refer/level",
                label: "Referral Status",
                icon: CheckBadgeIcon,
            },
            {
                url: "/user/affiliate-plan",
                label: "Verify Plan",
                icon: ReceiptPercentIcon,
            },
            {
                url: "/user/point",
                label: "Point to Cash",
                icon: CircleStackIcon,
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const { canRefer, canWithdraw } = useFeatureAccess();
    const [openSectionIndex, setOpenSectionIndex] = useState(() => {
        const initialIndex = navLink
            .slice(1)
            .findIndex((section) =>
                section.items.some((item) => item.url === pathname),
            );
        return initialIndex === -1 ? null : initialIndex;
    });
    const { dashboardData, loading } = useDashboardData();

    if (loading) return <SidebarSkeleton />;

    const featureFlags = dashboardData?.module_access;

    const filteredNavLinks = navLink
        ?.map((section) => ({
            ...section,
            items: section.items?.filter(
                (item) => !item.featureKey || featureFlags[item.featureKey],
            ),
        }))
        ?.filter((section) => section.items?.length > 0);

    const onLogout = async (e) => {
        e.preventDefault();

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
        }
    };

    return (
        <>
            <div className="lg:hidden fixed top-[50%] transform translate-y-[-50%] left-[-10px] z-50">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="py-1 px-2 bg-primary__color shadow-md rounded-md"
                >
                    <Bars3CenterLeftIcon className="w-6 h-6 text-white relative left-1" />
                </button>
            </div>

            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed top-0 left-0 w-screen h-screen bg-black opacity-20 z-[9997] transition-all block lg:hidden"
                />
            )}

            <section
                className={`w-[250px] h-[calc(100vh-32px)] fixed top-4 z-[9998] lg:z-10 lg:left-4 rounded-[12px] px-3 py-6 bg-white transition-all overflow-hidden ${isSidebarOpen ? "left-4" : "-left-full"}`}
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
                            {filteredNavLinks[0]?.items.map((item, index) => (
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
                            {filteredNavLinks
                                ?.slice(1)
                                ?.map((section, sectionIndex) => {
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
                                                            (
                                                                item,
                                                                itemIndex,
                                                            ) => {
                                                                if (
                                                                    item.label ===
                                                                        "Withdraw" &&
                                                                    !canWithdraw
                                                                )
                                                                    return null;
                                                                if (
                                                                    item.label ===
                                                                        "Referral Status" &&
                                                                    !canRefer
                                                                )
                                                                    return null;

                                                                return (
                                                                    <li
                                                                        key={
                                                                            itemIndex
                                                                        }
                                                                    >
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
                                                                                className={`flex items-center text-sm font-medium rounded-[10px] px-3 py-2 transition-all hover:text-primary__color ${
                                                                                    pathname ===
                                                                                    item.url
                                                                                        ? "text-primary__color bg-[#F5F7FF] py-3"
                                                                                        : "text-color__paragraph"
                                                                                }`}
                                                                            >
                                                                                <div>
                                                                                    <item.icon
                                                                                        className={`size-4 transition-all ${
                                                                                            pathname ===
                                                                                            item.url
                                                                                                ? "fill-primary__color"
                                                                                                : "fill-color__paragraph"
                                                                                        }`}
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
                                                                );
                                                            },
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
                                href="/support/ticket"
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

const SidebarSkeleton = () => {
    return (
        <div className="w-[250px] h-[calc(100vh-32px)] fixed top-4 z-[9998] lg:z-10 lg:left-4 rounded-[12px] px-3 py-6  transition-all overflow-hidden bg-white border-r border-gray-100 flex flex-col p-6 animate-pulse">
            {/* Logo Area */}
            <div className="mb-10 flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 space-y-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div
                        key={item}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon Placeholder */}
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                            {/* Text Placeholder */}
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        {/* Arrow Placeholder (except for first item) */}
                        {item !== 1 && (
                            <div className="h-3 w-3 bg-gray-100 rounded"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Help Center Card Placeholder */}
            <div className="mt-auto bg-blue-50/50 rounded-2xl p-5 space-y-3">
                <div className="h-4 w-28 bg-gray-200 rounded mx-auto"></div>
                <div className="h-3 w-36 bg-gray-100 rounded mx-auto"></div>
                <div className="h-10 w-full bg-indigo-200 rounded-xl mt-2"></div>
            </div>
        </div>
    );
};
