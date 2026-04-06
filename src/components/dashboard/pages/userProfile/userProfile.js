"use client";
import { useState, useEffect } from "react";
import {
    profiledGetAPI,
    profileUpdateAPI,
    updatePasswordAPI,
    kycUpdateAPI,
    ProfileDeleteAPI,
    divisionDataGetAPI,
} from "@root/services/apiClient/apiClient";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { CameraIcon } from "@heroicons/react/24/outline";
import Button from "@/components/utility/Button";
import Image from "next/image";
import { Listbox, Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useFeatureAccess } from "@/components/hooks/useFeatureAccess";
import { useTranslations } from "next-intl";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
// Images
const user = "";

export default function UserProfileSection() {
    const t = useTranslations("Dashboard.account.profile");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [userImageFile, setUserImageFile] = useState(null);
    const [userImageUrl, setUserImageUrl] = useState(user);
    const [status, setStatus] = useState("Unverified");
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [kycErrors, setKycErrors] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        passwordConfirmation: false,
    });
    const [userData, setUserData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        mobile: "",
        mobile_code: "",
        gender: "",
        date_of_birth: "",
        address: {
            country: "",
            division: "",
            district: "",
            upazila: "",
            address: "",
        },
        nid_or_birth_id: "",
    });
    const { canReselling } = useFeatureAccess();
    // KYC status mapping with translations
    const statusMap = {
        0: {
            text: t("kyc.unverified"),
            color: "red",
            description: t("kyc.unverifiedDesc"),
        },
        1: {
            text: t("kyc.verified"),
            color: "green",
            description: t("kyc.verifiedDesc"),
        },
        2: {
            text: t("kyc.pending"),
            color: "yellow",
            description: t("kyc.pendingDesc"),
        },
        3: {
            text: t("kyc.rejected"),
            color: "red",
            description: t("kyc.rejectedDesc"),
        },
    };
    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await profiledGetAPI();
                const data = response.data.data.user;
                setUserData({
                    firstname: data.firstname || "",
                    lastname: data.lastname || "",
                    email: data.email || "",
                    mobile: data.mobile || "",
                    mobile_code: data.mobile_code || "",
                    gender: data.gender || "",
                    date_of_birth: data.date_of_birth
                        ? data.date_of_birth.split("T")[0]
                        : "",
                    address: {
                        country: data.address?.country || "",
                        division: data.address?.division || "",
                        district: data.address?.district || "",
                        upazila: data.address?.upazila || "",
                        address: data.address?.address || "",
                    },
                    nid_or_birth_id: data.nid_or_birth_id || "",
                });
                // Set KYC status
                setStatus(data.kycStringStatus?.value);
                // Set user image
                if (data.userImage) {
                    setUserImageUrl(data.userImage);
                }
            } catch (error) {
                handleApiError(error, t("errors.profileFetch"));
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    // Handle profile form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status !== "Verified") {
            toast.error(t("errors.notVerified"));
            return;
        }
        setIsUpdating(true);
        setErrors({});
        try {
            const formData = new FormData();
            // Append basic user data
            formData.append("firstname", userData.firstname);
            formData.append("lastname", userData.lastname);
            formData.append("name", userData.firstname);
            formData.append("email", userData.email);
            formData.append("mobile", userData.mobile);
            formData.append("mobile_code", userData.mobile_code);
            formData.append("gender", userData.gender);
            formData.append("date_of_birth", userData.date_of_birth);
            formData.append("nid_or_birth_id", userData.nid_or_birth_id);
            // Append address data
            formData.append("country", userData.address.country);
            formData.append("division", userData.address.division);
            formData.append("district", userData.address.district);
            formData.append("upazila", userData.address.upazila);
            formData.append("address", userData.address.address);
            // Append image if changed
            if (userImageFile) {
                formData.append("image", userImageFile);
            }
            const response = await profileUpdateAPI(formData);
            if (response.data.message?.success) {
                toast.success(t("success.profileUpdated"));
                // Refresh user data
                const profileResponse = await profiledGetAPI();
                const updatedData = profileResponse.data.data.user;
                setUserData((prev) => ({
                    ...prev,
                    firstname: updatedData.firstname,
                    lastname: updatedData.lastname,
                    email: updatedData.email,
                    mobile: updatedData.mobile,
                    mobile_code: updatedData.mobile_code,
                    gender: updatedData.gender,
                    date_of_birth: updatedData.date_of_birth
                        ? updatedData.date_of_birth.split("T")[0]
                        : "",
                    address: {
                        country: updatedData.address?.country || "",
                        division: updatedData.address?.division || "",
                        district: updatedData.address?.district || "",
                        upazila: updatedData.address?.upazila || "",
                        address: updatedData.address?.address || "",
                    },
                    nid_or_birth_id: updatedData.nid_or_birth_id || "",
                }));
                if (updatedData.userImage) {
                    setUserImageUrl(updatedData.userImage);
                }
            } else {
                // Handle API validation errors
                if (response.data.message?.error) {
                    const apiErrors = {};
                    response.data.message.error.forEach((err) => {
                        const field = err
                            .match(/The (.*?) field/)?.[1]
                            ?.replace(" ", "_");
                        if (field) {
                            apiErrors[field] = err;
                        }
                    });
                    setErrors(apiErrors);
                    toast.error(t("errors.formErrors"));
                }
            }
        } catch (error) {
            handleApiError(error, t("errors.profileUpdate"));
        } finally {
            setIsUpdating(false);
        }
    };
    // Handle password change
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (isChanging) return;
        setIsChanging(true);
        try {
            const response = await updatePasswordAPI(
                currentPassword,
                newPassword,
                passwordConfirmation,
            );
            response.data.message.success.forEach((msg) => {
                toast.success(msg);
            });
            setCurrentPassword("");
            setNewPassword("");
            setPasswordConfirmation("");
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.message &&
                error.response.data.message.error
            ) {
                error.response.data.message.error.forEach((msg) => {
                    toast.error(msg);
                });
            } else {
                toast.error(t("errors.passwordUpdate"));
            }
        } finally {
            setIsChanging(false);
        }
    };
    // Handle account deletion
    const onProfileDelete = async () => {
        setLoading(true);
        try {
            const response = await ProfileDeleteAPI();
            const successMessage = response?.data?.message?.success || [
                t("success.accountDeleted"),
            ];
            successMessage.forEach((msg) => {
                toast.success(msg);
            });
            setIsLogoutModalOpen(false);
            router.push("/user/auth/login");
        } catch (err) {
            if (err.response?.data?.message?.error) {
                const errors = err.response?.data?.message?.error;
                errors.forEach((msg) => {
                    toast.error(msg);
                });
            } else {
                toast.error(t("errors.serverError"));
            }
        } finally {
            setLoading(false);
        }
    };

    // KYC form submission
    const handleKycSubmit = async (e) => {
        e.preventDefault();
        // Validate files before submission
        const errors = [];
        if (!frontFile) errors.push(t("kyc.errors.frontRequired"));
        if (!backFile) errors.push(t("kyc.errors.backRequired"));
        if (errors.length > 0) {
            setKycErrors(errors);
            return;
        }
        const toastId = toast.loading(t("kyc.submitting"));
        try {
            const response = await kycUpdateAPI(frontFile, backFile);
            if (response.data && response.data.message.success) {
                toast.success(t("kyc.successSubmitted"), { id: toastId });
                setStatus(t("kyc.pending"));
                setFrontFile(null);
                setBackFile(null);
                setFrontPreview(null);
                setBackPreview(null);
                await fetchKYCData();
            }
        } catch (err) {
            console.error("KYC submission failed:", err);
            if (err.response?.data?.message?.error) {
                setKycErrors(err.response.data.message.error);
                toast.error(t("kyc.errors.fixErrors"), { id: toastId });
            } else {
                toast.error(t("kyc.errors.submitFailed"), { id: toastId });
            }
        }
    };
    // Dropzone for front ID
    const {
        getRootProps: getFrontRootProps,
        getInputProps: getFrontInputProps,
        isDragActive: isFrontDragActive,
    } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setFrontFile(file);
                setFrontPreview(URL.createObjectURL(file));
                setKycErrors(kycErrors.filter((e) => e !== "front"));
            }
        },
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/svg+xml": [".svg"],
            "image/webp": [".webp"],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
        onDropRejected: () => {
            setKycErrors([...kycErrors, t("kyc.errors.frontRejected")]);
        },
    });
    // Dropzone for back ID
    const {
        getRootProps: getBackRootProps,
        getInputProps: getBackInputProps,
        isDragActive: isBackDragActive,
    } = useDropzone({
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setBackFile(file);
                setBackPreview(URL.createObjectURL(file));
                setKycErrors(kycErrors.filter((e) => e !== "back"));
            }
        },
        accept: {
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/svg+xml": [".svg"],
            "image/webp": [".webp"],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, //max 10 mb
        onDropRejected: () => {
            setKycErrors([...kycErrors, t("kyc.errors.backRejected")]);
        },
    });
    // Fetch divisions on mount
    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                const response = await divisionDataGetAPI();
                if (response.data.message.success) {
                    setDivisions(response.data.data.divisions);
                    setDistricts(response.data.data.districts);
                    setUpazillas(response.data.data.upazilas);
                }
            } catch (error) {
                console.error("Error fetching divisions:", error);
            }
        };
        fetchDivisions();
    }, []);
    // Fetch districts when division changes
    const fetchDistricts = async (divisionId) => {
        try {
            const response = await divisionDataGetAPI();
            if (response.data.message.success) {
                const filteredDistricts = response.data.data.districts.filter(
                    (district) =>
                        district.division_id === divisionId.toString(),
                );
                setDistricts(filteredDistricts);
                setUserData((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        district: "",
                        upazila: "",
                    },
                }));
                setUpazillas([]);
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };
    // Fetch upazillas when district changes
    const fetchUpazillas = async (districtId) => {
        try {
            const response = await divisionDataGetAPI();
            if (response.data.message.success) {
                const filteredUpazillas = response.data.data.upazilas.filter(
                    (upazilla) =>
                        upazilla.district_id === districtId.toString(),
                );
                setUpazillas(filteredUpazillas);
                setUserData((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        upazila: "",
                    },
                }));
            }
        } catch (error) {
            console.error("Error fetching upazillas:", error);
        }
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserImageFile(file);
            setUserImageUrl(URL.createObjectURL(file));
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            },
        }));
        if (name === "division") {
            fetchDistricts(value);
        } else if (name === "district") {
            fetchUpazillas(value);
        }
    };
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
                <label className="block text-sm font-medium mb-2">
                    {label}
                </label>
                <Listbox value={value} onChange={onChange} disabled={disabled}>
                    <div className="relative">
                        <Listbox.Button
                            className={`w-full text-left border ${error ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        >
                            <span className="block truncate">
                                {options.find((opt) => opt.value === value)
                                    ?.label || t("placeholders.select")}
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
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        );
    };
    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7 space-y-5">
                    <div className="flex justify-between items-center mb-5">
                        <div className="h-6 w-32 animate-pulse bg-gray-200 rounded" />
                        <div className="flex gap-2">
                            <div className="h-10 w-24 animate-pulse bg-gray-200 rounded" />
                            <div className="h-10 w-24 animate-pulse bg-gray-200 rounded" />
                            <div className="h-10 w-24 animate-pulse bg-gray-200 rounded" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full animate-pulse bg-gray-200" />
                        <div className="space-y-2">
                            <div className="h-5 w-40 animate-pulse bg-gray-200 rounded" />
                            <div className="h-4 w-32 animate-pulse bg-gray-200 rounded" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i}>
                                <div className="h-4 w-24 mb-2 animate-pulse bg-gray-200 rounded" />
                                <div className="h-10 w-full animate-pulse bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                    <div className="h-12 w-full mt-4 animate-pulse bg-gray-200 rounded" />
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5 space-y-5">
                    <div className="h-6 w-32 mb-4 animate-pulse bg-gray-200 rounded" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 w-24 mb-2 animate-pulse bg-gray-200 rounded" />
                            <div className="h-10 w-full animate-pulse bg-gray-200 rounded" />
                        </div>
                    ))}
                    <div className="h-12 w-full mt-4 animate-pulse bg-gray-200 rounded" />
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-6 w-32 animate-pulse bg-gray-200 rounded" />
                        <div className="h-5 w-40 animate-pulse bg-gray-200 rounded" />
                    </div>
                    <div className="h-40 w-full animate-pulse bg-gray-200 rounded" />
                    <div className="h-12 w-full mt-4 animate-pulse bg-gray-200 rounded" />
                </div>
            </div>
        );
    }
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-7">
                    <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-3 md:gap-0 items-center justify-between lg:items-start xl:items-center mb-5 md:mb-4">
                        <h5 className="flex-grow mb-2">
                            {t("sections.profileSettings")}
                        </h5>
                    </div>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center col-span-1 md:col-span-2 gap-4">
                                <div className="relative w-20 h-20">
                                    <Image
                                        src={userImageUrl}
                                        width={80}
                                        height={80}
                                        alt={t("alt.userAvatar")}
                                        className="w-20 h-20 object-cover rounded-full border border-gray-200"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-primary__color text-white p-1.5 rounded-full cursor-pointer hover:scale-105 transition">
                                        <CameraIcon className="h-4 w-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div>
                                    <h6 className="text-base font-medium">
                                        {userData.firstname} {userData.lastname}
                                    </h6>
                                    <p className="text-sm text-gray-500">
                                        {userData.mobile_code}
                                        {userData.mobile}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.firstName")}
                                </label>
                                <input
                                    type="text"
                                    name="firstname"
                                    className={`w-full border ${errors.firstname ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder={t("placeholders.firstName")}
                                    value={userData.firstname}
                                    onChange={handleInputChange}
                                    disabled={
                                        status !== "Verified" ? true : false
                                    }
                                />
                                {errors.firstname && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.firstname}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.lastName")}
                                </label>
                                <input
                                    type="text"
                                    name="lastname"
                                    className={`w-full border ${errors.lastname ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder={t("placeholders.lastName")}
                                    value={userData.lastname}
                                    onChange={handleInputChange}
                                    disabled={
                                        status !== "Verified" ? true : false
                                    }
                                />
                                {errors.lastname && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.lastname}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.name")}
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder={t("placeholders.name")}
                                    value={userData.firstname}
                                    onChange={handleInputChange}
                                    disabled={
                                        status !== "Verified" ? true : false
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.email")}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder={t("placeholders.email")}
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.phone")}
                                </label>
                                <input
                                    type="text"
                                    name="mobile"
                                    className={`w-full border ${errors.mobile ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder={t("placeholders.phone")}
                                    value={userData.mobile}
                                    onChange={handleInputChange}
                                    disabled
                                />
                                {errors.mobile && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.mobile}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.country")}
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    className={`w-full border ${errors.country ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder={t("placeholders.country")}
                                    value={userData.address.country}
                                    onChange={handleAddressChange}
                                    disabled={
                                        status !== "Verified" ? true : false
                                    }
                                />
                                {errors.country && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.country}
                                    </p>
                                )}
                            </div>
                            <CustomListbox
                                label={t("labels.division")}
                                value={Number(userData.address.division)}
                                onChange={(value) =>
                                    handleAddressChange({
                                        target: { name: "division", value },
                                    })
                                }
                                options={divisions.map((division) => ({
                                    value: division.id,
                                    label: `${division.name} (${division.bn_name})`,
                                }))}
                                error={errors.division}
                                disabled={status !== "Verified" ? true : false}
                            />
                            <CustomListbox
                                label={t("labels.district")}
                                value={Number(userData.address.district)}
                                onChange={(value) =>
                                    handleAddressChange({
                                        target: { name: "district", value },
                                    })
                                }
                                options={districts.map((district) => ({
                                    value: district.id,
                                    label: `${district.name} (${district.bn_name})`,
                                }))}
                                error={errors.district}
                                disabled={
                                    status !== "Verified"
                                        ? true
                                        : !userData.address.division
                                }
                            />
                            <CustomListbox
                                label={t("labels.upazila")}
                                value={Number(userData.address.upazila)}
                                onChange={(value) =>
                                    handleAddressChange({
                                        target: { name: "upazila", value },
                                    })
                                }
                                options={upazillas.map((upazilla) => ({
                                    value: upazilla.id,
                                    label: `${upazilla.name} (${upazilla.bn_name})`,
                                }))}
                                error={errors.upazila}
                                disabled={
                                    status !== "Verified"
                                        ? true
                                        : !userData.address.district
                                }
                            />
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.address")}
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    className={`w-full border ${errors.address ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder={t("placeholders.address")}
                                    value={userData.address.address}
                                    onChange={handleAddressChange}
                                    disabled={
                                        status !== "Verified"
                                            ? true
                                            : !userData.address.district
                                    }
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                            <CustomListbox
                                label={t("labels.gender")}
                                value={userData.gender}
                                onChange={(value) =>
                                    handleInputChange({
                                        target: { name: "gender", value },
                                    })
                                }
                                options={[
                                    {
                                        value: "",
                                        label: t("placeholders.selectGender"),
                                    },
                                    { value: "male", label: t("gender.male") },
                                    {
                                        value: "female",
                                        label: t("gender.female"),
                                    },
                                    {
                                        value: "other",
                                        label: t("gender.other"),
                                    },
                                ]}
                                disabled={status !== "Verified"}
                                error={errors.gender}
                            />
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.dateOfBirth")}
                                </label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    className={`w-full border ${errors.date_of_birth ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    value={userData.date_of_birth}
                                    onChange={handleInputChange}
                                    disabled={status !== "Verified"}
                                />
                                {errors.date_of_birth && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.date_of_birth}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.nidOrBirthId")}
                                </label>
                                <input
                                    type="text"
                                    name="nid_or_birth_id"
                                    className={`w-full border ${errors.nid_or_birth_id ? "border-red-500" : "border-gray-300"} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder={t("placeholders.nidOrBirthId")}
                                    value={userData.nid_or_birth_id}
                                    onChange={handleInputChange}
                                    disabled={status !== "Verified"}
                                />
                                {errors.nid_or_birth_id && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.nid_or_birth_id}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            type="submit"
                            title={
                                isUpdating
                                    ? t("buttons.updating")
                                    : t("buttons.update")
                            }
                            variant="primary"
                            size="md"
                            className="w-full"
                            disabled={isUpdating}
                        />
                    </form>
                </div>
                <div className="flex flex-col gap-4 col-span-12 lg:col-span-5">
                    <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <h5>{t("sections.myProfileManage")}</h5>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 flex-grow">
                            <div className="group relative flex-grow">
                                <Button
                                    title={t("buttons.deleteAccount")}
                                    variant="primary"
                                    size="s"
                                    className="text-white bg-red-500 hover:!bg-red-600 text-xs px-2 w-full"
                                    onClick={() => setIsLogoutModalOpen(true)}
                                />
                            </div>
                            <Button
                                href="/user/setup/pin"
                                title={t("buttons.setupPin")}
                                variant="primary"
                                size="s"
                                className={"text-xs 2xl:text-sm flex-grow"}
                            />
                            {canReselling && (
                                <Button
                                    href="/user/apply-for-reseller"
                                    title={t("buttons.applyForReseller")}
                                    variant="primary"
                                    size="s"
                                    className={"text-xs 2xl:text-sm flex-grow"}
                                />
                            )}
                        </div>
                    </div>
                    <div className="bg-white h-full rounded-[12px] p-5 sm:p-6 md:p-7">
                        <div className="flex items-center justify-between mb-4">
                            <h5>{t("sections.changePassword")}</h5>
                        </div>
                        <form
                            className="space-y-5"
                            onSubmit={handlePasswordUpdate}
                        >
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.currentPassword")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword.currentPassword
                                                ? "text"
                                                : "password"
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder={t("placeholders.password")}
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword({
                                                ...showPassword,
                                                currentPassword:
                                                    !showPassword.currentPassword,
                                            })
                                        }
                                        className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword?.currentPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.newPassword")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword.newPassword
                                                ? "text"
                                                : "password"
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder={t("placeholders.password")}
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword({
                                                ...showPassword,
                                                newPassword:
                                                    !showPassword.newPassword,
                                            })
                                        }
                                        className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword?.newPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("labels.confirmPassword")}
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword.passwordConfirmation
                                                ? "text"
                                                : "password"
                                        }
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder={t("placeholders.password")}
                                        value={passwordConfirmation}
                                        onChange={(e) =>
                                            setPasswordConfirmation(
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword({
                                                ...showPassword,
                                                passwordConfirmation:
                                                    !showPassword.passwordConfirmation,
                                            })
                                        }
                                        className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword?.passwordConfirmation ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                title={
                                    isChanging
                                        ? t("buttons.changing")
                                        : t("buttons.change")
                                }
                                variant="primary"
                                size="md"
                                className="w-full"
                                disabled={isChanging}
                            />
                        </form>
                    </div>
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between mb-4">
                        <h5>{t("sections.kycInformation")}</h5>
                        <div className="">
                            <p className="text-sm font-medium text-gray-600">
                                {t("labels.kycStatus")}:{" "}
                                <span
                                    className={`font-semibold text-${statusMap[status]?.color || "blue"}-600`}
                                >
                                    {statusMap[status]?.text || status}
                                </span>
                            </p>
                            {statusMap[status]?.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {statusMap[status].description}
                                </p>
                            )}
                        </div>
                    </div>
                    {status === "Verified" ? (
                        <div className="p-4 bg-green-50 text-green-600 rounded-md">
                            <p className="font-medium">
                                {t("kyc.verifiedMessage")}
                            </p>
                            <p className="text-sm mt-1">
                                {t("kyc.noActionNeeded")}
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleKycSubmit}>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    {t("kyc.idVerification")}
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    {t("kyc.uploadInstruction")}
                                </p>
                                {kycErrors.length > 0 && (
                                    <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-md">
                                        {kycErrors.map((error, index) => (
                                            <p key={index} className="text-sm">
                                                {error}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                {/* Front ID */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">
                                        {t("kyc.frontOfId")}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            {...getFrontRootProps()}
                                            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors duration-200 flex-1 ${
                                                isFrontDragActive
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-300"
                                            } ${kycErrors.includes("front") ? "border-red-500 bg-red-50" : ""}`}
                                        >
                                            <input {...getFrontInputProps()} />
                                            {frontPreview ? (
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={frontPreview}
                                                        width={80}
                                                        height={80}
                                                        alt={t("alt.frontId")}
                                                        className="w-20 h-20 object-contain rounded-md border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-700">
                                                            {frontFile?.name ||
                                                                ""}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {frontFile
                                                                ? Math.round(
                                                                      frontFile.size /
                                                                          1024,
                                                                  ) + " KB"
                                                                : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("kyc.dragOrClick")}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {t(
                                                            "kyc.acceptedFormats",
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {frontPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFrontFile(null);
                                                    setFrontPreview(null);
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                {t("buttons.remove")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {/* Back ID */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">
                                        {t("kyc.backOfId")}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            {...getBackRootProps()}
                                            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors duration-200 flex-1 ${
                                                isBackDragActive
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-300"
                                            } ${kycErrors.includes("back") ? "border-red-500 bg-red-50" : ""}`}
                                        >
                                            <input {...getBackInputProps()} />
                                            {backPreview ? (
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={backPreview}
                                                        width={80}
                                                        height={80}
                                                        alt={t("alt.backId")}
                                                        className="w-20 h-20 object-contain rounded-md border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-700">
                                                            {backFile?.name ||
                                                                ""}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {backFile
                                                                ? Math.round(
                                                                      backFile.size /
                                                                          1024,
                                                                  ) + " KB"
                                                                : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        {t("kyc.dragOrClick")}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {t(
                                                            "kyc.acceptedFormats",
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {backPreview && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setBackFile(null);
                                                    setBackPreview(null);
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                {t("buttons.remove")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                title={
                                    loading
                                        ? t("buttons.submitting")
                                        : t("buttons.submitVerification")
                                }
                                variant="primary"
                                size="md"
                                className="w-full"
                                disabled={loading || !frontFile || !backFile}
                            />
                        </form>
                    )}
                </div>
            </div>
            {/* Delete Account Confirmation Modal */}
            <Transition appear show={isLogoutModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50"
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
                                    <div className="mt-2">
                                        <h6 className="mb-3">
                                            {t("modals.deleteAccount.title")}
                                        </h6>
                                        <p className="text-sm leading-[24px]">
                                            {t(
                                                "modals.deleteAccount.description",
                                            )}
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
                                            {t("buttons.cancel")}
                                        </button>
                                        <button
                                            type="button"
                                            className={`inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ${loading ? "cursor-not-allowed" : ""}`}
                                            onClick={onProfileDelete}
                                            disabled={loading}
                                        >
                                            {loading
                                                ? t("buttons.deleting")
                                                : t("buttons.deleteAccount")}
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
