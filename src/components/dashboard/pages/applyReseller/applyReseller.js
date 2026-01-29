'use client';
import { useState, useEffect } from 'react';
import { resellerInfoGetAPI, resellerSubmitInfoGetAPI, resellerSubmitAPI, switchResellerAPI } from "@root/services/apiClient/apiClient";
import { useDropzone } from 'react-dropzone';
import { toast } from "react-hot-toast";
import { 
    CheckIcon,
    ChevronUpDownIcon
} 
from '@heroicons/react/24/outline';
import Button from "@/components/utility/Button";
import Image from 'next/image';
import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const getLocalStorage = (key, defaultValue) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  }
  return defaultValue;
};

const setLocalStorage = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
  
export default function UserProfileSection() {
    const [status, setStatus] = useState('0');
    const [loading, setLoading] = useState(true);
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [resellerErrors, setResellerErrors] = useState([]);
    const [idType, setIdType] = useState('');
    const [inputFields, setInputFields] = useState([]);
    const [idTypeOptions, setIdTypeOptions] = useState([]);
    const [submittedData, setSubmittedData] = useState(null);
    const [isResellerEnabled, setIsResellerEnabled] = useState(() => {
        return getLocalStorage('resellerEnabled', false);
    });
    const [switchLoading, setSwitchLoading] = useState(false);

    const statusMap = {
        0: { text: 'Unverified', color: 'red', description: 'Please complete Reseller verification' },
        1: { text: 'Verified', color: 'green', description: 'Your Reseller is verified' },
        2: { text: 'Pending', color: 'yellow', description: 'Your Reseller is under review' },
        3: { text: 'Rejected', color: 'red', description: 'Your Reseller was rejected. Please resubmit.' }
    };

    useEffect(() => {
        const fetchResellerInfo = async () => {
            try {
                setLoading(true);
                const response = await resellerInfoGetAPI();
                setStatus(response.data.data.reseller_status);

                // Only set from backend if we have no localStorage value yet
                const localValue = getLocalStorage('resellerEnabled', null);
                if (localValue === null) {
                    const serverEnabled = response.data.data.reseller_switch === '1';
                    setIsResellerEnabled(serverEnabled);
                    setLocalStorage('resellerEnabled', serverEnabled);
                }

                // Set input fields from API
                if (response.data.data.input_fields && response.data.data.input_fields.length > 0) {
                    setInputFields(response.data.data.input_fields);

                    // Extract ID type options
                    const idTypeField = response.data.data.input_fields.find(field => field.name === 'id_type');
                    if (idTypeField && idTypeField.validation.options) {
                        setIdTypeOptions(idTypeField.validation.options);
                    }
                }

                // If verified, fetch submitted info
                if (response.data.data.reseller_status === '1') {
                    const submittedInfoResponse = await resellerSubmitInfoGetAPI();
                    setSubmittedData(submittedInfoResponse.data.data);
                }

                setLoading(false);
            } catch (error) {
                toast.error(error.message || 'Failed to fetch reseller info');
                setLoading(false);
            }
        };

        fetchResellerInfo();
    }, []);

    const handleSwitchReseller = async () => {
        const newStatus = !isResellerEnabled;
        setSwitchLoading(true);
        try {
            const response = await switchResellerAPI(newStatus ? '1' : '0');
            
            if (response.data && response.data.message.success) {
                setIsResellerEnabled(newStatus);
                setLocalStorage('resellerEnabled', newStatus);
                toast.success(`Reseller ${newStatus ? 'enabled' : 'disabled'} successfully`);
            } else if (response.data?.message?.error) {
                toast.error(response.data.message.error[0] || 'Failed to switch reseller status');
            }
        } catch (error) {
            console.error('Reseller switch failed:', error);
            toast.error(error.message || 'Failed to switch reseller status');
        } finally {
            setSwitchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate files before submission
        const errors = [];
        if (!frontFile) errors.push('Please upload front of your ID');
        if (!backFile) errors.push('Please upload back of your ID');
        
        if (errors.length > 0) {
            setResellerErrors(errors);
            return;
        }

        const toastId = toast.loading('Submitting Reseller documents...');
        
        try {
            const response = await resellerSubmitAPI(idType, frontFile, backFile);
            
            if (response.data && response.data.message.success) {
                toast.success('Reseller submitted successfully! Status will update soon.', { id: toastId });
                setStatus('2'); // Set to pending
                setFrontFile(null);
                setBackFile(null);
                setFrontPreview(null);
                setBackPreview(null);
                await fetchResellerInfo();
            }
        } catch (err) {
            console.error('Reseller submission failed:', err);
            
            // Handle specific backend validation errors
            if (err.response?.data?.message?.error) {
                setResellerErrors(err.response.data.message.error);
                toast.error('Please fix the errors in your submission', { id: toastId });
            } else {
                toast.error(
                    err.message || 'Reseller submission failed',
                    { id: toastId }
                );
            }
        }
    };

    // Front ID Dropzone
    const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps, isDragActive: isFrontDragActive } = useDropzone({
        onDrop: acceptedFiles => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setFrontFile(file);
                setFrontPreview(URL.createObjectURL(file));
                setResellerErrors(resellerErrors.filter(e => !e.includes('front')));
            }
        },
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/svg+xml': ['.svg'],
            'image/webp': ['.webp']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        onDropRejected: (fileRejections) => {
            const newErrors = fileRejections.map(({ file, errors }) => 
                errors.map(error => {
                    if (error.code === 'file-too-large') {
                        return `Front image is too large (max 10MB)`;
                    }
                    if (error.code === 'file-invalid-type') {
                        return `Front image has invalid type (only JPG, PNG, SVG, WEBP allowed)`;
                    }
                    return `Front image was rejected: ${error.message}`;
                })
            ).flat();
            
            setResellerErrors([...resellerErrors.filter(e => !e.includes('front')), ...newErrors]);
        }
    });

    // Back ID Dropzone
    const { getRootProps: getBackRootProps, getInputProps: getBackInputProps, isDragActive: isBackDragActive } = useDropzone({
        onDrop: acceptedFiles => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setBackFile(file);
                setBackPreview(URL.createObjectURL(file));
                setResellerErrors(resellerErrors.filter(e => !e.includes('back')));
            }
        },
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/svg+xml': ['.svg'],
            'image/webp': ['.webp']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        onDropRejected: (fileRejections) => {
            const newErrors = fileRejections.map(({ file, errors }) => 
                errors.map(error => {
                    if (error.code === 'file-too-large') {
                        return `Back image is too large (max 10MB)`;
                    }
                    if (error.code === 'file-invalid-type') {
                        return `Back image has invalid type (only JPG, PNG, SVG, WEBP allowed)`;
                    }
                    return `Back image was rejected: ${error.message}`;
                })
            ).flat();
            
            setResellerErrors([...resellerErrors.filter(e => !e.includes('back')), ...newErrors]);
        }
    });

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
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
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                        {status === '1' && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">Reseller Mode:</span>
                                <button
                                    type="button"
                                    onClick={handleSwitchReseller}
                                    disabled={switchLoading}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        isResellerEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                    } ${switchLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            isResellerEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                                <span className={`text-sm font-medium ${
                                    isResellerEnabled ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                    {isResellerEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        )}
                        <div className="">
                            <p className="text-sm font-medium text-gray-600">
                                Reseller Status:{" "}
                                <span className={`font-semibold text-${statusMap[status]?.color || 'blue'}-600`}>
                                    {statusMap[status]?.text || status}
                                </span>
                            </p>
                            {statusMap[status]?.description && (
                                <p className="text-xs text-gray-500 mt-1">{statusMap[status].description}</p>
                            )}
                        </div>
                    </div>
                    
                    {status === '1' ? (
                        <div className="space-y-5">
                            <div className="p-4 bg-green-50 text-green-600 rounded-md">
                                <p className="font-medium">Your Reseller verification is complete.</p>
                                <p className="text-sm mt-1">No further action is needed at this time.</p>
                            </div>

                            {submittedData && (
                                <div className="border border-gray-200 rounded-md p-5">
                                    <h6 className="text-lg font-medium mb-4">Submitted Information</h6>
                                    
                                    <div className="space-y-4">
                                        {submittedData.submitted_Data.map((field, index) => (
                                            <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                <p className="text-sm font-medium text-gray-500 mb-1">{field.label}</p>
                                                
                                                {field.type === 'file' ? (
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Image
                                                            src={`${backendBaseURL}/${submittedData.image_path}/${field.value}`}
                                                            width={80}
                                                            height={80}
                                                            alt={`${field.label} Preview`}
                                                            className="w-20 h-20 object-contain rounded-md border border-gray-200"
                                                            onError={(e) => {
                                                                e.target.src = submittedData.default_image_path;
                                                            }}
                                                        />
                                                        <span className="text-sm text-gray-700">{field.value}</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-700">{field.value}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {status === '3' && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                                    <p className="font-medium">Your verification was rejected.</p>
                                    {submittedData?.rejection_reason && (
                                        <p className="text-sm mt-1">Reason: {submittedData.rejection_reason}</p>
                                    )}
                                    <p className="text-sm mt-1">Please review and resubmit your documents.</p>
                                </div>
                            )}
                            
                            {/* ID Type Selection */}
                            <div>
                                <label className="block mb-2 text-sm font-medium">ID Type *</label>
                                <Listbox value={idType} onChange={setIdType}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                            <span className="block truncate">
                                                {idType || "Select ID Type"}
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {idTypeOptions.map((option, index) => (
                                                    <Listbox.Option
                                                        key={index}
                                                        value={option}
                                                        className={({ active }) =>
                                                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                                                active
                                                                    ? "bg-blue-600 text-white"
                                                                    : "text-gray-900"
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span
                                                                    className={`block truncate ${
                                                                        selected
                                                                            ? "font-medium"
                                                                            : "font-normal"
                                                                    }`}
                                                                >
                                                                    {option}
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                        <CheckIcon className="h-5 w-5" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Transition>
                                    </div>
                                </Listbox>
                            </div>
                            
                            <div>
                                <label className="block mb-2 text-sm font-medium">ID Verification *</label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Please upload clear images of both sides of your government-issued ID.
                                    Accepted formats: JPG, PNG, SVG, WEBP (max 10MB each).
                                </p>
                                
                                {/* Display errors if any */}
                                {resellerErrors.length > 0 && (
                                    <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-md">
                                        {resellerErrors.map((error, index) => (
                                            <p key={index} className="text-sm">{error}</p>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Front ID Upload */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Front of ID *</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            {...getFrontRootProps()}
                                            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors duration-200 flex-1 ${
                                                isFrontDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                                            } ${resellerErrors.some(e => e.includes('front')) ? 'border-red-500 bg-red-50' : ''}`}
                                        >
                                            <input {...getFrontInputProps()} />
                                            {frontPreview ? (
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={frontPreview}
                                                        width={80}
                                                        height={80}
                                                        alt="Front ID Preview"
                                                        className="w-20 h-20 object-contain rounded-md border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-700">{frontFile.name}</p>
                                                        <p className="text-xs text-gray-500">{Math.round(frontFile.size / 1024)} KB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-500">Drag & drop front ID image here, or click to select</p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Accepted formats: JPG, PNG, SVG, WEBP (max 10MB)
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
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Back ID Upload */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Back of ID *</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            {...getBackRootProps()}
                                            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors duration-200 flex-1 ${
                                                isBackDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                                            } ${resellerErrors.some(e => e.includes('back')) ? 'border-red-500 bg-red-50' : ''}`}
                                        >
                                            <input {...getBackInputProps()} />
                                            {backPreview ? (
                                                <div className="flex items-center gap-3">
                                                    <Image
                                                        src={backPreview}
                                                        width={80}
                                                        height={80}
                                                        alt="Back ID Preview"
                                                        className="w-20 h-20 object-contain rounded-md border border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-gray-700">{backFile.name}</p>
                                                        <p className="text-xs text-gray-500">{Math.round(backFile.size / 1024)} KB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-500">Drag & drop back ID image here, or click to select</p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        Accepted formats: JPG, PNG, SVG, WEBP (max 10MB)
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
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <Button
                                type="submit"
                                title={loading ? "Submitting..." : "Submit Verification"}
                                variant="primary"
                                size="md"
                                className="w-full"
                                disabled={loading || !frontFile || !backFile || !idType}
                            />
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}