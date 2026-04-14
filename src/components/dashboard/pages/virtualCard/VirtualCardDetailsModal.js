import {
    ArrowDownLeftIcon,
    ArrowRightIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    ArrowPathIcon,
    WifiIcon,
} from "@heroicons/react/24/outline";

import { copyToClipboard } from "@/components/utility/copyToClipboard";
import Modal from "@/components/ui/Modal";
import { useEffect, useLayoutEffect, useState } from "react";
import {
    stroWalletCardDetailsGetAPI,
    stroWalletCardFreezedAPI,
    stroWalletCardMakeDefaultOrRemove,
    stroWalletCardUnfreezeAPI,
} from "@root/services/apiClient/apiClient";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { handleApiError } from "@/components/utility/handleApiError";
import { handleApiSuccess } from "@/components/utility/handleApiSuccess";
import { useLocale, useTranslations } from "next-intl";

export default function VirtualCardDetailsModal({
    open,
    onClose,
    cardId,
    setOpenDepositModal,
    setMyVirtualCard,
}) {
    const t = useTranslations("Dashboard.cards.virtualCard.virtualCardDetails");
    const lang = useLocale();
    const [show, setShow] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState({});
    const [cardFreezeLoading, setCardFreezeLoading] = useState(false);
    const [myCard, setMyCard] = useState({});
    const [makeDefaultLoading, setMakeDefaultLoading] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState(false);

    useEffect(() => {
        (async () => {
            setDetailsLoading(true);

            try {
                const result = await stroWalletCardDetailsGetAPI(cardId, lang);
                setCardDetails(result.data?.data);
                setMyCard(result.data?.data?.myCards);
            } catch (error) {
                handleApiError(error, t("failedToFetchCardDetails"));
            } finally {
                setDetailsLoading(false);
            }
        })();
    }, [cardId, statusUpdate]);

    // virtual card freeze handler

    const handleVirtualCardFreeze = async () => {
        if (!myCard?.card_id) return; // safety check

        try {
            setCardFreezeLoading(true); // start loading

            const formData = new FormData();
            formData.append("card_id", myCard?.card_id);

            const result = await stroWalletCardFreezedAPI(formData, lang);

            handleApiSuccess(result);
            setStatusUpdate(!statusUpdate);
        } catch (error) {
            handleApiError(error);
        } finally {
            setCardFreezeLoading(false); // stop loading
        }
    };

    // stroWallet virtual card unfreeze handler
    const handleVirtualCardUnfreeze = async () => {
        if (!myCard?.card_id) return; // safety check

        try {
            setCardFreezeLoading(true); // reuse same loading state

            const formData = new FormData();
            formData.append("card_id", myCard?.card_id); // pass card_id if API requires

            const result = await stroWalletCardUnfreezeAPI(formData, lang);

            handleApiSuccess(result);
            setStatusUpdate(!statusUpdate);
        } catch (error) {
            handleApiError(error, t("failedToUnfreezeCard"));
        } finally {
            setCardFreezeLoading(false); // stop loading
        }
    };

    //stroWallet virtual card add fund handler
    const handleMakeDefaultAndRemove = async () => {
        if (!myCard?.card_id) return; // safety check

        try {
            setMakeDefaultLoading(true); // start fund loading

            const formData = new FormData();
            formData.append("card_id", myCard?.card_id);

            const result = await stroWalletCardMakeDefaultOrRemove(formData, lang);

            handleApiSuccess(result, t("statusUpdatedSuccessfully"));
            setStatusUpdate(!statusUpdate);
        } catch (error) {
            handleApiError(error, t("failedToUpdateStatus"));
        } finally {
            setMakeDefaultLoading(false); // stop loading
        }
    };

    //card number secret hide/visible condition
    const accountNo = myCard?.card_number;
    const firstSix = accountNo?.slice(0, 6);
    const lastFour = accountNo?.slice(-4);
    const secretNo = accountNo
        ? `${firstSix?.slice(0, 4)} ${firstSix?.slice(4, 6)}*******${lastFour?.slice(0, 2)} ${lastFour?.slice(2)}`
        : t("cardNumberNotFound");
    const formatAcNo = accountNo
        ? `${accountNo?.slice(0, 4)} ${accountNo?.slice(4, 8)} ${accountNo?.slice(8, 12)} ${accountNo?.slice(12, accountNo?.length)}`
        : t("cardNumberNotFound");

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title={t("title")}
                description={t("description")}
            >
                {/* Content */}
                {detailsLoading ? (
                    <VirtualCardDetailsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* LEFT – CARD */}

                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div
                                    style={
                                        myCard?.card_bg
                                            ? {
                                                  backgroundImage: `url(${myCard?.card_bg})`,
                                              }
                                            : {}
                                    }
                                    className="bg-cover bg-center w-full max-w-[480px] hover:shadow-lg duration-300 from-blue-500/85 to-blue-700/85 rounded-3xl p-4 md:p-8 text-white shadow relative overflow-hidden"
                                >
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="grid grid-cols-8 grid-rows-8 gap-1 h-full w-full">
                                            {Array.from({
                                                length: 64,
                                            }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white/10 rounded"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <h3 className="text-lg xl:text-xl  text-white font-semibold  ">
                                                        {myCard?.site_title}{" "}
                                                    </h3>
                                                    {myCard?.is_default && (
                                                        <span className="font-normal  text-white px-2 py-[2px] rounded-full border border-green-500 text-xs ">
                                                            {t("defaultBadge")}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 items-center">
                                                    <div className="p-3 rounded-lg">
                                                        <div className="chip">
                                                            <div className="chip-line" />
                                                            <div className="chip-line" />
                                                            <div className="chip-line" />
                                                            <div className="chip-line" />
                                                            <div className="chip-main" />
                                                        </div>
                                                    </div>
                                                    <WifiIcon className="rotate-90 h-[30px] w-[30px]" />
                                                </div>
                                            </div>

                                            {/* QR */}
                                            <div className=" rounded-xl flex items-center gap-2">
                                                <div
                                                    onClick={() =>
                                                        setShow(!show)
                                                    }
                                                    className=" w-[28px] h-[24px] cursor-pointer border rounded-md flex items-center justify-center"
                                                >
                                                    <EyeIcon className="w-[18px] h-[18px]" />
                                                </div>
                                                <div
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            `${myCard.name}, ${myCard.card_number}, ${myCard?.cvv}, ${myCard?.expiry}`,
                                                            t(
                                                                "cardDetailsCopied",
                                                            ),
                                                        )
                                                    }
                                                    className=" w-[28px] h-[24px] cursor-pointer border rounded-md flex items-center justify-center"
                                                >
                                                    <DocumentDuplicateIcon className="w-[18px] h-[18px]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Number */}
                                        <div className="flex gap-2  my-2 ">
                                            <div className="text-sm md:text-xl tracking-widerfont-mono">
                                                {show ? (
                                                    <span className="tracking-[2px]">
                                                        {formatAcNo}
                                                    </span>
                                                ) : (
                                                    <span className="tracking-[2px]">
                                                        {secretNo}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                onClick={() =>
                                                    copyToClipboard(
                                                        myCard?.card_number,
                                                    )
                                                }
                                                title={t("copy")}
                                                className=" w-[28px] h-[24px] cursor-pointer rounded-md flex items-center justify-center"
                                            >
                                                <DocumentDuplicateIcon className="w-[18px] h-[18px]" />
                                            </div>
                                        </div>
                                        {/* Card Name */}
                                        <div className="text-xs md:text-base xl:text-base 2xl:text-lg  mb-2 ">
                                            {myCard?.name}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex justify-between items-end">
                                            <div className="flex gap-6 items-center">
                                                <div>
                                                    <p className="text-xs opacity-90">
                                                        {t("exp")}
                                                    </p>
                                                    <div className="text-base md:text-lg font-semibold flex items-center gap-1">
                                                        <span>
                                                            {myCard?.expiry}
                                                        </span>
                                                        <div
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    myCard?.expiry,
                                                                )
                                                            }
                                                            title={t(
                                                                "copyExpiryDate",
                                                            )}
                                                            className=" w-[28px] h-[24px] cursor-pointer rounded-md flex items-center justify-center"
                                                        >
                                                            <DocumentDuplicateIcon className="w-[18px] h-[18px]" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs opacity-90">
                                                        {t("cvv")}
                                                    </p>
                                                    <div className="text-base md:text-lg  font-semibold flex items-center gap-1">
                                                        <span>
                                                            {show
                                                                ? myCard?.cvv
                                                                : "***"}
                                                        </span>

                                                        <div
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    myCard?.cvv,
                                                                )
                                                            }
                                                            title={t("copy")}
                                                            className=" w-[28px] h-[24px]  rounded-md flex items-center justify-center"
                                                        >
                                                            <DocumentDuplicateIcon className="w-[18px] h-[18px]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xl font-semibold bg-white p-2 rounded-lg">
                                                {myCard?.card_brand ===
                                                    "visa" && (
                                                    <Image
                                                        src="/images/icon/visa.png"
                                                        height={20}
                                                        width={50}
                                                        alt="VISA Logo"
                                                    />
                                                )}
                                                {myCard?.card_brand ===
                                                    "master" && (
                                                    <Image
                                                        src="/images/icon/mastercard.png"
                                                        height={20}
                                                        width={50}
                                                        alt="Mastercard Logo"
                                                    />
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row w-full gap-2 items-center">
                                <div className="w-full flex flex-col items-center border rounded-xl p-4 bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-1">
                                        {t("balance")}
                                    </p>
                                    <p className="text-base font-medium text-gray-900">
                                        {myCard?.amount?.toFixed(2)}{" "}
                                        {myCard?.currency}
                                    </p>
                                </div>
                                <div className="w-full flex flex-col items-center border rounded-xl p-4 bg-gray-50">
                                    <p className="text-sm text-gray-00 mb-1">
                                        {t("cardType")}
                                    </p>
                                    <p className="text-base font-medium text-gray-900">
                                        {myCard?.card_type}
                                    </p>
                                </div>
                                <div className="w-full flex flex-col items-center border rounded-xl p-4 bg-gray-50">
                                    <p className="text-sm text-gray-500 mb-1">
                                        {t("currency")}
                                    </p>
                                    <p className="text-base font-medium text-gray-900">
                                        {myCard?.currency}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full border rounded-xl p-4 bg-gray-50">
                                <p className="text-sm text-gray-500 font-semibold mb-1">
                                    {t("cardDetailsHeading")}
                                </p>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: myCard?.card_back_details,
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* RIGHT – ACTIONS */}
                        <div className="space-y-4">
                            <div className="border rounded-xl p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-neutral-800 mb-1">
                                        {t("billingAddress")}
                                    </p>
                                    <div
                                        title={t("copy")}
                                        onClick={() =>
                                            copyToClipboard(
                                                cardDetails?.business_address
                                                    ?.map(
                                                        (item) =>
                                                            `${item?.label_name} : ${item?.value}`,
                                                    )
                                                    .join(", "),
                                            )
                                        }
                                        className=" w-[28px] h-[24px] cursor-pointer border bg-gray-50 border-gray-300 rounded-md flex items-center justify-center"
                                    >
                                        <DocumentDuplicateIcon className="w-[18px] h-[18px]" />
                                    </div>
                                </div>
                                <div className="">
                                    <div className="text-sm font-medium bg-gray-50 rounded-lg p-2 md:p-4 space-y-2">
                                        {!Array.isArray(
                                            cardDetails?.business_address,
                                        ) ||
                                        cardDetails?.business_address?.length <
                                            1 ? (
                                            <div className="flex items-center justify-center ">
                                                <span>
                                                    {t("noAddressFound")}
                                                </span>
                                            </div>
                                        ) : (
                                            cardDetails?.business_address?.map(
                                                (address) => (
                                                    <div key={address?.id}>
                                                        <div className="flex justify-between ">
                                                            <span className="text-neutral-700">
                                                                {
                                                                    address?.label_name
                                                                }
                                                            </span>
                                                            <span>
                                                                {address?.value}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={`/user/cards/virtual-card/transaction?card_id=${myCard?.card_id}`}
                                className="w-full flex gap-2 items-center justify-center py-3 rounded-xl border font-medium hover:bg-gray-50"
                            >
                                <span>{t("viewTransactions")}</span>{" "}
                                <ArrowRightIcon className="w-[18px] h-[18px]" />
                            </Link>
                            <button
                                onClick={() => {
                                    setMyVirtualCard(myCard);
                                    setOpenDepositModal(true);
                                    onClose();
                                }}
                                className=" flex gap-2 items-center justify-center w-full py-3 rounded-xl bg-emerald-700 text-white font-medium hover:bg-emerald-800"
                            >
                                <span>{t("deposit")}</span>{" "}
                                <ArrowDownLeftIcon className="w-[18px] h-[18px]" />
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleMakeDefaultAndRemove}
                                    className={`${myCard?.is_default ? "text-red-500 bg-red-50 hover:bg-red-100 border-red-500" : ""} hover:bg-gray-50 flex duration-200 gap-2 items-center justify-center py-3 rounded-xl border font-medium `}
                                >
                                    {myCard?.is_default ? (
                                        <span>{t("removeDefault")}</span>
                                    ) : (
                                        <span>
                                            {makeDefaultLoading
                                                ? t("makingDefault")
                                                : t("makeDefault")}
                                        </span>
                                    )}
                                    {makeDefaultLoading ? (
                                        <ArrowPathIcon className="animate-spin w-[18px] h-[18px]" />
                                    ) : (
                                        <ArrowRightIcon className="w-[18px] h-[18px]" />
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        if (myCard.status === true) {
                                            handleVirtualCardFreeze();
                                        } else {
                                            handleVirtualCardUnfreeze();
                                        }
                                    }}
                                    className={`${cardFreezeLoading && "bg-sky-100 animate-pulse "} ${myCard?.status === false && "!text-sky-500 bg-sky-50 border-sky-200 hover:bg-sky-100"} flex gap-2 duration-200 items-center justify-center  py-3 rounded-xl border font-medium hover:bg-gray-50`}
                                >
                                    <span>
                                        {myCard?.status === false
                                            ? t("unfreeze")
                                            : t("freeze")}
                                    </span>
                                    <span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`lucide lucide-snowflake-icon lucide-snowflake ${cardFreezeLoading && "animate-spin"}`}
                                        >
                                            <path d="m10 20-1.25-2.5L6 18" />
                                            <path d="M10 4 8.75 6.5 6 6" />
                                            <path d="m14 20 1.25-2.5L18 18" />
                                            <path d="m14 4 1.25 2.5L18 6" />
                                            <path d="m17 21-3-6h-4" />
                                            <path d="m17 3-3 6 1.5 3" />
                                            <path d="M2 12h6.5L10 9" />
                                            <path d="m20 10-1.5 2 1.5 2" />
                                            <path d="M22 12h-6.5L14 15" />
                                            <path d="m4 10 1.5 2L4 14" />
                                            <path d="m7 21 3-6-1.5-3" />
                                            <path d="m7 3 3 6h4" />
                                        </svg>
                                    </span>
                                </button>
                            </div>

                            {/* <button className="flex gap-2 items-center justify-center w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100">
                                <span>Close Card</span> <X size={18} />
                            </button> */}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}

function VirtualCardDetailsSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            {/* LEFT – CARD PREVIEW + INFO */}
            <div className="space-y-4">
                {/* Card */}
                <div className="bg-gradient-to-br from-neutral-500/50 to-neutral-700/50 rounded-3xl p-4 md:p-6 text-white shadow-xl relative overflow-hidden">
                    {/* Subtle background pattern placeholder */}
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

                    <div className="relative z-10 space-y-6">
                        {/* Brand + Icons */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="h-7 bg-white/40 rounded w-40" />
                                <div className="flex gap-4">
                                    <div className="w-14 h-10 bg-white/30 rounded" />
                                    <div className="w-10 h-10 bg-white/30 rounded-full" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 bg-white/30 rounded-md" />
                                <div className="w-8 h-8 bg-white/30 rounded-md" />
                            </div>
                        </div>

                        {/* Card Number */}
                        <div className="flex items-center gap-3">
                            <div className="h-8 bg-white/40 rounded w-64" />
                            <div className="w-8 h-8 bg-white/30 rounded-md" />
                        </div>

                        {/* Expiry + CVV + Brand */}
                        <div className="flex justify-between items-end">
                            <div className="space-y-3">
                                <div className="h-4 bg-white/30 rounded w-24" />
                                <div className="h-6 bg-white/40 rounded w-32" />
                            </div>
                            <div className="h-6 bg-white/30 rounded w-20" />
                            <div className="h-8 bg-white/40 rounded w-16" />
                        </div>
                    </div>
                </div>

                {/* Bottom Stats (Balance, Type, Environment) */}
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-xl p-5">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
                            <div className="h-6 bg-gray-200 rounded w-28" />
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT – ACTIONS & BILLING */}
            <div className="space-y-6">
                {/* Billing Address */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                    <div className=" flex justify-between items-center gap-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="w-6 h-6 bg-gray-200 rounded-md" />
                    </div>
                </div>

                {/* View Transactions */}
                <div className="h-12 bg-gray-100 rounded-xl" />

                {/* Deposit Button */}
                <div className="h-14 bg-emerald-600/30 rounded-xl" />

                {/* Withdraw + Freeze */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-gray-200 rounded-xl" />
                    <div className="h-12 bg-gray-200 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
