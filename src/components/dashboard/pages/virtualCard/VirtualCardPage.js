"use client";

import "swiper/css";
import "swiper/css/navigation";
import { Suspense, useEffect, useState } from "react";
import { Plus, Wifi } from "lucide-react";
import VirtualCardTransaction from "./VirtualCardTransaction";
import VirtualCardDetailsModal from "./VirtualCardDetailsModal";
import { useRouter } from "@/i18n/navigation";
import {
    myStroWalletCardGetAPI,
    stroWalletPageInfoGetApi,
} from "@root/services/apiClient/apiClient";
import PendingModal from "../../partials/PendingModal";
import toast from "react-hot-toast";
import VirtualCardDepositModal from "./VirtualCardDepositModal";
import { handleApiError } from "@/components/utility/handleApiError";
import { useTranslations } from "next-intl";

function VirtualCardSection() {
    const t = useTranslations("Dashboard.cards.virtualCard.myVirtualCard");
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [stroWalletPageInfo, setStroWalletPageInfo] = useState({});
    const [openPendingModal, setOpenPendingModal] = useState(false);
    const [myWalletCards, setMyWalletCards] = useState([]);
    const [pageInfoLoading, setPageInfoLoading] = useState(false);
    const [myWalletCardLoading, setMyWalletCardLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState("");
    const [openDepositModal, setOpenDepositModal] = useState(false);
    const [myVirtualCard, setMyVirtualCard] = useState({});

    const cardBackground = myWalletCards?.card_basic_info?.card_bg;

    const myWalletCardsFetch = async () => {
        setMyWalletCardLoading(true);
        try {
            const result = await myStroWalletCardGetAPI();
            setMyWalletCards(result?.data?.data || []);
        } catch (error) {
            handleApiError(error);
        } finally {
            setMyWalletCardLoading(false);
        }
    };

    useEffect(() => {
        // fetch page info
        (async () => {
            setPageInfoLoading(true);
            try {
                const result = await stroWalletPageInfoGetApi();
                setStroWalletPageInfo(result?.data?.data || {});
            } catch (error) {
                toast.error(t("fetchError"));
            } finally {
                setPageInfoLoading(false);
            }
        })();
        // fetch wallet cards
        myWalletCardsFetch();
    }, [t]);

    const handleCreateCard = () => {
        const isCustomerExist = stroWalletPageInfo?.customer_exist_status;
        const isKycHigh = stroWalletPageInfo?.customer_kyc_status;

        if (!isCustomerExist) {
            router.push("/user/cards/virtual-card/create-customer");
        } else if (isKycHigh === "unreview kyc" || isKycHigh === "") {
            // handle show pending modal
            setOpenPendingModal(true);
        } else if (isKycHigh === "low kyc") {
            toast.error(t("kycLowError"));
            router.push("/user/cards/virtual-card/update-customer");
        } else if (isCustomerExist && isKycHigh === "high kyc") {
            router.push("/user/cards/virtual-card/create-virtual-card");
            sessionStorage.setItem(
                "base_currency",
                JSON.stringify(myWalletCards.supported_currency),
            );
            sessionStorage.setItem(
                "get_remaining_fields",
                JSON.stringify(myWalletCards?.get_remaining_fields),
            );
        } else {
            router.push("/user/cards/virtual-card/update-customer");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "success":
                return "bg-green-100 text-green-800";
            case "Rejected":
                return "bg-red-100 text-red-800";
            case "pending":
                return "bg-yellow-500 text-yellow-800";
            case "active":
                return "bg-green-500 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="min-h-screen bg-white rounded-2xl p-6 2xl:p-8 ">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                    {t("title")}
                </h1>
                {pageInfoLoading ? (
                    <button className="bg-gray-200 flex gap-2 items-center animate-pulse text-gray-200 font-medium px-4 md:px-6 py-2 md:py-3 rounded-lg transition">
                        <span>{t("createCard")}</span> <Plus size={18} />
                    </button>
                ) : (
                    <button
                        onClick={handleCreateCard}
                        className="flex items-center gap-2 bg-blue-600  hover:bg-blue-700 text-white font-medium px-4 md:px-6 py-2 md:py-3 rounded-lg transition"
                    >
                        <span>{t("createCard")}</span> <Plus size={18} />
                    </button>
                )}
            </div>

            {/* Virtual Card */}
            {!Array.isArray(myWalletCards?.myCards) ||
                (myWalletCards?.myCards?.length < 1 && (
                    <div className="h-[70vh] flex items-center justify-center">
                        <span className="text-base md:text-xl lg:text-2xl">
                            {t("noCardAvailable")}
                        </span>
                    </div>
                ))}

            {myWalletCardLoading ? (
                <VirtualCardGridSkeleton />
            ) : (
                <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                    {myWalletCards?.myCards?.map((card, idx) => (
                        <div
                            onClick={() => {
                                setCardDetails(card?.card_id);
                                setOpen(true);
                            }}
                            key={idx}
                            className="flex items-center justify-center cursor-pointer"
                        >
                            <div
                                style={
                                    cardBackground
                                        ? {
                                              backgroundImage: `url(${cardBackground})`,
                                          }
                                        : {}
                                }
                                className={`bg-cover bg-center  h-full w-full max-w-[420px] hover:shadow-lg duration-300 rounded-3xl p-4 md:p-4 xl:p-4 2xl:p-6 text-white shadow relative overflow-hidden`}
                            >
                                {/* Background Pattern (optional subtle) */}
                                {/* <div className="absolute inset-0 opacity-20">
                                    <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
                                        {Array.from({ length: 64 }).map(
                                            (_, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white/10 rounded"
                                                />
                                            ),
                                        )}
                                    </div>
                                </div> */}

                                {/* Card Content */}
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start ">
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <h3 className="text-lg xl:text-xl  text-white font-semibold  ">
                                                    {card?.site_title}{" "}
                                                </h3>
                                                {card?.is_default && (
                                                    <span className="font-normal  text-white px-2 py-[2px] rounded-full border border-green-500 text-xs ">
                                                        {t("default")}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <div className=" p-3 rounded-lg">
                                                    <div className="chip">
                                                        <div className="chip-line"></div>
                                                        <div className="chip-line"></div>
                                                        <div className="chip-line"></div>
                                                        <div className="chip-line"></div>
                                                        <div className="chip-main"></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Wifi className="rotate-90 text-4xl" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* QR Code */}
                                        <div className=" ">
                                            {/* card status */}
                                            <span className="text-white flex items-center gap-1">
                                                <span
                                                    className={`inline-block w-3 h-3 rounded-full ${getStatusColor(card?.card_status)}`}
                                                ></span>
                                                <span
                                                    className={`font-semibold tracking-wide uppercase mt-[2px]`}
                                                >
                                                    {card?.card_status}
                                                </span>
                                            </span>
                                            {/* <div className=" bg-gray-200 border-2 border-dashed rounded-xl" /> */}
                                        </div>
                                    </div>

                                    {/* Card Number */}
                                    <div className="text-xl xl:text-xl 2xl:text-2xl tracking-wider  font-mono">
                                        {card?.card_number
                                            ? `${card?.card_number?.slice(0, 4)} ${card?.card_number?.slice(4, 6)}*******${card?.card_number?.slice(-4)} 

                                        `
                                            : "**** ******** ****"}
                                    </div>
                                    {/* Card Name */}
                                    <div className="text-xs md:text-base xl:text-base 2xl:text-lg  mb-2 ">
                                        {card?.name}
                                    </div>

                                    {/* Expiry & Name */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            {/* <p className="text-xs xl:text-sm opacity-90">
                                                EXP. END
                                            </p> */}
                                            <p className="text-base md:text-lg 2xl:text-xl font-semibold">
                                                {card?.balance?.toFixed(2)}{" "}
                                                {card?.currency}
                                            </p>
                                        </div>
                                        {card?.expiry && (
                                            <div className="flex gap-1 items-center ">
                                                <p className="text-xs opacity-90">
                                                    {t("exp")}
                                                </p>
                                                <p className="text-base md:text-lg 2xl:text-xl font-semibold">
                                                    {card?.expiry}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div>
                <VirtualCardTransaction
                    transactions={myWalletCards?.transactions}
                    isLoading={myWalletCardLoading}
                />
            </div>

            {open && (
                <VirtualCardDetailsModal
                    open={open}
                    onClose={() => setOpen(false)}
                    cardId={cardDetails}
                    setOpenDepositModal={setOpenDepositModal}
                    setMyVirtualCard={setMyVirtualCard}
                />
            )}

            {openDepositModal && (
                <VirtualCardDepositModal
                    open={openDepositModal}
                    onClose={() => setOpenDepositModal(false)}
                    cardCurrencies={myWalletCards?.supported_currency}
                    cardCharge={myWalletCards?.cardCharge}
                    getRemainingFields={myWalletCards?.get_remaining_fields}
                    myVirtualCard={myVirtualCard}
                />
            )}

            {openPendingModal && (
                <PendingModal
                    open={openPendingModal}
                    onClose={() => setOpenPendingModal(false)}
                    title={t("pendingModalTitle")}
                    message={stroWalletPageInfo?.customer_low_kyc_text}
                />
            )}
        </div>
    );
}

export default function VirtualCardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VirtualCardSection />
        </Suspense>
    );
}

function VirtualCardGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-center">
                    <div className="bg-gradient-to-br from-neutral-500/60 to-neutral-700/60 w-full max-w-[480px] rounded-3xl p-4 md:p-8 shadow relative overflow-hidden">
                        {/* Background pattern placeholder */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
                                {Array.from({ length: 64 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white/20 rounded-sm"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Card content placeholders */}
                        <div className="relative z-10 space-y-4">
                            {/* Brand + chip + wifi + QR area */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="h-6 bg-white/40 rounded w-36" />
                                    <div className="flex gap-4">
                                        <div className="w-14 h-10 bg-white/30 rounded" />{" "}
                                        {/* chip */}
                                        <div className="w-10 h-10 bg-white/30 rounded-full" />{" "}
                                        {/* wifi */}
                                    </div>
                                </div>
                                {/* <div className="w-20 h-20 bg-white/30 rounded-xl" />{" "} */}
                                {/* QR placeholder */}
                            </div>

                            {/* Card number */}
                            <div className="h-6 bg-white/40 rounded w-64" />

                            {/* Expiry + CVV/Brand */}
                            <div className="flex justify-between items-end">
                                <div className="space-y-3">
                                    <div className="h-4 bg-white/30 rounded w-24" />
                                    <div className="h-4 bg-white/40 rounded w-32" />
                                </div>
                                <div className="h-4 bg-white/30 rounded w-20" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
