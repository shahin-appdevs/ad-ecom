"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import {
    createCustomerAPI,
    stroWalletPageInfoGetApi,
    updateCustomerAPI,
} from "@root/services/apiClient/apiClient";

// Import your reusable RHF components
import { RHFInput } from "@/components/ui/form/Input";
import RHFSelect from "@/components/ui/form/RHFSelect";
import { RHFFileUpload } from "@/components/ui/form/RHFFileUpload";
import { RHFTextarea } from "@/components/ui/form/RHFTextarea";
import toast from "react-hot-toast";

export default function UpdateCustomer() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [customerFields, setCustomerFields] = useState([]);
    const [customerCardInfo, setCustomerCardInfo] = useState({});

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {}, // We'll dynamically set default values
    });

    const FIELD_VALUE_MAP = {
        customer_email: "customerEmail",
        first_name: "firstName",
        last_name: "lastName",
        phone: "phoneNumber",
        phone_code: "phoneNumber",
        city: "city",
        state: "state",
        zip_code: "zipCode",
        address: "line1",
        house_number: "houseNumber",
        identityNumber: "idNumber",
        identityType: "idType",
        date_of_birth: "dateOfBirth",
    };

    // Fetch API response
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const result = await stroWalletPageInfoGetApi();
                const fields = result?.data?.data?.customer_create_fields || [];
                setCustomerFields(fields);
                const customerInfo = result?.data?.data?.customer_exist;
                setCustomerCardInfo(customerInfo || {});

                const userInfo = JSON.parse(localStorage.getItem("userInfo"));

                // Set default values dynamically
                // fields.forEach((field) => {
                //     if (field.field_name === "customer_email") {
                //         setValue(field.field_name, userInfo?.email);
                //     } else if (field.field_name === "phone_code") {
                //         setValue(field.field_name, userInfo?.mobile_code);
                //     } else {
                //         setValue(field.field_name, field[field.field_name]);
                //     }
                // });
                fields.forEach((field) => {
                    const backendKey = FIELD_VALUE_MAP[field.field_name];

                    if (backendKey) {
                        setValue(field.field_name, customerInfo[backendKey]);
                        if (field.field_name === "phone_code") {
                            setValue(field.field_name, userInfo.mobile_code);
                        }
                    }
                });
            } catch (error) {
                console.error("Error fetching fields:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const onSubmit = async (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            // If value is a FileList (from file input), append first file
            if (value instanceof FileList) {
                if (value.length > 0) {
                    formData.append(key, value[0]);
                    console.log(value[0]);
                }
            } else {
                formData.append(key, value);
            }
        });

        // For demonstration: log FormData keys and values
        // for (let pair of formData.entries()) {
        //     console.log(pair[0], pair[1]);
        // }

        try {
            const result = await updateCustomerAPI(formData);
            const messages = result?.data?.message?.success;
            messages.forEach((message) => toast.success(message));
            router.replace("/user/cards/virtual-card");
        } catch (error) {
            const errors = error?.response?.data?.message?.error || [];
            errors?.forEach((err) => toast.error(err));
        }
    };

    // Helper function to render fields dynamically
    const renderField = (field, idx) => {
        const commonProps = {
            // key: field.id,
            name: field.field_name,
            control,
            label: `${field.label_name}  ${field.required ? "<span>*</span>" : ""} ${field.site_label ? `<span class="text-red-500" >(${field.site_label})</span>` : ""}`,
            rules: {
                required: field.required
                    ? `${field.label_name} is required`
                    : false,
            },
            placeholder: `Enter ${field.label_name}` || "",
            readOnly:
                field.field_name === "customer_email" ||
                field.field_name === "phone_code"
                    ? true
                    : false,
        };

        switch (field.type) {
            case "text":
            case "number":
            case "email":
            case "date":
                return (
                    <RHFInput key={idx} {...commonProps} type={field.type} />
                );
            case "textarea":
                return <RHFTextarea key={idx} {...commonProps} />;
            case "file":
                return (
                    <RHFFileUpload
                        key={idx}
                        name={field.field_name}
                        control={control}
                        label={field.label_name + (field.required ? "*" : "")}
                        rules={{ required: `${field.label_name} is required` }}
                        error={errors[field.field_name]?.message}
                    />
                );
            case "select":
                return (
                    <RHFSelect
                        key={idx}
                        {...commonProps}
                        options={field.options || []}
                    />
                );
            default:
                return <RHFInput key={idx} {...commonProps} type="text" />;
        }
    };

    // const phoneCodeField = customerFields.find(
    //     (f) => f.field_name === "phone_code",
    // );

    // const modifiedPhoneCodeField = phoneCodeField
    //     ? { ...phoneCodeField, type: "select", options: ["+1", "+2", "+3"] }
    //     : null;

    if (loading) return <KYCFormSkeleton />;

    return (
        <div className="bg-gray-50 p-6 rounded-xl space-y-6">
            <div className="max-w-7xl flex items-center">
                <button
                    onClick={() => router.back()}
                    className="bg-primary__color text-white__color flex justify-center items-center py-2 px-4 gap-2 font-semibold rounded-[6px] transition hover:bg-secondary__color hover:scale-x-105"
                >
                    <ArrowLeft />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {customerFields.map((field, idx) => {
                        // if (field.field_name === "phone") {
                        //     return (
                        //         <div className="grid grid-cols-12" key={idx}>
                        //             <div className="col-span-4 md:col-span-4 xl:col-span-3">
                        //                 {renderField(modifiedPhoneCodeField)}
                        //             </div>
                        //             <div className="col-span-8 md:col-span-8 xl:col-span-9">
                        //                 {renderField(field)}
                        //             </div>
                        //         </div>
                        //     );
                        // }
                        // if (field.field_name !== "phone_code") {
                        //     return renderField(field);
                        // }
                        return renderField(field, idx);
                    })}
                </div>

                <div className="flex items-start gap-2">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            ID Card Image
                        </label>
                        <img
                            src={customerCardInfo?.idImage}
                            alt="Id Image"
                            height={200}
                            className="w-[250px]"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Your Photo
                        </label>
                        <img
                            src={customerCardInfo?.userPhoto}
                            alt="Id Image"
                            height={200}
                            className="w-[250px]"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700"
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                    {isSubmitting ? (
                        <LoaderCircle className="text-white animate-spin inline ms-2" />
                    ) : (
                        ""
                    )}
                </button>
            </form>
        </div>
    );
}

// components/KYCFormSkeleton.tsx
function KYCFormSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 py-5 px-4 sm:px-6 lg:px-8">
            <div className=" mx-auto">
                {/* Back Button */}
                <div className="mb-8">
                    <div className="w-12 h-10 bg-gray-200 rounded-xl animate-pulse" />
                </div>

                <div className="overflow-hidden">
                    <div className=" space-y-10">
                        {/* Two-column grid for form fields */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* First Name */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-40 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* Last Name */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-44 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* Phone Code */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-36 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* Phone Number */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* Email */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-28 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-48 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* House Number */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-40 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* Address */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* Zip Code */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-36 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                            </div>

                            {/* ID Card Front */}
                            <div>
                                <div className="h-5 bg-gray-200 rounded w-52 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse flex items-center px-4">
                                    <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>

                            {/* Your Photo */}
                            <div className="md:col-span-2">
                                <div className="h-5 bg-gray-200 rounded w-40 mb-3 animate-pulse" />
                                <div className="h-12 bg-gray-100 rounded-lg animate-pulse flex items-center px-4">
                                    <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <div className="h-14 bg-blue-600 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
