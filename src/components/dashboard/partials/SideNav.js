"use client";
// Packages
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { logoutAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useFeatureAccess } from "@/components/hooks/useFeatureAccess";
import { useTranslations } from "next-intl";
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
import {
    CreditCardIcon,
    GiftIcon,
    ChevronLeftIcon,
    ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useDashboardData } from "@/components/context/DashboardContext";

// Nav Links Data
export const navLink = [
    {
        items: [
            {
                url: "/user/dashboard",
                label: "dashboard",
                icon: RectangleStackIcon,
            },
        ],
    },
    {
        heading: "wallet",
        headingIcon: WalletIcon,
        items: [
            {
                url: "/user/add/money",
                label: "addBalance",
                icon: SquaresPlusIcon,
                featureKey: "add_money",
            },
            {
                url: "/user/withdraw/money",
                label: "paymentRequest",
                icon: ArrowsPointingOutIcon,
                featureKey: "withdraw_money",
            },
            {
                url: "/user/money/exchange",
                label: "rateConverter",
                icon: PresentationChartBarIcon,
                featureKey: "money_exchange",
            },
            {
                url: "/user/receive-money",
                label: "myQrCode",
                icon: ReceiptRefundIcon,
                featureKey: "receive_money",
            },
            {
                url: "/user/send-money",
                label: "p2pTransfer",
                icon: PaperAirplaneIcon,
                featureKey: "send_money",
            },
            {
                url: "/user/make/payment",
                label: "merchantPay",
                icon: BanknotesIcon,
                featureKey: "make_payment",
            },
            {
                url: "/user/money/out",
                label: "cashOut",
                icon: ArrowUpOnSquareIcon,
                featureKey: "money_out",
            },
            {
                url: "/user/money/request",
                label: "requestMoney",
                icon: DocumentMinusIcon,
                featureKey: "request_money",
            },
            {
                url: "/user/payment/link",
                label: "paymentLink",
                icon: LinkIcon,
                featureKey: "pay_link",
            },
        ],
    },
    {
        heading: "services",
        headingIcon: ServerIcon,
        items: [
            {
                url: "/user/bill/pay",
                label: "utilityPay",
                icon: TicketIcon,
                featureKey: "bill_pay",
            },
            {
                url: "/user/mobile/topup",
                label: "mobileTopUp",
                icon: DevicePhoneMobileIcon,
                featureKey: "mobile_top_up",
            },
        ],
    },
    {
        heading: "ecommerce",
        headingIcon: ShoppingBagIcon,
        items: [
            {
                url: "/user/order",
                label: "orders",
                icon: ArrowDownOnSquareStackIcon,
            },
        ],
    },
    {
        heading: "security",
        headingIcon: LockOpenIcon,
        items: [
            {
                url: "/user/security/google/2fa",
                label: "twoFaSecurity",
                icon: LockClosedIcon,
            },
            {
                url: "/user/setup/pin",
                label: "setupPin",
                icon: EllipsisHorizontalIcon,
            },
        ],
    },
    {
        heading: "cards",
        headingIcon: CreditCardIcon,
        items: [
            {
                url: "/user/cards/virtual-card",
                label: "virtualCard",
                icon: CreditCardIcon,
                featureKey: "virtual_card",
            },
            {
                url: "/user/cards/gift-card",
                label: "giftCard",
                icon: GiftIcon,
                featureKey: "gift_cards",
            },
        ],
    },
    {
        heading: "transactions",
        headingIcon: MapIcon,
        items: [
            {
                url: "/user/transactions/all",
                label: "allTransactions",
                icon: ChartBarSquareIcon,
            },
            {
                url: "/user/transactions/add-money",
                label: "addBalance",
                icon: SquaresPlusIcon,
                featureKey: "add_money",
            },
            {
                url: "/user/transactions/withdraw",
                label: "paymentRequest",
                icon: ArrowsPointingOutIcon,
                featureKey: "withdraw_money",
            },
            {
                url: "/user/transactions/money-exchange",
                label: "rateConverter",
                icon: PresentationChartBarIcon,
                featureKey: "money_exchange",
            },
            {
                url: "/user/transactions/send-money",
                label: "p2pTransfer",
                icon: WalletIcon,
                featureKey: "send_money",
            },
            {
                url: "/user/transactions/make-payment",
                label: "merchantPay",
                icon: BanknotesIcon,
                featureKey: "make_payment",
            },
            {
                url: "/user/transactions/money-out",
                label: "cashOut",
                icon: ArrowUpOnSquareIcon,
                featureKey: "money_out",
            },
            {
                url: "/user/transactions/request-money",
                label: "requestMoney",
                icon: DocumentMinusIcon,
                featureKey: "request_money",
            },
            {
                url: "/user/transactions/payment-link",
                label: "paymentLink",
                icon: LinkIcon,
                featureKey: "pay_link",
            },
            {
                url: "/user/transactions/bill-pay",
                label: "utilityBill",
                icon: TicketIcon,
                featureKey: "bill_pay",
            },
            {
                url: "/user/transactions/mobile-topup",
                label: "mobileTopUp",
                icon: DevicePhoneMobileIcon,
                featureKey: "mobile_top_up",
            },
            {
                url: "/user/transactions/point-conversion",
                label: "pointConversion",
                icon: CurrencyPoundIcon,
            },
            {
                url: "/user/transactions/referral-bonus",
                label: "referralBonus",
                icon: TrophyIcon,
            },
            {
                url: "/user/transactions/affiliate-plan",
                label: "verifyPlan",
                icon: SignalIcon,
            },
            {
                url: "/user/transactions/virtual-card",
                label: "virtualCard",
                icon: CreditCardIcon,
                featureKey: "virtual_card",
            },
            {
                url: "/user/transactions/gift-card",
                label: "giftCard",
                icon: GiftIcon,
                featureKey: "gift_cards",
            },
        ],
    },
    {
        heading: "account",
        headingIcon: PuzzlePieceIcon,
        items: [
            {
                url: "/user/user/profile",
                label: "profile",
                icon: UserIcon,
            },
            {
                url: "/user/refer/level",
                label: "referralStatus",
                icon: CheckBadgeIcon,
            },
            {
                url: "/user/affiliate-plan",
                label: "verifyPlan",
                icon: ReceiptPercentIcon,
            },
            {
                url: "/user/point",
                label: "pointToCash",
                icon: CircleStackIcon,
            },
        ],
    },
];

export default function SideNav() {
    const t = useTranslations("Dashboard.sidenav");
    const router = useRouter();
    const pathname = usePathname().slice(3);

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
                (item) => !item?.featureKey || featureFlags[item?.featureKey],
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
            <div className="lg:hidden fixed top-[50%] transform translate-y-[-50%] left-[-10px]  z-50">
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
                className={`w-[250px] h-[calc(100vh)] my-4 lg:my-0 rounded-lg lg:rounded-none fixed top-0 z-[9998] lg:z-10 lg:left-0 rtl:right-0 rtl:left-auto px-3 py-6 bg-white transition-all overflow-hidden ${isSidebarOpen ? "left-4" : "-left-full"}`}
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
                        <div className="sidebar-menu overflow-y-auto max-h-[calc(100vh-250px)] space-y-2">
                            {filteredNavLinks[0]?.items.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.url}
                                    className={`flex items-center  text-sm font-medium rounded-[10px] px-5 py-2 transition-all hover:text-primary__color ${pathname === item.url ? "text-primary__color bg-[#F5F7FF] py-3" : "text-color__paragraph"}`}
                                >
                                    <div className="">
                                        <item.icon
                                            className={`size-5 transition-all ${pathname === item.url ? "fill-primary__color" : "fill-color__paragraph"}`}
                                        />
                                    </div>
                                    <span className="ms-2">
                                        {t(item.label)}
                                    </span>
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
                                                        {t(section.heading)}
                                                    </span>
                                                </div>
                                                <ChevronRightIcon
                                                    className={`h-3 w-3 rtl:hidden transition-transform ${isOpen ? "rotate-90" : ""}`}
                                                />
                                                <ChevronLeftIcon
                                                    className={`h-3 w-3 ltr:hidden transition-transform ${isOpen ? "-rotate-90" : ""}`}
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
                                                <div className="ltr:pl-5 rtl:pr-5">
                                                    <ul className="space-y-1">
                                                        {section.items.map(
                                                            (
                                                                item,
                                                                itemIndex,
                                                            ) => {
                                                                if (
                                                                    item.label ===
                                                                        "paymentRequest" &&
                                                                    !canWithdraw
                                                                )
                                                                    return null;
                                                                if (
                                                                    item.label ===
                                                                        "referralStatus" &&
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
                                                                                    {t(
                                                                                        item.label,
                                                                                    )}
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
                                                                                    {t(
                                                                                        item.label,
                                                                                    )}
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
                        <div className="w-full p-4 rounded-2xl ">
                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className=" bg-gray-100 text-red-500 flex w-full justify-center items-center py-2 px-5 gap-2 font-semibold rounded-lg transition hover:bg-red-500 hover:text-white hover:scale-x-105"
                            >
                                <ArrowRightOnRectangleIcon className="size-5 stroke-2" />
                                {t("logout")}
                            </button>
                        </div>
                    </div>
                    {/* <div className="mt-5">
                        <div className="w-full p-4 rounded-2xl bg-gray-100">
                            <div className="flex items-center gap-2">
                                <h4 className="text-[18px] font-bold text-gray-800">
                                    {t("helpCenter")}
                                </h4>
                            </div>
                            <p className="leading-[17px] font-medium mt-2  text-gray-800">
                                {t("howCanWeHelp")}
                            </p>
                            <Link
                                href="/user/support/ticket"
                                className="mt-4 bg-gray-800 text-white flex justify-center items-center py-2 px-5 gap-2 font-semibold rounded-lg transition hover:bg-primary__color hover:text-white hover:scale-x-105"
                            >
                                {t("getSupport")}
                            </Link>
                        </div>
                    </div> */}
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
                                        {t("confirmLogout")}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {t("logoutConfirmText")}
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
                                            {t("cancel")}
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                            onClick={onLogout}
                                        >
                                            {t("logout")}
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
        <div className="w-[250px] h-[calc(100vh-32px)] fixed z-[9998] lg:z-10  rounded-[12px] px-3 py-6  transition-all overflow-hidden bg-white border-r border-gray-100 flex flex-col p-6 animate-pulse">
            {/* Logo Area */}
            <div className="mb-10 flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 space-y-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Icon Placeholder */}
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                            {/* Text Placeholder */}
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                        {/* Arrow Placeholder (except for first item) */}
                        {i !== 0 && (
                            <div className="h-3 w-3 bg-gray-100 rounded"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Help Center Card Placeholder */}
            <div className="mt-auto bg-gray-50 rounded-2xl  space-y-3">
                <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
            </div>
        </div>
    );
};
