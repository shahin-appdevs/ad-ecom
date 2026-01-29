"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { PlusIcon, MinusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import {
    deliveryOptionGetAPI,
    onlineGatewaysGetAPI,
    orderConfirmAPI,
    divisionDataGetAPI,
} from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";
import { useCart } from "@/components/context/CartContext";
import { Listbox } from "@headlessui/react";
import { useSearchParams } from "next/navigation";

const ProductSkeleton = () => (
    <div className="flex items-start gap-4 border-b pb-4">
        <div className="w-20 h-20 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="flex gap-2 mt-3">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);

const FormSkeleton = () => (
    <div className="space-y-5">
        {[...Array(7)].map((_, i) => (
            <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
        ))}
        <div className="pt-2">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 animate-pulse"></div>
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-16 bg-gray-200 rounded animate-pulse"
                    ></div>
                ))}
            </div>
        </div>
    </div>
);

const SummarySkeleton = () => (
    <div className="border rounded-md py-8 px-4 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
        ))}
        <div className="h-10 bg-gray-200 rounded animate-pulse mt-4"></div>
    </div>
);

function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [isCheckout, setIsCheckout] = useState(false);
    const [isPayment, setIsPayment] = useState(false);
    const [deliveryOptions, setDeliveryOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [baseCurrency, setBaseCurrency] = useState({
        symbol: "৳",
        code: "BDT",
    });

    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);
    const [paymentGateways, setPaymentGateways] = useState([]);
    const [selectedGateway, setSelectedGateway] = useState("");
    const [selectedCurrencyAlias, setSelectedCurrencyAlias] = useState("");
    const {
        getAllCartItems,
        removeItemFromAllCarts,
        updateItemQuantity,
        clearAllCarts,
    } = useCart();
    const searchParams = useSearchParams();
    const referralCodeFromUrl = searchParams.get("referCode");
    const [storedReferralCode, setStoredReferralCode] = useState("");

    const [formData, setFormData] = useState({
        phone: "",
        name: "",
        address: "",
        shipping_address: "",
        division: "",
        district: "",
        upazilla: "",
        union: "",
        deliveryOption: "inside-dhaka",
        pay_type: "cash_on_delivery",
    });

    useEffect(() => {
        // Check both URL params and localStorage
        const localReferralCode = localStorage.getItem("product_refer_code");
        if (referralCodeFromUrl) {
            console.log("Referral code from URL:", referralCodeFromUrl);
            setStoredReferralCode(referralCodeFromUrl);
        } else if (localReferralCode) {
            console.log("Referral code from localStorage:", localReferralCode);
            setStoredReferralCode(localReferralCode);
        }
    }, [referralCodeFromUrl]);

    const loadCartItems = useCallback(() => {
        const allCartItems = getAllCartItems();
        // console.log("All cart items loaded:", allCartItems);
        setCartItems(allCartItems);
    }, [getAllCartItems]);

    useEffect(() => {
        loadCartItems();
    }, [storedReferralCode, loadCartItems]);

    useEffect(() => {
        const fetchDeliveryOptions = async () => {
            try {
                setLoading(true);
                const response = await deliveryOptionGetAPI();
                if (response.data.data) {
                    setDeliveryOptions(response.data.data.delivery_options);
                    setBaseCurrency({
                        symbol: response.data.data.base_curr_symbol || "৳",
                        code: response.data.data.base_curr || "BDT",
                    });
                    const insideDhaka =
                        response.data.data.delivery_options.find(
                            (option) => option.slug === "inside-dhaka",
                        );
                    if (insideDhaka) {
                        setDeliveryCharge(
                            parseFloat(insideDhaka.charge).toFixed(2),
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching delivery options:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeliveryOptions();
    }, []);

    useEffect(() => {
        const fetchPaymentGateways = async () => {
            try {
                const response = await onlineGatewaysGetAPI();
                if (response.data.data?.online_gateways) {
                    setPaymentGateways(response.data.data.online_gateways);
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            }
        };
        fetchPaymentGateways();
    }, []);

    const handleOrderConfirm = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const formDataToSend = new FormData();

            formDataToSend.append("phone", formData.phone);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("address", formData.address);
            formDataToSend.append(
                "shipping_address",
                formData.shipping_address,
            );
            formDataToSend.append("division", formData.division);
            formDataToSend.append("district", formData.district);
            formDataToSend.append("upazila", formData.upazilla);

            const selectedDelivery = deliveryOptions.find(
                (opt) => opt.slug === formData.deliveryOption,
            );
            formDataToSend.append(
                "delivery.charge",
                selectedDelivery?.charge || "70",
            );
            formDataToSend.append(
                "delivery.slug",
                selectedDelivery?.slug || "inside-dhaka",
            );

            cartItems.forEach((item, index) => {
                formDataToSend.append(`product_id[]`, item.id);
                formDataToSend.append(`product_price[]`, item.price);
                formDataToSend.append(`product_quantity[]`, item.quantity);
                if (storedReferralCode && item.product_refer_code) {
                    formDataToSend.append(
                        "product_refer_code[]",
                        item.product_refer_code,
                    );
                }
            });

            formDataToSend.append("pay_type", formData.pay_type);
            if (formData.pay_type === "online_payment") {
                formDataToSend.append("gateway", selectedGateway);
            }

            formDataToSend.append("gateway_currency", selectedCurrencyAlias);

            const productTotal = cartItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
            );
            formDataToSend.append("product_total_price", productTotal);
            formDataToSend.append(
                "grand_total",
                productTotal + parseFloat(deliveryCharge),
            );
            if (formData.pay_type === "online_payment") {
                formDataToSend.append(
                    "success_return_url",
                    `${window.location.origin}/checkout/order/success`,
                );
                formDataToSend.append(
                    "cancel_return_url",
                    `${window.location.origin}/checkout/order/cancel`,
                );
            }

            formDataToSend.append("source", "WEB");

            const response = await orderConfirmAPI(formDataToSend);

            if (response.data.message.success) {
                toast.success(response?.data?.message?.success?.[0]);

                clearAllCarts();

                const allCartTypes = [
                    "flashSaleCart",
                    "newArrivalCart",
                    "categoryProductsCart",
                    "campaignCart",
                    "collectionCart",
                    "brandCart",
                    "categoryCart",
                    "childSubCategoryCart",
                    "subCategoryCart",
                    "relatedProductCart",
                    "productDetailsCart",
                ];

                allCartTypes.forEach((cartKey) => {
                    localStorage.removeItem(cartKey);
                });

                if (
                    formData.pay_type === "online_payment" &&
                    response.data.data.redirect_url
                ) {
                    window.location.href = response.data.data.redirect_url;
                    return;
                } else if (formData.pay_type === "cash_on_delivery") {
                    window.location.href = "/checkout/order/success";
                    return;
                }
            } else {
                toast.error(response?.data?.message?.error?.[0]);
            }
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeliveryChange = (optionSlug) => {
        setFormData((prev) => ({
            ...prev,
            deliveryOption: optionSlug,
        }));
        const selectedOption = deliveryOptions.find(
            (option) => option.slug === optionSlug,
        );
        if (selectedOption) {
            setDeliveryCharge(parseFloat(selectedOption.charge));
        }
    };

    const formatCurrency = (amount) => {
        return `${baseCurrency.symbol}${parseFloat(amount).toFixed(2)}`;
    };

    // Fetch divisions on component mount
    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                const response = await divisionDataGetAPI();
                if (response.data.message.success) {
                    setDivisions(response.data.data.divisions);
                }
            } catch (error) {
                console.error("Error fetching divisions:", error);
            }
        };
        fetchDivisions();
    }, []);

    // Fetch districts when division is selected
    const fetchDistricts = async (divisionId) => {
        try {
            const response = await divisionDataGetAPI();
            if (response.data.message.success) {
                const filteredDistricts = response.data.data.districts.filter(
                    (district) =>
                        district.division_id === divisionId.toString(),
                );
                setDistricts(filteredDistricts);
                setFormData((prev) => ({
                    ...prev,
                    district: "",
                    upazilla: "",
                }));
                setUpazillas([]);
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };

    // Fetch upazillas when district is selected
    const fetchUpazillas = async (districtId) => {
        try {
            const response = await divisionDataGetAPI();
            if (response.data.message.success) {
                const filteredUpazillas = response.data.data.upazilas.filter(
                    (upazilla) =>
                        upazilla.district_id === districtId.toString(),
                );
                setUpazillas(filteredUpazillas);
                setFormData((prev) => ({
                    ...prev,
                    upazilla: "",
                }));
            }
        } catch (error) {
            console.error("Error fetching upazillas:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "division") {
            fetchDistricts(value);
        } else if (name === "district") {
            fetchUpazillas(value);
        } else if (name === "upazilla") {
        }
    };

    const updateQuantity = useCallback(
        (uniqueId, type, source) => {
            updateItemQuantity(uniqueId, type, source);
            loadCartItems();
        },
        [loadCartItems, updateItemQuantity],
    );

    const removeItem = useCallback(
        (uniqueId, source) => {
            removeItemFromAllCarts(uniqueId);
            loadCartItems();
            toast.success("Item removed from cart");
        },
        [loadCartItems, removeItemFromAllCarts],
    );

    const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const CustomListbox = ({
        label,
        value,
        onChange,
        options,
        error,
        disabled = false,
    }) => {
        return (
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
                <Listbox value={value} onChange={onChange} disabled={disabled}>
                    <div className="relative">
                        <Listbox.Button
                            className={`w-full text-left border-b ${error ? "border-red-500" : "border-gray-300"} py-2 px-1 focus:outline-none focus:border-primary__color bg-gray-50 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            <span className="block truncate">
                                {options.find((opt) => opt.value === value)
                                    ?.label || "Select"}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.value}
                                    value={option.value}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active
                                                ? "bg-blue-100 text-blue-900"
                                                : "text-gray-900"
                                        }`
                                    }
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                                            >
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                    <svg
                                                        className="h-5 w-5"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </div>
                </Listbox>
            </div>
        );
    };

    return (
        <section className="py-4 sm:py-8 bg-white rounded-md max-w-6xl mx-auto px-4 sm:px-8 sm:mt-8">
            <h2 className="text-lg md:text-xl font-bold mb-4">
                {loading ? (
                    <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                ) : (
                    `Shopping Bag (${cartItems.length} items)`
                )}
            </h2>
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {[...Array(2)].map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                    <SummarySkeleton />
                </div>
            ) : (
                <form
                    className="grid grid-cols-1 lg:grid-cols-3 items-start gap-6"
                    onSubmit={handleOrderConfirm}
                >
                    <div className="lg:col-span-2 space-y-6">
                        {!isCheckout ? (
                            cartItems.length > 0 ? (
                                cartItems.map((item, index) => (
                                    <div
                                        key={item.uniqueId}
                                        className="flex items-start gap-4 border-b pb-4"
                                    >
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={80}
                                            height={80}
                                            className="object-cover rounded h-[80px]"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-semibold">
                                                        {item.title}
                                                    </h5>
                                                    <div className="mt-1 text-sm flex items-center justify-between">
                                                        <div className="">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold">
                                                                    {item.base_curr_symbol ||
                                                                        "৳"}
                                                                    {parseFloat(
                                                                        item.price,
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                                {item.oldPrice && (
                                                                    <div className="flex items-center gap-2 text-sm mt-1">
                                                                        <span className="line-through text-gray-500">
                                                                            ৳
                                                                            {
                                                                                item.oldPrice
                                                                            }
                                                                        </span>
                                                                        <span className="text-orange-600">
                                                                            (
                                                                            {
                                                                                item.discount
                                                                            }{" "}
                                                                            ছাড়)
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {item.oldPrice && (
                                                                <p className="text-green-600">
                                                                    আপনি সেভ
                                                                    করছেন ৳
                                                                    {item.oldPrice -
                                                                        item.price}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="">
                                                            {(item.size ||
                                                                item.color) && (
                                                                <div className="text-sm font-semibold flex gap-2">
                                                                    {item.size && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">
                                                                                Size:
                                                                            </span>
                                                                            <span className="bg-gray-100 px-2 py-1 rounded">
                                                                                {
                                                                                    item.size
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {item.color && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">
                                                                                Color:
                                                                            </span>
                                                                            <span className="bg-gray-100 px-2 py-1 rounded">
                                                                                {
                                                                                    item.color
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.uniqueId,
                                                            item.source,
                                                        )
                                                    }
                                                    className="text-gray-500 hover:text-red-600"
                                                    aria-label="Remove item"
                                                >
                                                    <XMarkIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.uniqueId,
                                                            "decrement",
                                                            item.source,
                                                        )
                                                    }
                                                    className="border px-2 py-1 rounded disabled:opacity-50"
                                                >
                                                    <MinusIcon className="h-4 w-4" />
                                                </button>
                                                <span className="px-4">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.uniqueId,
                                                            "increment",
                                                            item.source,
                                                        )
                                                    }
                                                    className="border px-2 py-1 rounded"
                                                >
                                                    <PlusIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10">
                                    <p className="text-lg font-bold text-color__heading">
                                        Your cart is empty
                                    </p>
                                </div>
                            )
                        ) : isPayment ? (
                            <div className="">
                                <div className="space-y-5">
                                    <div className="">
                                        <h6 className="text-base font-medium mb-3">
                                            Pay
                                        </h6>
                                        <div className="space-y-3">
                                            <label
                                                className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-primary__color"
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        pay_type:
                                                            "cash_on_delivery",
                                                    }));
                                                    setSelectedGateway("");
                                                }}
                                            >
                                                <div
                                                    className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center 
                                                    ${formData.pay_type === "cash_on_delivery" ? "bg-primary__color border-primary__color" : "border-gray-400"}`}
                                                >
                                                    {formData.pay_type ===
                                                        "cash_on_delivery" && (
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="">
                                                    <span className="text-base font-semibold text-color__heading">
                                                        Cash on Delivery
                                                    </span>
                                                    <span className="block text-xs font-medium">
                                                        Pay when you receive the
                                                        product
                                                    </span>
                                                </div>
                                            </label>
                                            <label
                                                className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-primary__color"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        pay_type:
                                                            "online_payment",
                                                    }))
                                                }
                                            >
                                                <div
                                                    className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center 
                                                    ${formData.pay_type === "online_payment" ? "bg-primary__color border-primary__color" : "border-gray-400"}`}
                                                >
                                                    {formData.pay_type ===
                                                        "online_payment" && (
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="">
                                                    <span className="text-base font-semibold text-color__heading">
                                                        Online Payment
                                                    </span>
                                                    <span className="block text-xs font-medium">
                                                        Pay securely with
                                                        payment gateway
                                                    </span>
                                                </div>
                                            </label>
                                            {formData.pay_type ===
                                                "online_payment" && (
                                                <div className="ml-8 mt-4">
                                                    <h6 className="text-sm font-medium mb-3">
                                                        Select Payment Method
                                                    </h6>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {paymentGateways.map(
                                                            (gateway) => {
                                                                const baseCurrencyOption =
                                                                    gateway.currencies.find(
                                                                        (
                                                                            currency,
                                                                        ) =>
                                                                            currency.currency_code ===
                                                                            baseCurrency.code,
                                                                    );
                                                                if (
                                                                    !baseCurrencyOption
                                                                )
                                                                    return null;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            gateway.id
                                                                        }
                                                                        className="space-y-2"
                                                                    >
                                                                        <label
                                                                            key={
                                                                                gateway.id
                                                                            }
                                                                            className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-primary__color cursor-pointer"
                                                                            onClick={() => {
                                                                                setSelectedGateway(
                                                                                    gateway.alias,
                                                                                );
                                                                                setSelectedCurrencyAlias(
                                                                                    baseCurrencyOption.alias,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <div
                                                                                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center 
                                                                            ${selectedGateway === gateway.alias ? "bg-primary__color border-primary__color" : "border-gray-400"}`}
                                                                            >
                                                                                {selectedGateway ===
                                                                                    gateway.alias && (
                                                                                    <svg
                                                                                        className="w-3 h-3 text-white"
                                                                                        viewBox="0 0 20 20"
                                                                                        fill="currentColor"
                                                                                    >
                                                                                        <path
                                                                                            fillRule="evenodd"
                                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                            clipRule="evenodd"
                                                                                        />
                                                                                    </svg>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm capitalize">
                                                                                    {gateway.alias.replace(
                                                                                        "-",
                                                                                        " ",
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </label>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                    {selectedGateway && (
                                                        <p className="mt-2 text-sm text-gray-500">
                                                            You'll be redirected
                                                            to{" "}
                                                            {selectedGateway
                                                                .replace(
                                                                    "-",
                                                                    " ",
                                                                )
                                                                .toUpperCase()}{" "}
                                                            for secure payment
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="">
                                {loading ? (
                                    <FormSkeleton />
                                ) : (
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Enter phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Enter Phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-primary__color bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Enter name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Enter Name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-primary__color bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Billing address
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                placeholder="Enter Billing Address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-primary__color bg-gray-50"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Shipping address
                                            </label>
                                            <input
                                                type="text"
                                                name="shipping_address"
                                                placeholder="Enter Shipping Address"
                                                value={
                                                    formData.shipping_address
                                                }
                                                onChange={handleInputChange}
                                                className="w-full border-b border-gray-300 py-2 px-1 focus:outline-none focus:border-primary__color bg-gray-50"
                                                required
                                            />
                                        </div>
                                        <CustomListbox
                                            label="Enter Division"
                                            value={formData.division}
                                            onChange={(value) =>
                                                handleInputChange({
                                                    target: {
                                                        name: "division",
                                                        value,
                                                    },
                                                })
                                            }
                                            options={divisions.map(
                                                (division) => ({
                                                    value: division.id,
                                                    label: `${division.name} (${division.bn_name})`,
                                                }),
                                            )}
                                        />
                                        <CustomListbox
                                            label="Enter District"
                                            value={formData.district}
                                            onChange={(value) =>
                                                handleInputChange({
                                                    target: {
                                                        name: "district",
                                                        value,
                                                    },
                                                })
                                            }
                                            options={districts.map(
                                                (district) => ({
                                                    value: district.id,
                                                    label: `${district.name} (${district.bn_name})`,
                                                }),
                                            )}
                                            disabled={!formData.division}
                                        />
                                        {/* <CustomListbox
                                            label="Enter Upazilla"
                                            value={formData.upazilla}
                                            onChange={(value) => handleInputChange({ target: { name: 'upazilla', value } })}
                                            options={upazillas.map(upazilla => ({
                                                value: upazilla.id,
                                                label: `${upazilla.name} (${upazilla.bn_name})`
                                            }))}
                                            disabled={!formData.district}
                                        /> */}
                                        <div className="pt-2">
                                            <p className="text-sm font-medium text-gray-700 mb-3">
                                                Delivery option
                                            </p>
                                            <div className="space-y-3">
                                                {deliveryOptions.map(
                                                    (option) => (
                                                        <label
                                                            key={option.id}
                                                            className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md hover:border-primary__color"
                                                            onClick={() =>
                                                                handleDeliveryChange(
                                                                    option.slug,
                                                                )
                                                            }
                                                        >
                                                            <div
                                                                className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center 
                                                            ${formData.deliveryOption === option.slug ? "bg-primary__color border-primary__color" : "border-gray-400"}`}
                                                            >
                                                                {formData.deliveryOption ===
                                                                    option.slug && (
                                                                    <svg
                                                                        className="w-3 h-3 text-white"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-gray-700">
                                                                    {
                                                                        option.name
                                                                    }
                                                                </span>
                                                                <span className="block text-xs font-medium">
                                                                    Delivery
                                                                    fee:{" "}
                                                                    {formatCurrency(
                                                                        option.charge,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <div className="border rounded-md py-8 px-4">
                            {isPayment ? (
                                <>
                                    <h3 className="text-lg font-bold mb-4">
                                        Order Summary
                                    </h3>
                                    <div className="flex justify-between text-base font-semibold mb-4">
                                        <span>Total product</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                    <p className="flex justify-between mb-2">
                                        <span>Delivery Fee:</span>
                                        <span className="font-medium">
                                            {formatCurrency(deliveryCharge)}
                                        </span>
                                    </p>
                                    <p className="flex justify-between mb-4">
                                        <span>Delivery Method:</span>
                                        <span className="font-medium">
                                            {deliveryOptions.find(
                                                (opt) =>
                                                    opt.slug ===
                                                    formData.deliveryOption,
                                            )?.name || "Inside Dhaka"}
                                        </span>
                                    </p>
                                    <p className="flex justify-between text-base text-primary__color font-bold">
                                        <span>Grand Total:</span>
                                        <span>
                                            {formatCurrency(
                                                total +
                                                    parseFloat(deliveryCharge),
                                            )}
                                        </span>
                                    </p>
                                    <p className="flex justify-between text-primary__color font-bold mb-4">
                                        <span>Inclusive of all taxes</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            title="Back"
                                            variant="primary"
                                            size="md"
                                            className="w-full !bg-[#f5f5f5] !text-color__heading"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsPayment(false);
                                            }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="rounded-lg text-center transition-all  bg-primary__color text-white__color hover:bg-secondary__color hover:scale-x-105 w-full !disabled:opacity-50 !disabled:cursor-not-allowed px-4 py-3 text-small__font font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting
                                                ? "Confirming..."
                                                : "Confirm"}
                                        </button>
                                    </div>
                                </>
                            ) : isCheckout ? (
                                <>
                                    <h3 className="text-lg font-bold mb-4">
                                        Order Summary
                                    </h3>
                                    <div className="flex justify-between text-base font-semibold mb-4">
                                        <span>Total product</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                    <p className="flex justify-between mb-2">
                                        <span>Delivery Fee:</span>
                                        <span className="font-medium">
                                            {formatCurrency(deliveryCharge)}
                                        </span>
                                    </p>
                                    <p className="flex justify-between mb-4">
                                        <span>Delivery Method:</span>
                                        <span className="font-medium">
                                            {deliveryOptions.find(
                                                (opt) =>
                                                    opt.slug ===
                                                    formData.deliveryOption,
                                            )?.name || "Inside Dhaka"}
                                        </span>
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            title="Back"
                                            variant="primary"
                                            size="md"
                                            className="w-full !bg-[#f5f5f5] !text-color__heading"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsCheckout(false);
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            title="Continue"
                                            variant="primary"
                                            size="md"
                                            className="w-full"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsPayment(true);
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between text-base font-semibold mb-4">
                                        <span>Total product</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                    <Button
                                        type="button"
                                        title="Continue"
                                        variant="primary"
                                        size="md"
                                        className="w-full"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsCheckout(true);
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </form>
            )}
        </section>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Checkout />
        </Suspense>
    );
}
