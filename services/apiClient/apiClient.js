// Packages
import axios from "axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

// API base url
const apiFrontendURL = process.env.NEXT_PUBLIC_FRONTEND_API_URL;
const apiUserURL = process.env.NEXT_PUBLIC_USER_API_URL;
const apiSellerURL = process.env.NEXT_PUBLIC_SELLER_API_URL;

// API Client (axios) with version
const apiClientFrontend = axios.create({
    baseURL: `${apiFrontendURL}`,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

const apiClient = axios.create({
    baseURL: `${apiUserURL}`,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

const apiClientSeller = axios.create({
    baseURL: `${apiSellerURL}`,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Helper function to retrieve token from localStorage or sessionStorage
const getToken = () => {
    return localStorage.getItem("jwtToken");
};

const getSellerToken = () => {
    return localStorage.getItem("jwtSellerToken");
};

// Interceptor for handling 401 Unauthorized responses
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("jwtToken");
            // sessionStorage.removeItem("jwtToken"); // Removed as per task
            localStorage.removeItem("userInfo");
            localStorage.removeItem("email_verified");
            localStorage.removeItem("sms_verified");
            localStorage.removeItem("two_factor_verified");
            toast.error("Unauthenticated");
            window.location.href = "/user/auth/login";
        }
        return Promise.reject(error);
    },
);

apiClientSeller.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("jwtSellerToken");
            toast.error("Unauthenticated");
            window.location.href = "/seller/auth/login";
        }
        return Promise.reject(error);
    },
);

//**************** Frontend ****************/

// Home Get API (get)
export const homeGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/home?lang=${lang}`);
};

// Flash Get API (get)
export const flashGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/page/flash?lang=${lang}`);
};

// New Arrival Get API (get)
export const newArrivalGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/page/new-arrival?lang=${lang}`);
};

// Brand Get API (get)
export const brandGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/page/brands?lang=${lang}`);
};

// Stall Get API (get)
export const stallGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/home/all-stalls?lang=${lang}`);
};

// Search Product Get API (get)
export const searchProductGetAPI = (title, searchType, lang = "") => {
    return apiClientFrontend.get(
        `/home/search-products?title=${title}&search_type=${searchType}&lang=${lang}`,
    );
};

// Category Get API (get)
export const categoryGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/page/categories?lang=${lang}`);
};

// Child Category Get API (get)
export const childCategoryGetAPI = (categoryId, lang = "") => {
    return apiClientFrontend.get(
        `/page/get-child-categories?category_id=${categoryId}&lang=${lang}`,
    );
};

// Child Sub Category Get API (get)
export const childSubCategoryGetAPI = (childCategoryId, lang = "") => {
    return apiClientFrontend.get(
        `/page/get-child-sub-categories?child_category_id=${childCategoryId}&lang=${lang}`,
    );
};

// Product Get API (get)
export const productGetAPI = (
    categoryId,
    childCategoryId,
    childSubCategoryId,
    lang = ""
) => {
    const childCategoryIdParam = childCategoryId
        ? `&child_category_id=${childCategoryId}`
        : "";
    const childSubcategoryIdParam = childSubCategoryId
        ? `&child_sub_category_id=${childSubCategoryId}`
        : "";

    return apiClientFrontend.get(
        `/home/get-products?category_id=${categoryId}${childCategoryIdParam}${childSubcategoryIdParam}&lang=${lang}`,
    );
};

// Product Details Get API (get)
export const productDetailsGetAPI = (productId, lang = "") => {
    return apiClientFrontend.get(
        `/home/get-product-details?product_id=${productId}&lang=${lang}`,
    );
};

// Stall Details Get API (get)
export const stallDetailsGetAPI = (stallId, lang = "") => {
    return apiClientFrontend.get(
        `/home/products-under-stall?stall_id=${stallId}&lang=${lang}`,
    );
};

// Footer Info
export const footerInfoGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/home/footer/page?lang=${lang}`);
};

// Add to Wishlist API (post)
export const addWishlistAPI = (productId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClientFrontend.post(
            `/product/wishlist/add/remove?lang=${lang}`,
            {
                product_id: productId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Review API (post)
export const productReviewAPI = (productId, rating, review, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClientFrontend.post(
            `/home/post-review?lang=${lang}`,
            {
                product_id: productId,
                rating,
                review,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Brand Product Get API (get)
export const brandProductGetAPI = (brandId, lang = "") => {
    return apiClientFrontend.get(
        `/home/get-product-under-brand?brand_id=${brandId}&lang=${lang}`,
    );
};

// Campaigns Get API (get)
export const campaignsGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/page/campaigns?lang=${lang}`);
};

// Campaign Product Get API (get)
export const campaignProductGetAPI = (campaignId, lang = "") => {
    return apiClientFrontend.get(
        `/page/product-under-campaign?campaign_id=${campaignId}&lang=${lang}`,
    );
};

// Collections Get API (get)
export const collectionsGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/page/collections?lang=${lang}`);
};

// Collection Product Get API (get)
export const collectionProductGetAPI = (collectionId, lang = "") => {
    return apiClientFrontend.get(
        `/page/product-under-collection?collection_id=${collectionId}&lang=${lang}`,
    );
};

// Delivery Option Get API (get)
export const deliveryOptionGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/checkout/delivery-options?lang=${lang}`);
};

// Division Data Get API (get)
export const divisionDataGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/app-settings/all-divisions-data?lang=${lang}`);
};

// Online Gateways Get API (get)
export const onlineGatewaysGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/checkout/online-gateways?lang=${lang}`);
};

// Online Gateways Get API (get)
export const appSettingGetAPI = (lang = "") => {
    return apiClientFrontend.get(`/app-settings?lang=${lang}`);
};

// Pagination next page get API (get) for frontend
export const nextPageGetAPI = (url) => {
     return axios.get(url);
};

// Order Confirm API (post)
export const orderConfirmAPI = (formData, lang = "") => {
    const token = getToken();
    if (!token) {
        toast.error("Please log in to complete your order");
        return;
    }
    if (token) {
        return apiClientFrontend.post(`/checkout/order/confirmed?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

//**************** User Panel ****************/

const getDeviceId = () => {
    let deviceId = localStorage.getItem("device-id");
    if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("device-id", deviceId);
    }

    return deviceId;
};

// Register API (post)
export const registerAPI = (formData, lang = "") => {
    const deviceId = getDeviceId();
    return apiClient.post(`/user/register?lang=${lang}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Device-ID": deviceId,
        },
    });
};

// Basic Data GET Api
export const basicDataGetAPI = (lang = "") => {
    return apiClient.get(`/get/basic/data?lang=${lang}`);
};

// Login API (post)
export const loginAPI = (formData, lang = "") => {
    return apiClient.post(`/user/login?lang=${lang}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
// send otp
export const sendOtpAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/send-code?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    }
};
// Login API (post)
export const emailVerifyAPI = (formData, lang = "") => {
    const token = getToken();

    if (token) {
        return apiClient.post(`/user/email-verify?lang=${lang}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });
    }
};

// Authorization API (post)
export const authorizationCodeAPI = (code, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/phone-verify?lang=${lang}`,
            { code: code },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Resend Authorization Code API (post)
export const resendAuthorizationCodeAPI = async (lang = "") => {
    const token = getToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    try {
        const response = await apiClient.post(
            `/user/send/code/phone?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
        return response;
    } catch (error) {
        console.error("Resend OTP error:", error);
        throw error;
    }
};

// Forgot Password API (post)
export const forgotPasswordAPI = (credentials, lang = "") => {
    return apiClient.post(`/user/forget/password?lang=${lang}`, credentials);
};

// Forgot Password OTP API (post)
export const forgotPasswordOtpAPI = (phone, code, lang = "") => {
    return apiClient.post(`/user/forget/sms/verify/otp?lang=${lang}`, { phone, code });
};

// Resend Forgot Password OTP API (post)
export const resendforgotPasswordOtpAPI = (phone, lang = "") => {
    return apiClient.post(`/user/forget/sms/resend?lang=${lang}`, { phone });
};

// Reset Password API (post)
export const resetPasswordAPI = (
    phone,
    token,
    password,
    passwordConfirmation,
    lang = ""
) => {
    return apiClient.post(`/user/forget/sms/reset/password?lang=${lang}`, {
        phone,
        token,
        password,
        password_confirmation: passwordConfirmation,
    });
};

// 2fa API (post)
export const twoFactorAPI = (otp, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/google-2fa/otp/verify?lang=${lang}`,
            {
                otp,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Logout API (post)
export const logoutAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/logout?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Dashboard Get API (get)
export const dashboardGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/dashboard?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Wallet Get API (get)
export const walletGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/wallets?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Get API (get)
export const profiledGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/profile?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Update API (post)
export const profileUpdateAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/profile/update?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Update Password API (post)
export const updatePasswordAPI = (
    currentPassword,
    newPassword,
    passwordConfirmation,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/password/update?lang=${lang}`,
            {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: passwordConfirmation,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Reseller Info Get API (get)
export const resellerInfoGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/profile/reseller/apply/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Reseller Submit Info Get API (get)
export const resellerSubmitInfoGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/profile/reseller/apply/submit/data?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Reseller Submit API (post)
export const resellerSubmitAPI = (idType, idFrontPart, idBackPart, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/profile/reseller/apply/info/submit?lang=${lang}`,
            {
                id_type: idType,
                id_front_part: idFrontPart,
                id_back_part: idBackPart,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Switch Reseller API (post)
export const switchResellerAPI = (status, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/profile/reseller/switch/reseller?lang=${lang}`,
            {
                status,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Kyc Get API (get)
export const kycGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/kyc?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// KYC Update API (post)
export const kycUpdateAPI = (frontFile, backFile, lang = "") => {
    const token = getToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    const formData = new FormData();
    if (frontFile) formData.append("id_front_part", frontFile);
    if (backFile) formData.append("id_back_part", backFile);

    return apiClient.post(`/user/kyc/submit?lang=${lang}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
};

// Setup Pin API (post)
export const SetupPinAPI = (pinCode, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/setup/pin/store?lang=${lang}`,
            {
                pin_code: pinCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Update Pin API (post)
export const UpdatePinAPI = (oldPin, newPin, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/setup/pin/update?lang=${lang}`,
            {
                old_pin: oldPin,
                new_pin: newPin,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Verify Pin API (post)
export const VerifyPinAPI = (pin, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/verify/pin?lang=${lang}`,
            {
                pin,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Delete API (post)
export const ProfileDeleteAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/delete/account?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Receive Money Get API (get)
export const receiveMoneyGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/receive-money?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Referral Status Get API (get)
export const referralStatusGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/referral-status/index?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Affiliate Plan Get API (get)
export const affiliatePlanGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/affiliate/plan/subscribe/index?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Affiliate Plan Initialize API (post)
export const affiliatePlanInitializeAPI = (
    planId,
    amount,
    currency,
    source,
    successReturnUrl,
    cancelReturnUrl,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/affiliate/plan/subscribe/initialize?lang=${lang}`,
            {
                plan_id: Number(planId),
                amount: Number(amount),
                currency: currency,
                source,
                success_return_url: successReturnUrl,
                cancel_return_url: cancelReturnUrl,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Add Money Get API (get)
export const addMoneyGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/add-money/information?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Insert Add Money API (post)
export const InsertAddMoneyAPI = (
    depositType,
    amount,
    currency,
    walletCurrency,
    source,
    successReturnUrl,
    cancelReturnUrl,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/add-money/submit-data?lang=${lang}`,
            {
                deposit_type: depositType,
                amount,
                currency,
                wallet_currency: walletCurrency,
                source,
                success_return_url: successReturnUrl,
                cancel_return_url: cancelReturnUrl,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Manual Add Money API (post)
export const ManualAddMoneyAPI = (data, lang = "") => {
    const token = getToken();
    if (!token) throw new Error("No token found. Please log in.");

    return apiClient.post(`/user/add-money/manual/payment/confirmed?lang=${lang}`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
};

// Tatum Add Money API (post)
export const tatumAddMoneyAPI = (txnHash, trxRef, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/add-money/payment/crypto/confirm/${trxRef}?lang=${lang}`,
            {
                txn_hash: txnHash,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Withdraw Get API (get)
export const withdrawGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/withdraw/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Insert Withdraw API (post)
export const InsertWithdrawAPI = (amount, currency, gateway, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/withdraw/insert?lang=${lang}`,
            {
                amount,
                currency,
                gateway,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Manual Withdraw API (post)
export const ManualWithdrawAPI = (formdata, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/withdraw/manual/confirmed?lang=${lang}`, formdata, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Automatic Withdraw API (post)
export const AutomaticWithdrawAPI = (
    trx,
    bankName,
    accountNumber,
    routingNumber,
    swiftCode,
    beneficiaryName,
    beneficiaryAddress,
    beneficiaryCountry,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/withdraw/automatic/confirmed?lang=${lang}`,
            {
                trx,
                bank_name: bankName,
                account_number: accountNumber,
                routing_number: routingNumber,
                swift_code: swiftCode,
                beneficiary_name: beneficiaryName,
                beneficiary_address: beneficiaryAddress,
                beneficiary_country: beneficiaryCountry,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Flutterwave Banks Get API (get)
export const flutterwaveBanksGetAPI = (trxRef, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/withdraw/get/flutterwave/banks?trx=${trxRef}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Flutterwave Bank Branches Get API (get)
export const flutterwaveBankBranchesGetAPI = (trxRef, bankId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/withdraw/get/flutterwave/bank/branches?trx=${trxRef}&bank_id=${bankId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Exchange Get API (get)
export const exchangeGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/money-exchange?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Exchange API (post)
export const SubmitExchangeAPI = (
    exchangeFromAmount,
    exchangeFromCurrency,
    exchangeToAmount,
    exchangeToCurrency,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/money-exchange/submit?lang=${lang}`,
            {
                exchange_from_amount: exchangeFromAmount,
                exchange_from_currency: exchangeFromCurrency,
                exchange_to_amount: exchangeToAmount,
                exchange_to_currency: exchangeToCurrency,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Send Money Get API (get)
export const sendMoneyGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/send-money/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Send Money API (post)
export const SubmitSendMoneyAPI = (
    transferType,
    credentials,
    senderAmount,
    senderWallet,
    receiverAmount,
    receiverWallet,
    remark,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/send-money/confirmed?lang=${lang}`,
            {
                transfer_type: transferType,
                credentials,
                sender_amount: senderAmount,
                sender_wallet: senderWallet,
                receiver_amount: receiverAmount,
                receiver_wallet: receiverWallet,
                remark,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Send Money Check User API (post)
export const SendMoneyCheckUserAPI = (credentials, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/send-money/exist?lang=${lang}`,
            {
                credentials,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Send Money Scan API (post)
export const SendMoneyScanAPI = (qrCode, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/send-money/qr/scan?lang=${lang}`,
            {
                qr_code: qrCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Make Payment Get API (get)
export const makePaymentGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/make-payment/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Make Payment API (post)
export const submitMakePaymentAPI = (
    credentials,
    senderAmount,
    senderWallet,
    receiverAmount,
    receiverWallet,
    remark,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/make-payment/confirmed?lang=${lang}`,
            {
                credentials,
                sender_amount: senderAmount,
                sender_wallet: senderWallet,
                receiver_amount: receiverAmount,
                receiver_wallet: receiverWallet,
                remark,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Make Payment Check Merchant API (post)
export const makePaymentCheckMerchantAPI = (credentials, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/make-payment/check/merchant?lang=${lang}`,
            {
                credentials,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Make Payment Scan API (post)
export const makePaymentScanAPI = (qrCode, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/make-payment/merchants/scan?lang=${lang}`,
            {
                qr_code: qrCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Money Out Get API (get)
export const moneyOutGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/money-out/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Money Out API (post)
export const SubmitMoneyOutAPI = (
    credentials,
    senderAmount,
    senderWallet,
    receiverAmount,
    receiverWallet,
    remark,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/money-out/confirmed?lang=${lang}`,
            {
                credentials,
                sender_amount: senderAmount,
                sender_wallet: senderWallet,
                receiver_amount: receiverAmount,
                receiver_wallet: receiverWallet,
                remark,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Money Out Check Agent API (post)
export const moneyOutCheckAgentAPI = (credentials, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/money-out/check/agent?lang=${lang}`,
            {
                credentials,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Money Out Scan API (post)
export const moneyOutScanAPI = (qrCode, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/money-out/qr/scan?lang=${lang}`,
            {
                qr_code: qrCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Request Money Get API (get)
export const requestMoneyGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/request-money?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Request Money API (post)
export const SubmitRequestMoneyAPI = (
    requestAmount,
    currency,
    credentials,
    remark,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/request-money/submit?lang=${lang}`,
            {
                request_amount: requestAmount,
                currency,
                credentials,
                remark,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Request Money Check User API (post)
export const requestMoneyCheckUserAPI = (credentials, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/request-money/check/user?lang=${lang}`,
            {
                credentials,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Request Money Scan API (post)
export const requestMoneyScanAPI = (qrCode, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/request-money/qr/scan?lang=${lang}`,
            {
                qr_code: qrCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link List API (get)
export const paymentLinkListAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/payment-links?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link Store API (post)
export const paymentLinkStoreAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/payment-links/store?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link Update API (post)
export const paymentLinkUpdateAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/payment-links/update?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link Status API (post)
export const paymentLinkStatusAPI = (target, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/payment-links/status?lang=${lang}`,
            {
                target,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link Edit API (get)
export const paymentLinkEditAPI = (target, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/payment-links/edit?target=${target}&lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link Share API (get)
export const paymentLinkShareAPI = (linkToken, lang = "") => {
    return apiClient.get(`/payment/link/share?token=${linkToken}&lang=${lang}`, {});
};

// Payment Link Share Submit API (post)
export const paymentLinkShareSubmitAPI = (
    target,
    paymentType,
    email,
    phone,
    fullName,
    userId,
    walletCurrency,
    amount,
    cardName,
    cardToken,
    last4Card,
    paymentGateway,
    source,
    successReturnUrl,
    cancelReturnUrl,
    lang = ""
) => {
    const token = getToken();

    if (paymentType === "wallet_payment") {
        if (token) {
            return apiClient.post(
                `/payment/link/submit?lang=${lang}`,
                {
                    target,
                    payment_type: paymentType,
                    email,
                    phone,
                    full_name: fullName,
                    user_id: userId,
                    wallet_currency: walletCurrency,
                    amount,
                    card_name: cardName,
                    token: cardToken,
                    last4_card: last4Card,
                    payment_gateway: paymentGateway,
                    source,
                    success_return_url: successReturnUrl,
                    cancel_return_url: cancelReturnUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } else {
            throw new Error("No token found. Please log in.");
        }
    }
    if (paymentType === "card_payment" || paymentType === "payment_gateway") {
        return apiClient.post(
            `/payment/link/submit?lang=${lang}`,
            {
                target,
                payment_type: paymentType,
                email,
                phone,
                full_name: fullName,
                user_id: userId,
                wallet_currency: walletCurrency,
                amount,
                card_name: cardName,
                token: cardToken,
                last4_card: last4Card,
                payment_gateway: paymentGateway,
                source,
                success_return_url: successReturnUrl,
                cancel_return_url: cancelReturnUrl,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("Invalid payment type.");
    }
};

// Bill Pay Get API (get)
export const billPayGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/bill-pay/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Bill Pay API (post)
export const SubmitBillPayAPI = (
    billerItemType,
    billType,
    billMonth,
    billNumber,
    amount,
    currency,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/bill-pay/confirmed?lang=${lang}`,
            {
                biller_item_type: billerItemType,
                bill_type: billType,
                bill_month: billMonth,
                bill_number: billNumber,
                amount,
                currency,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Mobile Top Up Get API (get)
export const mobileTopupGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/mobile-topup/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Mobile Top Up API (post)
export const SubmitMobileTopupAPI = (
    topupType,
    mobileCode,
    mobileNumber,
    amount,
    currency,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/mobile-topup/confirmed?lang=${lang}`,
            {
                topup_type: topupType,
                mobile_code: mobileCode,
                mobile_number: mobileNumber,
                amount,
                currency,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Mobile Top Up Automatic Get API (get)
export const mobileTopupAutomaticGetAPI = (
    mobileCode,
    mobileNumber,
    countryCode,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/mobile-topup/automatic/check-operator?mobile_code=${mobileCode}&mobile_number=${mobileNumber}&country_code=${countryCode}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Mobile Top Up Automatic API (post)
export const SubmitMobileTopupAutomaticAPI = (
    operatorId,
    mobileCode,
    mobileNumber,
    countryCode,
    amount,
    currency,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/mobile-topup/automatic/pay?lang=${lang}`,
            {
                operator_id: operatorId,
                mobile_code: mobileCode,
                mobile_number: mobileNumber,
                country_code: countryCode,
                amount,
                currency,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Local Mobile Topup Info GET API
export const localMobileTopupInfoGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/mobile-topup/local/topup-info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Local Mobile Top Up API (post)
export const submitLocalMobileTopupAPI = (topupData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/mobile-topup/local/pay?lang=${lang}`, topupData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Order Get API (get)
export const productOrderGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/product-orders/index?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Order Details Get API (get)
export const productOrderDetailsGetAPI = (orderId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/product-orders/details?order_id=${orderId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Order Download Invoice Get API (get)
export const productOrderDownloadInvoiceGetAPI = (orderId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/product-orders/invoice/export?order_id=${orderId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Point To Cash Get API (get)
export const pointToCashGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/point/convert/index?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Point convert API (post)
export const pointConvertAPI = (pointId, pointAmount, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/point/convert/submit?lang=${lang}`,
            {
                point_id: pointId,
                point_amount: pointAmount,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// All Transactions Get API (get)
export const allTransactionsGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/transactions?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Google 2FA Get API (get)
export const google2faGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/security/google-2fa?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Google 2FA Submit API (post)
export const submitGoogle2faAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/security/google-2fa/status/update?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// gift card api (get)
export const myGiftCardGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/gift-card?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// all gift card api (get)
export const allGiftCardGetAPI = (countryIso, currentPage, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/gift-card/all?country=${countryIso}&page=${currentPage}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// gift card details api (get)
export const giftCardDetailsGetAPI = (productId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/gift-card/details?product_id=${productId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// gift card order api
export const submitGiftOrderAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/gift-card/order?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

//------------------> strowallet virtual card api <---------------/

// my strowallet card
export const myStroWalletCardGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/strowallet-card?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet card fee charge
export const stroWalletFeeChargeGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/strowallet-card/charges?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet page info
export const stroWalletPageInfoGetApi = (lang = "en") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/strowallet-card/create/info?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet virtual card create customer api
export const createCustomerAPI = (formData, lang = "en") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/strowallet-card/create/customer?lang=${lang}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};
// strowallet virtual card update customer api
export const updateCustomerAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/strowallet-card/update/customer?lang=${lang}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet card details
export const stroWalletCardDetailsGetAPI = (cardId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/strowallet-card/details?card_id=${cardId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet virtual card freeze api
export const stroWalletCardFreezedAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/strowallet-card/block?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};
// strowallet virtual card  unfreeze api
export const stroWalletCardUnfreezeAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/strowallet-card/unblock?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};
// strowallet virtual card  buy api
export const stroWalletBuyCardAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/strowallet-card/create?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};
// strowallet virtual card  fund api
export const stroWalletCardFundAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/strowallet-card/fund?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};
// strowallet virtual card  make default api
export const stroWalletCardMakeDefaultOrRemove = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/strowallet-card/make-remove/default?lang=${lang}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet card transaction api
export const stroWalletCardTransactionGetAPI = (cardId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/strowallet-card/transaction?card_id=${cardId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};
// strowallet card remaining limit
export const walletCardRemainingLimitsGetAPI = (
    transactionType,
    attribute,
    senderAmount,
    currencyCode,
    chargeId,
    lang = ""
) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/get-remaining?transaction_type=${transactionType}&attribute=${attribute}&sender_amount=${senderAmount}&currency_code=${currencyCode}&charge_id=${chargeId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet webhook transaction
export const stroWalletWebhookTransaction = (cardId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/strowallet-card/webhook?card_id=${cardId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

//------------------> sudo virtual card api <---------------/

// my sudo virtual cards
export const mySudoVirtualCardGetAPI = (lang = "en") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/my-card/sudo?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card fee charge
export const sudoVirtualCardFeeChargeGetAPI = (lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/my-card/sudo/charges?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card buy api
export const sudoVirtualBuyCardAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/my-card/sudo/create?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card details
export const sudoVirtualCardDetailsGetAPI = (cardId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/my-card/sudo/details?card_id=${cardId}&lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card freeze api
export const sudoVirtualCardFreezeAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/my-card/sudo/block?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card unfreeze api
export const sudoVirtualCardUnfreezeAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/my-card/sudo/unblock?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card transaction api
export const sudoVirtualCardTransactionGetAPI = (cardId, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/my-card/sudo/transaction?card_id=${cardId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card fund api
export const sudoVirtualCardMakeDefaultOrRemove = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/my-card/sudo/make-remove/default?lang=${lang}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card  fund api
export const sudoVirtualCardFundAPI = (formData, lang = "") => {
    const token = getToken();
    if (token) {
        return apiClient.post(`/user/my-card/sudo/fund?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};



//**************** Seller Panel ****************/
// Register API (post)
export const registerSellerAPI = (formData, lang = "") => {
    return apiClientSeller.post(`/seller/register?lang=${lang}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Login API (post)
export const loginSellerAPI = (formData, lang = "") => {
    return apiClientSeller.post(`/seller/login?lang=${lang}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Authorization API (post)
export const authorizationCodeSellerAPI = (code, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/phone-verify?lang=${lang}`,
            { code: code },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Resend Authorization Code API (post)
export const resendAuthorizationCodeSellerAPI = async (lang = "") => {
    const token = getSellerToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    try {
        const response = await apiClientSeller.post(
            `/seller/send/code/phone?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
        return response;
    } catch (error) {
        console.error("Resend OTP error:", error);
        throw error;
    }
};

// Forgot Password API (post)
export const forgotPasswordSellerAPI = (credentials, lang = "") => {
    return apiClientSeller.post(`/seller/forget/password?lang=${lang}`, credentials);
};

// Forgot Password OTP API (post)
export const forgotPasswordOtpSellerAPI = (phone, code, lang = "") => {
    return apiClientSeller.post(`/seller/forget/sms/verify/otp?lang=${lang}`, {
        phone,
        code,
    });
};

// Resend Forgot Password OTP API (post)
export const resendforgotPasswordOtpSellerAPI = (phone, lang = "") => {
    return apiClientSeller.post(`/seller/forget/sms/resend?lang=${lang}`, { phone });
};

// Reset Password API (post)
export const resetPasswordSellerAPI = (
    phone,
    token,
    password,
    passwordConfirmation,
    lang = ""
) => {
    return apiClientSeller.post(`/seller/forget/sms/reset/password?lang=${lang}`, {
        phone,
        token,
        password,
        password_confirmation: passwordConfirmation,
    });
};

// 2fa API (post)
export const twoFactorSellerAPI = (otp, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/google-2fa/otp/verify?lang=${lang}`,
            {
                otp,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Logout API (post)
export const logoutSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/logout?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Dashboard Get API (get)
export const dashboardGetSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(`/seller/dashboard?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Wallet Get API (get)
export const walletGetSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(`/seller/wallets?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Get API (get)
export const profiledGetSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(`/seller/profile?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Update API (post)
export const profileUpdateSellerAPI = (formData, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(`/seller/profile/update?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Update Password API (post)
export const updatePasswordSellerAPI = (
    currentPassword,
    newPassword,
    passwordConfirmation,
    lang = ""
) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/password/update?lang=${lang}`,
            {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: passwordConfirmation,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Kyc Get API (get)
export const kycGetSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(`/seller/kyc?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// KYC Update API (post)
export const kycUpdateSellerAPI = (frontFile, backFile, lang = "") => {
    const token = getSellerToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    const formData = new FormData();
    if (frontFile) formData.append("id_front_part", frontFile);
    if (backFile) formData.append("id_back_part", backFile);

    return apiClientSeller.post(`/seller/kyc/submit?lang=${lang}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
};

// Setup Pin API (post)
export const SetupPinSellerAPI = (pinCode, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/setup/pin/store?lang=${lang}`,
            {
                pin_code: pinCode,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Update Pin API (post)
export const UpdatePinSellerAPI = (oldPin, newPin, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/setup/pin/update?lang=${lang}`,
            {
                old_pin: oldPin,
                new_pin: newPin,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Verify Pin API (post)
export const VerifyPinSellerAPI = (pin, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/verify/pin?lang=${lang}`,
            {
                pin,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Delete API (post)
export const ProfileDeleteSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/delete/account?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Google 2FA Get API (get)
export const google2faGetSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(`/seller/security/google-2fa?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Google 2FA Submit API (post)
export const submitGoogle2faSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/security/google-2fa/status/update?lang=${lang}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Get API (get)
export const productGetSellerAPI = (lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(`/seller/product?lang=${lang}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Store Product API (post)
export const StoreProductSellerAPI = (formData, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(`/seller/product/store?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Status Update API (post)
export const productStatusUpdateSellerAPI = (ids, status, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            `/seller/product/bulk-status-update?lang=${lang}`,
            {
                ids,
                status,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Edit Product API (get)
export const editProductSellerAPI = (productId, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(
            `/seller/product/edit?product_id=${productId}&lang=${lang}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Update Product API (post)
export const UpdateProductSellerAPI = (formData, lang = "") => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(`/seller/product/update?lang=${lang}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};