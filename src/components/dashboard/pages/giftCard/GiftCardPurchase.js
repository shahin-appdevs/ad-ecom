"use client";
import { useForm, Controller } from "react-hook-form";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import GiftCardBuyConfirmModal from "./GiftCardBuyConfirmModal";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { giftCardDetailsGetAPI } from "@root/services/apiClient/apiClient";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function GiftCardPurchase() {
    const searchParams = useSearchParams();

    const productId = searchParams.get("product_id");
    const countryParam = searchParams.get("country");

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState({});
    const [productCurrency, setProductCurrency] = useState({});
    const [countries, setCountries] = useState([]);
    const [userWallet, setUserWallet] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState({});
    const [selectedWallet, setSelectedWallet] = useState({});

    useEffect(() => {
        setLoading(true);
        if (productId) {
            (async () => {
                const result = await giftCardDetailsGetAPI(productId);
                const data = result?.data?.data;
                setProduct(data?.product);

                setProductCurrency(data?.productCurrency);
                setCountries(data?.countries);
                setUserWallet(data?.userWallet);

                setLoading(false);
            })();
        }
    }, [productId]);

    useEffect(() => {
        if (countries.length) {
            const ctry = countries.find((c) => c.name === countryParam);

            setSelectedCountry(ctry);
        }
    }, [countryParam, countries]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            amount: "",
            receiverEmail: "",
            country: countryParam,
            phoneNumber: "",
            fromName: "",
            quantity: 1,
            wallet_currency: "",
        },
    });

    useEffect(() => {
        if (product?.fixedRecipientDenominations?.length) {
            setValue("amount", product?.fixedRecipientDenominations?.[0]);
        }
    }, [product]);

    const selectedAmount = watch("amount");
    const receiverEmail = watch("receiverEmail");
    const phoneNumber = watch("phoneNumber");
    const fromName = watch("fromName");
    const country = watch("country");
    const quantity = watch("quantity");
    // const walletCurrency = watch("wallet_currency");

    const onSubmit = (data) => {
        setOpen(true);
    };

    return (
        <div className="min-h-screen">
            {loading ? (
                <GiftCardPurchaseSkeleton />
            ) : (
                <div className="w-full mx-auto">
                    <div className="bg-white rounded-2xl shadow overflow-hidden ">
                        <div className=" text-white py-4 px-8">
                            <h1 className="text-2xl lg:text-3xl font-bold text-center">
                                {product?.productName}
                            </h1>
                        </div>

                        <div className="p-8 lg:p-12">
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-8"
                            >
                                {/* Card Image & Amount Selection */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 place-items-center">
                                    <div className="lg:col-span-1 flex justify-center lg:justify-end w-full">
                                        <div className="relative w-full">
                                            {product?.logoUrls?.length > 0 && (
                                                <img
                                                    src={product?.logoUrls[0]}
                                                    alt={product?.productName}
                                                    className="rounded-xl shadow w-full"
                                                />
                                            )}

                                            {/* <div className="absolute inset-0 rounded-xl ring-4 ring-primary__color ring-opacity-20 pointer-events-none"></div> */}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-2 w-full">
                                        {/* Amount  */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-gray-800 mb-4">
                                                Amount{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            {product
                                                ?.fixedRecipientDenominations
                                                ?.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {product?.fixedRecipientDenominations?.map(
                                                        (amount) => (
                                                            <label
                                                                onClick={() =>
                                                                    setValue(
                                                                        "amount",
                                                                        amount,
                                                                    )
                                                                }
                                                                key={amount}
                                                                className={classNames(
                                                                    "relative cursor-pointer rounded-xl border p-4 text-center transition-all duration-200",
                                                                    selectedAmount?.toString() ===
                                                                        amount?.toString()
                                                                        ? "border-primary__color bg-primary__color/5 shadow-lg"
                                                                        : "border-gray-200 hover:border-gray-300 bg-white",
                                                                )}
                                                            >
                                                                {/* <input
                                                                type="radio"
                                                                value={amount}
                                                                {...register(
                                                                    "amount",
                                                                    {
                                                                        onClick:
                                                                            () =>
                                                                                setValue(
                                                                                    "amount",
                                                                                    amount,
                                                                                ),
                                                                        required: true,
                                                                    },
                                                                )}
                                                                className="sr-only"
                                                            /> */}
                                                                <span className="text-lg font-bold text-gray-900">
                                                                    {selectedAmount?.toString() ===
                                                                    amount?.toString() ? (
                                                                        <span className="text-primary__color">
                                                                            {
                                                                                amount
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        amount
                                                                    )}
                                                                </span>
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="amount"
                                                    {...register("amount", {
                                                        required:
                                                            "Amount is required",
                                                    })}
                                                    placeholder="Enter amount"
                                                    className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary__color focus:border-transparent transition"
                                                />
                                            )}

                                            {errors.amount && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.amount.message ||
                                                        "amount is required"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Form Fields Grid */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Receiver Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Receiver Email{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="email"
                                                    {...register(
                                                        "receiverEmail",
                                                        {
                                                            required:
                                                                "Email is required",
                                                        },
                                                    )}
                                                    placeholder="Enter Receiver Email Address"
                                                    className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary__color focus:border-transparent transition"
                                                />
                                                {errors.receiverEmail && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.receiverEmail
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Country */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Country{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <Controller
                                                    name="country"
                                                    control={control}
                                                    rules={{ required: true }}
                                                    render={({ field }) => (
                                                        <Menu
                                                            as="div"
                                                            className="relative"
                                                        >
                                                            <Menu.Button className="w-full flex justify-between items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-primary__color focus:border-transparent">
                                                                <span>
                                                                    {field.value ||
                                                                        "Select Country"}
                                                                </span>
                                                                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                                            </Menu.Button>
                                                            <Transition
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <Menu.Items className="absolute z-10 max-h-[250px] overflow-y-auto mt-2 w-full origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                    <div className="py-1">
                                                                        {countries.map(
                                                                            (
                                                                                country,
                                                                            ) => (
                                                                                <Menu.Item
                                                                                    key={
                                                                                        country.id
                                                                                    }
                                                                                >
                                                                                    {({
                                                                                        active,
                                                                                    }) => (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                field.onChange(
                                                                                                    country.name,
                                                                                                );
                                                                                                setSelectedCountry(
                                                                                                    country,
                                                                                                );
                                                                                            }}
                                                                                            className={classNames(
                                                                                                active
                                                                                                    ? "bg-gray-100"
                                                                                                    : "",
                                                                                                "block w-full text-left px-4 py-2 text-sm text-gray-700",
                                                                                            )}
                                                                                        >
                                                                                            {
                                                                                                country.name
                                                                                            }
                                                                                        </button>
                                                                                    )}
                                                                                </Menu.Item>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </Menu.Items>
                                                            </Transition>
                                                            {errors?.country && (
                                                                <p className="mt-1.5 text-sm text-red-600 font-normal flex items-center gap-1.5 animate-fade-in">
                                                                    {errors
                                                                        ?.wallet_currency
                                                                        ?.message ||
                                                                        "Please select a country"}
                                                                </p>
                                                            )}
                                                        </Menu>
                                                    )}
                                                />
                                            </div>

                                            {/* Phone Number */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <div className="flex">
                                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                                        <span className="text-primary__color font-bold">
                                                            {selectedCountry?.mobile_code
                                                                ? selectedCountry?.mobile_code
                                                                : "+"}
                                                        </span>
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        {...register(
                                                            "phoneNumber",
                                                            {
                                                                required:
                                                                    "Phone number is required",
                                                            },
                                                        )}
                                                        placeholder="Enter Phone Number"
                                                        className="flex-1 outline-none px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary__color focus:border-transparent"
                                                    />
                                                </div>
                                                {errors.phoneNumber && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors.phoneNumber
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* From Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    From Name{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("fromName", {
                                                        required:
                                                            "Name is required",
                                                    })}
                                                    placeholder="Your Name"
                                                    className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary__color focus:border-transparent"
                                                />
                                                {errors?.fromName && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {
                                                            errors?.fromName
                                                                ?.message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quantity{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    {...register("quantity", {
                                                        required: true,
                                                        min: 1,
                                                    })}
                                                    className="w-full outline-none px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary__color focus:border-transparent"
                                                />
                                            </div>

                                            {/* Wallet */}
                                            <div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        My Wallet
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Controller
                                                        name="wallet_currency"
                                                        control={control}
                                                        rules={{
                                                            required: true,
                                                        }}
                                                        render={({ field }) => (
                                                            <Menu
                                                                as="div"
                                                                className="relative"
                                                            >
                                                                <Menu.Button className="w-full flex justify-between items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-primary__color focus:border-transparent">
                                                                    <span>
                                                                        {field.value ||
                                                                            "Select Wallet"}
                                                                    </span>
                                                                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                                                </Menu.Button>
                                                                <Transition
                                                                    enter="transition ease-out duration-100"
                                                                    enterFrom="transform opacity-0 scale-95"
                                                                    enterTo="transform opacity-100 scale-100"
                                                                    leave="transition ease-in duration-75"
                                                                    leaveFrom="transform opacity-100 scale-100"
                                                                    leaveTo="transform opacity-0 scale-95"
                                                                >
                                                                    <Menu.Items className="absolute z-20 max-h-[200px] bottom-14 overflow-y-auto mt-2 w-full origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                        <div className="py-1">
                                                                            {userWallet?.map(
                                                                                (
                                                                                    wallet,
                                                                                ) => (
                                                                                    <Menu.Item
                                                                                        key={
                                                                                            wallet.name
                                                                                        }
                                                                                    >
                                                                                        {({
                                                                                            active,
                                                                                        }) => (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    field.onChange(
                                                                                                        wallet.name,
                                                                                                    );
                                                                                                    setSelectedWallet(
                                                                                                        wallet,
                                                                                                    );
                                                                                                }}
                                                                                                className={classNames(
                                                                                                    active
                                                                                                        ? "bg-gray-100"
                                                                                                        : "",
                                                                                                    "block w-full text-left px-4 py-2 text-sm text-gray-700",
                                                                                                )}
                                                                                            >
                                                                                                {
                                                                                                    wallet.name
                                                                                                }
                                                                                                {` (${wallet?.currency_code})`}
                                                                                            </button>
                                                                                        )}
                                                                                    </Menu.Item>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </Menu.Items>
                                                                </Transition>
                                                                {/* Error Message */}
                                                                {errors?.wallet_currency && (
                                                                    <p className="mt-1.5 text-sm text-red-600 font-normal flex items-center gap-1.5 animate-fade-in">
                                                                        {errors
                                                                            ?.wallet_currency
                                                                            ?.message ||
                                                                            "Please select a wallet currency"}
                                                                    </p>
                                                                )}
                                                            </Menu>
                                                        )}
                                                    />
                                                </div>

                                                {selectedWallet?.balance && (
                                                    <div className="text-sm text-gray-500 mt-2">
                                                        Available Balance:{" "}
                                                        <span className="font-bold text-primary__color">
                                                            {
                                                                selectedWallet?.balance
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Submit Button */}
                                        <div className="mt-4 lg:mt-6">
                                            <button
                                                type="submit"
                                                className="w-full bg-primary__color  text-white font-bold text-base lg:text-lg py-2 rounded-xl shadow-lg transform transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary__color/50"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <GiftCardBuyConfirmModal
                                    isOpen={open}
                                    closeModal={() => setOpen(false)}
                                    product={{
                                        productName: product.productName,
                                        productId: product?.productId,
                                        amount: selectedAmount,
                                        receiverEmail,
                                        country: selectedCountry?.iso2,
                                        phoneCode: selectedCountry?.mobile_code,
                                        phoneNumber,
                                        fromName,
                                        quantity,
                                        walletCurrency:
                                            selectedWallet.currency_code,
                                    }}
                                />
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function GiftCardPurchaseSkeleton() {
    return (
        <div className="w-full mx-auto p-4">
            <div className="bg-white rounded-2xl shadow p-4 md:p-6 animate-pulse">
                {/* Title */}
                <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-6" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Image Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="h-48 lg:h-full bg-gray-200 rounded-xl" />
                    </div>

                    {/* Right Form Skeleton */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Amount */}
                        <div>
                            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                            <div className="h-11 bg-gray-200 rounded-lg" />
                        </div>

                        {/* Email + Country */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                                <div className="h-11 bg-gray-200 rounded-lg" />
                            </div>
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                                <div className="h-11 bg-gray-200 rounded-lg" />
                            </div>
                        </div>

                        {/* Phone + From Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                                <div className="flex gap-2">
                                    <div className="w-16 h-11 bg-gray-200 rounded-lg" />
                                    <div className="flex-1 h-11 bg-gray-200 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                                <div className="h-11 bg-gray-200 rounded-lg" />
                            </div>
                        </div>

                        {/* Quantity + Wallet */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                                <div className="h-11 bg-gray-200 rounded-lg" />
                            </div>
                            <div>
                                <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
                                <div className="h-11 bg-gray-200 rounded-lg" />
                            </div>
                        </div>

                        {/* Button */}
                        <div className="pt-4">
                            <div className="h-12 bg-gray-300 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
