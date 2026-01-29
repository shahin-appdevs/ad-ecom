'use client';
import { useCallback, useState, useEffect } from 'react';
import { profiledGetSellerAPI, profileUpdateSellerAPI, updatePasswordSellerAPI, kycGetSellerAPI, kycUpdateSellerAPI, ProfileDeleteSellerAPI } from "@root/services/apiClient/apiClient";
import { useDropzone } from 'react-dropzone';
import { toast } from "react-hot-toast";
import { 
    CameraIcon,
    DocumentIcon
} 
from '@heroicons/react/24/outline';
import Button from "@/components/utility/Button";
import Image from 'next/image';
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// Images
import user from "@public/images/user/userProfile.png";
  
export default function UserProfileSection() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [userImageFile, setUserImageFile] = useState(null);
    const [userImageUrl, setUserImageUrl] = useState(user);
    const [status, setStatus] = useState('Unverified');
    const [files, setFiles] = useState([]);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [kycRequirements, setKycRequirements] = useState([]);
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);
    const [kycErrors, setKycErrors] = useState([]);
    const [userData, setUserData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        mobile: '',
        mobile_code: '',
        gender: '',
        date_of_birth: '',
        address: {
            country: '',
            division: '',
            district: '',
            upazila: '',
            address: ''
        },
        nid_or_birth_id: '',
    });

    const statusMap = {
        0: { text: 'Unverified', color: 'red', description: 'Please complete KYC verification' },
        1: { text: 'Verified', color: 'green', description: 'Your KYC is verified' },
        2: { text: 'Pending', color: 'yellow', description: 'Your KYC is under review' },
        3: { text: 'Rejected', color: 'red', description: 'Your KYC was rejected. Please resubmit.' }
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await profiledGetSellerAPI();
                const data = response.data.data.user;
                
                setUserData({
                    firstname: data.firstname || '',
                    lastname: data.lastname || '',
                    email: data.email || '',
                    mobile: data.mobile || '',
                    mobile_code: data.mobile_code || '',
                    gender: data.gender || '',
                    date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
                    address: {
                        country: data.address?.country || '',
                        division: data.address?.division || '',
                        district: data.address?.district || '',
                        upazila: data.address?.upazila || '',
                        address: data.address?.address || ''
                    },
                    nid_or_birth_id: data.nid_or_birth_id || '',
                });

                // Set KYC status
                setStatus(data.kycStringStatus?.value || 'Pending');

                // Set user image
                if (data.userImage) {
                    setUserImageUrl(data.userImage);
                }
                setLoading(false);
            } catch (error) {
                toast.error(error.message || 'Failed to fetch profile data');
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setErrors({});

        try {
            const formData = new FormData();
            
            // Append basic user data
            formData.append('firstname', userData.firstname);
            formData.append('lastname', userData.lastname);
            formData.append('name', userData.firstname);
            formData.append('email', userData.email);
            formData.append('mobile', userData.mobile);
            formData.append('mobile_code', userData.mobile_code);
            formData.append('gender', userData.gender);
            formData.append('date_of_birth', userData.date_of_birth);
            formData.append('nid_or_birth_id', userData.nid_or_birth_id);
            
            // Append address data
            formData.append('country', userData.address.country);
            formData.append('division', userData.address.division);
            formData.append('district', userData.address.district);
            formData.append('upazila', userData.address.upazila);
            formData.append('address', userData.address.address);
            
            // Append image if changed
            if (userImageFile) {
                formData.append('image', userImageFile);
            }

            const response = await profileUpdateSellerAPI(formData);
            
            if (response.data.message?.success) {
                toast.success('Profile updated successfully');
                // Refresh user data
                const profileResponse = await profiledGetSellerAPI();
                const updatedData = profileResponse.data.data.user;
                setUserData(prev => ({
                    ...prev,
                    firstname: updatedData.firstname,
                    lastname: updatedData.lastname,
                    email: updatedData.email,
                    mobile: updatedData.mobile,
                    mobile_code: updatedData.mobile_code,
                    gender: updatedData.gender,
                    date_of_birth: updatedData.date_of_birth ? updatedData.date_of_birth.split('T')[0] : '',
                    address: {
                        country: updatedData.address?.country || '',
                        division: updatedData.address?.division || '',
                        district: updatedData.address?.district || '',
                        upazila: updatedData.address?.upazila || '',
                        address: updatedData.address?.address || ''
                    },
                    nid_or_birth_id: updatedData.nid_or_birth_id || '',
                }));
                if (updatedData.userImage) {
                    setUserImageUrl(updatedData.userImage);
                }
            } else {
                // Handle API validation errors
                if (response.data.message?.error) {
                    const apiErrors = {};
                    response.data.message.error.forEach(err => {
                        const field = err.match(/The (.*?) field/)?.[1]?.replace(' ', '_');
                        if (field) {
                            apiErrors[field] = err;
                        }
                    });
                    setErrors(apiErrors);
                    toast.error('Please fix the errors in the form');
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (isChanging) return;
        setIsChanging(true);
        try {
            const response = await updatePasswordSellerAPI(currentPassword, newPassword, passwordConfirmation);
            response.data.message.success.forEach((msg) => {
                toast.success(msg);
            });
            setCurrentPassword("");
            setNewPassword("");
            setPasswordConfirmation("");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message && error.response.data.message.error) {
                error.response.data.message.error.forEach((msg) => {
                    toast.error(msg);
                });
            } else {
                toast.error("Failed to update password.");
            }
        } finally {
            setIsChanging(false);
        }
    };

    const onProfileDelete = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const response = await ProfileDeleteSellerAPI();

            const successMessage = response?.data?.message?.success || "Profile delete successful";

            successMessage.forEach((msg) => {
                toast.success(msg);
            })

            closeModal;

            router.push("/user/auth/login");
        } catch (err) {
            if (err.response?.data?.message?.error) {
                const errors = err.response?.data?.message?.error;
                errors.forEach((msg) => {
                    toast.error(msg);
                });
            } else {
                toast.error("Server didn't respond");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchKYCData = useCallback(async () => {
        try {
            const response = await kycGetSellerAPI();
            const { kyc_status, userKyc } = response.data;
            
            setStatus(statusMap[kyc_status] || 'Unverified');
            setKycRequirements(userKyc || []);
        } catch (err) {
            console.error('Failed to fetch KYC data:', err);
            toast.error(err.message || 'Failed to load KYC information');
        }
    }, []);

    useEffect(() => {
        fetchKYCData();
    }, [fetchKYCData]);

    // Update the handleKycSubmit function
    const handleKycSubmit = async (e) => {
        e.preventDefault();
        
        // Validate files before submission
        const errors = [];
        if (!frontFile) errors.push('Please upload front of your ID');
        if (!backFile) errors.push('Please upload back of your ID');
        
        if (errors.length > 0) {
            setKycErrors(errors);
            return;
        }

        const toastId = toast.loading('Submitting KYC documents...');
        
        try {
            const response = await kycUpdateSellerAPI(frontFile, backFile);
            
            if (response.data && response.data.message.success) {
                toast.success('KYC submitted successfully! Status will update soon.', { id: toastId });
                setStatus('Pending');
                setFrontFile(null);
                setBackFile(null);
                setFrontPreview(null);
                setBackPreview(null);
                await fetchKYCData();
            }
        } catch (err) {
            console.error('KYC submission failed:', err);
            
            // Handle specific backend validation errors
            if (err.response?.data?.message?.error) {
                setKycErrors(err.response.data.message.error);
                toast.error('Please fix the errors in your submission', { id: toastId });
            } else {
                toast.error(
                    err.message || 'KYC submission failed',
                    { id: toastId }
                );
            }
        }
    };
    
    // Update the onDrop function to validate files immediately
    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
            const rejectionErrors = fileRejections.map(({ file, errors }) => 
                errors.map(error => {
                    if (error.code === 'file-too-large') {
                        return `File ${file.name} is too large (max 10MB)`;
                    }
                    if (error.code === 'file-invalid-type') {
                        return `File ${file.name} has invalid type (only JPG, PNG, SVG, WEBP allowed)`;
                    }
                    return `File ${file.name} was rejected: ${error.message}`;
                })
            ).flat();
            
            setKycErrors(rejectionErrors);
            return;
        }

        if (acceptedFiles.length > 0) {
            setFiles(acceptedFiles);
            setKycErrors([]);
        }
    }, []);

    // Add these dropzone configurations at the top of your component
    const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps, isDragActive: isFrontDragActive } = useDropzone({
        onDrop: acceptedFiles => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setFrontFile(file);
                setFrontPreview(URL.createObjectURL(file));
                setKycErrors(kycErrors.filter(e => e !== 'front'));
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
        onDropRejected: () => {
            setKycErrors([...kycErrors, 'front']);
        }
    });

    const { getRootProps: getBackRootProps, getInputProps: getBackInputProps, isDragActive: isBackDragActive } = useDropzone({
        onDrop: acceptedFiles => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setBackFile(file);
                setBackPreview(URL.createObjectURL(file));
                setKycErrors(kycErrors.filter(e => e !== 'back'));
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
        onDropRejected: () => {
            setKycErrors([...kycErrors, 'back']);
        }
    });


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserImageFile(file);
            // Create a preview URL for display
            setUserImageUrl(URL.createObjectURL(file));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
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
                    <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between mb-5 md:mb-2">
                        <h5>Profile Settings</h5>
                        <div className="flex items-center gap-2">
                            <Button
                                title="Delete Account"
                                variant="primary"
                                size="md"
                                className="!bg-red-600"
                                onClick={() => setIsLogoutModalOpen(true)}
                            />
                            <Button
                                href="/seller/setup/pin"
                                title="Setup PIN"
                                variant="primary"
                                size="md"
                            />
                        </div>
                    </div>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center col-span-1 md:col-span-2 gap-4">
                                <div className="relative w-20 h-20">
                                    <Image
                                        src={userImageUrl}
                                        width={80}
                                        height={80}
                                        alt="User"
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
                                    <h6 className="text-base font-medium">{userData.firstname} {userData.lastname}</h6>
                                    <p className="text-sm text-gray-500">{userData.mobile_code}{userData.mobile}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    className={`w-full border ${errors.firstname ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Firstname..."
                                    value={userData.firstname}
                                    onChange={handleInputChange}
                                />
                                {errors.firstname && <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    className={`w-full border ${errors.lastname ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Lastname..."
                                    value={userData.lastname}
                                    onChange={handleInputChange}
                                />
                                {errors.lastname && <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter Name..."
                                    value={userData.firstname}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Email..."
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Phone</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    className={`w-full border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Phone..."
                                    value={userData.mobile}
                                    onChange={handleInputChange}
                                    disabled
                                />
                                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    className={`w-full border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Country..."
                                    value={userData.address.country}
                                    onChange={handleAddressChange}
                                />
                                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Division</label>
                                <input
                                    type="text"
                                    name="division"
                                    className={`w-full border ${errors.division ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Division..."
                                    value={userData.address.division}
                                    onChange={handleAddressChange}
                                />
                                {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">District</label>
                                <input
                                    type="text"
                                    name="district"
                                    className={`w-full border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter District..."
                                    value={userData.address.district}
                                    onChange={handleAddressChange}
                                />
                                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Upazila</label>
                                <input
                                    type="text"
                                    name="upazila"
                                    className={`w-full border ${errors.upazila ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Upazila..."
                                    value={userData.address.upazila}
                                    onChange={handleAddressChange}
                                />
                                {errors.upazila && <p className="text-red-500 text-xs mt-1">{errors.upazila}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter Address..."
                                    value={userData.address.address}
                                    onChange={handleAddressChange}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Gender</label>
                                <select
                                    name="gender"
                                    className={`w-full border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    value={userData.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date Of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    className={`w-full border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    value={userData.date_of_birth}
                                    onChange={handleInputChange}
                                />
                                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">NID or Birth ID</label>
                                <input
                                    type="text"
                                    name="nid_or_birth_id"
                                    className={`w-full border ${errors.nid_or_birth_id ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100`}
                                    placeholder="Enter NID or Birth ID..."
                                    value={userData.nid_or_birth_id}
                                    onChange={handleInputChange}
                                />
                                {errors.nid_or_birth_id && <p className="text-red-500 text-xs mt-1">{errors.nid_or_birth_id}</p>}
                            </div>
                        </div>
                        <Button
                            type="submit"
                            title={isUpdating ? "Updating..." : "Update"}
                            variant="primary"
                            size="md"
                            className="w-full"
                            disabled={isUpdating}
                        />
                    </form>
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12 lg:col-span-5">
                    <div className="flex items-center justify-between mb-4">
                        <h5>Change Password</h5>
                    </div>
                    <form className="space-y-5" onSubmit={handlePasswordUpdate}>
                        <div>
                            <label className="block text-sm font-medium mb-2">Current Password</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Password..."
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Password..."
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Password..."
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            title={isChanging ? "Changing..." : "Change"}
                            variant="primary"
                            size="md"
                            className="w-full"
                            disabled={isChanging}
                        />
                    </form>
                </div>
                <div className="bg-white rounded-[12px] p-5 sm:p-6 md:p-7 col-span-12">
                    <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between mb-4">
                        <h5>KYC Information</h5>
                        <div className="">
                            <p className="text-sm font-medium text-gray-600">
                                KYC Status:{" "}
                                <span className={`font-semibold text-${statusMap[status]?.color || 'blue'}-600`}>
                                    {statusMap[status]?.text || status}
                                </span>
                            </p>
                            {statusMap[status]?.description && (
                                <p className="text-xs text-gray-500 mt-1">{statusMap[status].description}</p>
                            )}
                        </div>
                    </div>
                    
                    {status === 'Verified' ? (
                        <div className="p-4 bg-green-50 text-green-600 rounded-md">
                            <p className="font-medium">Your KYC verification is complete.</p>
                            <p className="text-sm mt-1">No further action is needed at this time.</p>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleKycSubmit}>
                            <div>
                                <label className="block mb-2 text-sm font-medium">ID Verification</label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Please upload clear images of both sides of your government-issued ID.
                                    Accepted formats: JPG, PNG, SVG, WEBP (max 10MB each).
                                </p>
                                
                                {/* Display errors if any */}
                                {kycErrors.length > 0 && (
                                    <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-md">
                                        {kycErrors.map((error, index) => (
                                            <p key={index} className="text-sm">{error}</p>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Front ID Upload */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Front of ID</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            {...getFrontRootProps()}
                                            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors duration-200 flex-1 ${
                                                isFrontDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                                            } ${kycErrors.includes('front') ? 'border-red-500 bg-red-50' : ''}`}
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
                                    <label className="block text-sm font-medium mb-2">Back of ID</label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            {...getBackRootProps()}
                                            className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors duration-200 flex-1 ${
                                                isBackDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                                            } ${kycErrors.includes('back') ? 'border-red-500 bg-red-50' : ''}`}
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
                                disabled={loading || !frontFile || !backFile}
                            />
                        </form>
                    )}
                </div>
            </div>
            <Transition appear show={isLogoutModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsLogoutModalOpen(false)}>
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
                                        <h6 className="mb-3">Are you sure to Delete Account?</h6>
                                        <p className="text-sm leading-[24px]">If you do not think you will use “JARA B2B” again and like your account deleted, we can take care of this for you. Keep in mind you will not be able to reactivate your account or retrieve any of the content or information you have added. If you would still like your account deleted, click “Delete Account”.?</p>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsLogoutModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className={`inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 ${loading ? "cursor-not-allowed" : ""}`}
                                            onClick={onProfileDelete} 
                                            disabled={loading}
                                        >
                                            {loading ? "Deleting" : "Delete Account"}
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