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
export const homeGetAPI = () => {
    return apiClientFrontend.get("/home");
};

// Flash Get API (get)
export const flashGetAPI = () => {
    return apiClientFrontend.get("/page/flash");
};

// New Arrival Get API (get)
export const newArrivalGetAPI = () => {
    return apiClientFrontend.get("/page/new-arrival");
};

// Brand Get API (get)
export const brandGetAPI = () => {
    return apiClientFrontend.get("/page/brands");
};

// Stall Get API (get)
export const stallGetAPI = () => {
    return apiClientFrontend.get("/home/all-stalls");
};

// Search Product Get API (get)
export const searchProductGetAPI = (title, searchType) => {
    return apiClientFrontend.get(
        `/home/search-products?title=${title}&search_type=${searchType}`,
    );
};

// Category Get API (get)
export const categoryGetAPI = () => {
    return apiClientFrontend.get("/page/categories");
};

// Child Category Get API (get)
export const childCategoryGetAPI = (categoryId) => {
    return apiClientFrontend.get(
        `/page/get-child-categories?category_id=${categoryId}`,
    );
};

// Child Sub Category Get API (get)
export const childSubCategoryGetAPI = (childCategoryId) => {
    return apiClientFrontend.get(
        `/page/get-child-sub-categories?child_category_id=${childCategoryId}`,
    );
};

// Product Get API (get)
export const productGetAPI = (
    categoryId,
    childCategoryId,
    childSubCategoryId,
) => {
    const childCategoryIdParam = childCategoryId
        ? `&child_category_id=${childCategoryId}`
        : "";
    const childSubcategoryIdParam = childSubCategoryId
        ? `&child_sub_category_id=${childSubCategoryId}`
        : "";

    return apiClientFrontend.get(
        `/home/get-products?category_id=${categoryId}${childCategoryIdParam}${childSubcategoryIdParam}`,
    );
};

// Product Details Get API (get)
export const productDetailsGetAPI = (productId) => {
    return apiClientFrontend.get(
        `/home/get-product-details?product_id=${productId}`,
    );
};

// Stall Details Get API (get)
export const stallDetailsGetAPI = (stallId) => {
    return apiClientFrontend.get(
        `/home/products-under-stall?stall_id=${stallId}`,
    );
};

// Footer Info
export const footerInfoGetAPI = () => {
    return apiClientFrontend.get("/home/footer/page");
};

// Add to Wishlist API (post)
export const addWishlistAPI = (productId) => {
    const token = getToken();
    if (token) {
        return apiClientFrontend.post(
            "/product/wishlist/add/remove",
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
export const productReviewAPI = (productId, rating, review) => {
    const token = getToken();
    if (token) {
        return apiClientFrontend.post(
            "/home/post-review",
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
export const brandProductGetAPI = (brandId) => {
    return apiClientFrontend.get(
        `/home/get-product-under-brand?brand_id=${brandId}`,
    );
};

// Campaigns Get API (get)
export const campaignsGetAPI = () => {
    return apiClientFrontend.get("/page/campaigns");
};

// Campaign Product Get API (get)
export const campaignProductGetAPI = (campaignId) => {
    return apiClientFrontend.get(
        `/page/product-under-campaign?campaign_id=${campaignId}`,
    );
};

// Collections Get API (get)
export const collectionsGetAPI = () => {
    return apiClientFrontend.get("/page/collections");
};

// Collection Product Get API (get)
export const collectionProductGetAPI = (collectionId) => {
    return apiClientFrontend.get(
        `/page/product-under-collection?collection_id=${collectionId}`,
    );
};

// Delivery Option Get API (get)
export const deliveryOptionGetAPI = () => {
    return apiClientFrontend.get("/checkout/delivery-options");
};

// Division Data Get API (get)
export const divisionDataGetAPI = () => {
    return apiClientFrontend.get("/app-settings/all-divisions-data");
};

// Online Gateways Get API (get)
export const onlineGatewaysGetAPI = () => {
    return apiClientFrontend.get("/checkout/online-gateways");
};
// Online Gateways Get API (get)
export const appSettingGetAPI = () => {
    return apiClientFrontend.get("/app-settings?lang=en");
};

// Order Confirm API (post)
export const orderConfirmAPI = (formData) => {
    const token = getToken();
    if (!token) {
        toast.error("Please log in to complete your order");
        return;
    }
    if (token) {
        return apiClientFrontend.post("/checkout/order/confirmed", formData, {
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
    console.log("Device-ID:", deviceId);
    return deviceId;
};

// Register API (post)
export const registerAPI = (formData) => {
    const deviceId = getDeviceId();
    return apiClient.post("/user/register", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Device-ID": deviceId,
        },
    });
};

// Login API (post)
export const loginAPI = (formData) => {
    return apiClient.post("/user/login", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
// send otp
export const sendOtpAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/send-code",
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
export const emailVerifyAPI = (formData) => {
    const token = getToken();

    if (token) {
        return apiClient.post("/user/email-verify", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });
    }
};

// Authorization API (post)
export const authorizationCodeAPI = (code) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/phone-verify",
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
export const resendAuthorizationCodeAPI = async () => {
    const token = getToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    try {
        const response = await apiClient.post(
            "/user/send/code/phone",
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
export const forgotPasswordAPI = (credentials) => {
    return apiClient.post("/user/forget/password", credentials);
};

// Forgot Password OTP API (post)
export const forgotPasswordOtpAPI = (phone, code) => {
    return apiClient.post("/user/forget/sms/verify/otp", { phone, code });
};

// Resend Forgot Password OTP API (post)
export const resendforgotPasswordOtpAPI = (phone) => {
    return apiClient.post("/user/forget/sms/resend", { phone });
};

// Reset Password API (post)
export const resetPasswordAPI = (
    phone,
    token,
    password,
    passwordConfirmation,
) => {
    return apiClient.post("/user/forget/sms/reset/password", {
        phone,
        token,
        password,
        password_confirmation: passwordConfirmation,
    });
};

// 2fa API (post)
export const twoFactorAPI = (otp) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/google-2fa/otp/verify",
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
export const logoutAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/logout",
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
export const dashboardGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Wallet Get API (get)
export const walletGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/wallets", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Get API (get)
export const profiledGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Update API (post)
export const profileUpdateAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/profile/update", formData, {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/password/update",
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
export const resellerInfoGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/profile/reseller/apply/info", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Reseller Submit Info Get API (get)
export const resellerSubmitInfoGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/profile/reseller/apply/submit/data", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Reseller Submit API (post)
export const resellerSubmitAPI = (idType, idFrontPart, idBackPart) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/profile/reseller/apply/info/submit",
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
export const switchResellerAPI = (status) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/profile/reseller/switch/reseller",
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
export const kycGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/kyc", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// KYC Update API (post)
export const kycUpdateAPI = (frontFile, backFile) => {
    const token = getToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    const formData = new FormData();
    if (frontFile) formData.append("id_front_part", frontFile);
    if (backFile) formData.append("id_back_part", backFile);

    return apiClient.post("/user/kyc/submit", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
};

// Setup Pin API (post)
export const SetupPinAPI = (pinCode) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/setup/pin/store",
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
export const UpdatePinAPI = (oldPin, newPin) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/setup/pin/update",
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
export const VerifyPinAPI = (pin) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/verify/pin",
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
export const ProfileDeleteAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/delete/account",
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
export const receiveMoneyGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/receive-money", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Referral Status Get API (get)
export const referralStatusGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/referral-status/index", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Affiliate Plan Get API (get)
export const affiliatePlanGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/affiliate/plan/subscribe/index", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/affiliate/plan/subscribe/initialize",
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
export const addMoneyGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/add-money/information", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/add-money/submit-data",
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
export const ManualAddMoneyAPI = (data) => {
    const token = getToken();
    if (!token) throw new Error("No token found. Please log in.");

    return apiClient.post("/user/add-money/manual/payment/confirmed", data, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
};

// Tatum Add Money API (post)
export const tatumAddMoneyAPI = (txnHash, trxRef) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            `/user/add-money/payment/crypto/confirm/${trxRef}`,
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
export const withdrawGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/withdraw/info", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Insert Withdraw API (post)
export const InsertWithdrawAPI = (amount, currency, gateway) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/withdraw/insert",
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
export const ManualWithdrawAPI = (formdata) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/withdraw/manual/confirmed", formdata, {
            headers: {
                Authorization: `Bearer ${token}`,
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/withdraw/automatic/confirmed",
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
export const flutterwaveBanksGetAPI = (trxRef) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/withdraw/get/flutterwave/banks?trx=${trxRef}`,
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
export const flutterwaveBankBranchesGetAPI = (trxRef, bankId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/withdraw/get/flutterwave/bank/branches?trx=${trxRef}&bank_id=${bankId}`,
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
export const exchangeGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/money-exchange", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/money-exchange/submit",
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
export const sendMoneyGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/send-money/info", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/send-money/confirmed",
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
export const SendMoneyCheckUserAPI = (credentials) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/send-money/exist",
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
export const SendMoneyScanAPI = (qrCode) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/send-money/qr/scan",
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
export const makePaymentGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/make-payment/info", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/make-payment/confirmed",
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
export const makePaymentCheckMerchantAPI = (credentials) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/make-payment/check/merchant",
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
export const makePaymentScanAPI = (qrCode) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/make-payment/merchants/scan",
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
export const moneyOutGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/money-out/info", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/money-out/confirmed",
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
export const moneyOutCheckAgentAPI = (credentials) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/money-out/check/agent",
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
export const moneyOutScanAPI = (qrCode) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/money-out/qr/scan",
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
export const requestMoneyGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/request-money", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/request-money/submit",
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
export const requestMoneyCheckUserAPI = (credentials) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/request-money/check/user",
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
export const requestMoneyScanAPI = (qrCode) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/request-money/qr/scan",
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
export const paymentLinkListAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/payment-links", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link Store API (post)
export const paymentLinkStoreAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/payment-links/store", formData, {
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
export const paymentLinkUpdateAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/payment-links/update", formData, {
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
export const paymentLinkStatusAPI = (target) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/payment-links/status",
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
export const paymentLinkEditAPI = (target) => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/payment-links/edit?target=${target}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Payment Link Share API (get)
export const paymentLinkShareAPI = (linkToken) => {
    return apiClient.get(`/payment/link/share?token=${linkToken}`, {});
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/payment/link/submit",
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
};

// Bill Pay Get API (get)
export const billPayGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/bill-pay/info", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/bill-pay/confirmed",
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
export const mobileTopupGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/mobile-topup/info", {
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/mobile-topup/confirmed",
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/mobile-topup/automatic/check-operator?mobile_code=${mobileCode}&mobile_number=${mobileNumber}&country_code=${countryCode}`,
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/mobile-topup/automatic/pay",
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
export const localMobileTopupInfoGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/mobile-topup/local/topup-info`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Submit Local Mobile Top Up API (post)
export const submitLocalMobileTopupAPI = (topupData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/mobile-topup/local/pay", topupData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Order Get API (get)
export const productOrderGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/product-orders/index", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Product Order Details Get API (get)
export const productOrderDetailsGetAPI = (orderId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/product-orders/details?order_id=${orderId}`,
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
export const productOrderDownloadInvoiceGetAPI = (orderId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/product-orders/invoice/export?order_id=${orderId}`,
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
export const pointToCashGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/point/convert/index", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Point convert API (post)
export const pointConvertAPI = (pointId, pointAmount) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/point/convert/submit",
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
export const allTransactionsGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/transactions", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Google 2FA Get API (get)
export const google2faGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/security/google-2fa", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Google 2FA Submit API (post)
export const submitGoogle2faAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/security/google-2fa/status/update",
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
export const myGiftCardGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get("/user/gift-card", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// all gift card api (get)
export const allGiftCardGetAPI = (countryIso, currentPage) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/gift-card/all?country=${countryIso}&page=${currentPage}`,
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
export const giftCardDetailsGetAPI = (productId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/gift-card/details?product_id=${productId}`,
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
export const submitGiftOrderAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/gift-card/order", formData, {
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
export const myStroWalletCardGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/strowallet-card`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// strowallet card fee charge
export const stroWalletFeeChargeGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/strowallet-card/charges`, {
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
export const createCustomerAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/strowallet-card/create/customer",
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
export const updateCustomerAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/strowallet-card/update/customer",
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
export const stroWalletCardDetailsGetAPI = (cardId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/strowallet-card/details?card_id=${cardId}`,
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
export const stroWalletCardFreezedAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/strowallet-card/block", formData, {
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
export const stroWalletCardUnfreezeAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/strowallet-card/unblock", formData, {
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
export const stroWalletBuyCardAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/strowallet-card/create", formData, {
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
export const stroWalletCardFundAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/strowallet-card/fund", formData, {
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
export const stroWalletCardMakeDefaultOrRemove = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/strowallet-card/make-remove/default",
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
export const stroWalletCardTransactionGetAPI = (cardId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/strowallet-card/transaction?card_id=${cardId}`,
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
) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/get-remaining?transaction_type=${transactionType}&attribute=${attribute}&sender_amount=${senderAmount}&currency_code=${currencyCode}&charge_id=${chargeId}`,
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
export const stroWalletWebhookTransaction = (cardId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/strowallet-card/webhook?card_id=${cardId}`,
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
export const sudoVirtualCardFeeChargeGetAPI = () => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/my-card/sudo/charges`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card buy api
export const sudoVirtualBuyCardAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/my-card/sudo/create", formData, {
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
export const sudoVirtualCardDetailsGetAPI = (cardId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(`/user/my-card/sudo/details?card_id=${cardId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// sudo virtual card freeze api
export const sudoVirtualCardFreezeAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/my-card/sudo/block", formData, {
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
export const sudoVirtualCardUnfreezeAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/my-card/sudo/unblock", formData, {
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
export const sudoVirtualCardTransactionGetAPI = (cardId) => {
    const token = getToken();
    if (token) {
        return apiClient.get(
            `/user/my-card/sudo/transaction?card_id=${cardId}`,
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
export const sudoVirtualCardMakeDefaultOrRemove = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post(
            "/user/my-card/sudo/make-remove/default",
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

// strowallet virtual card  fund api
export const sudoVirtualCardFundAPI = (formData) => {
    const token = getToken();
    if (token) {
        return apiClient.post("/user/my-card/sudo/fund", formData, {
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
export const registerSellerAPI = (formData) => {
    return apiClientSeller.post("/seller/register", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Login API (post)
export const loginSellerAPI = (formData) => {
    return apiClientSeller.post("/seller/login", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Authorization API (post)
export const authorizationCodeSellerAPI = (code) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/phone-verify",
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
export const resendAuthorizationCodeSellerAPI = async () => {
    const token = getSellerToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    try {
        const response = await apiClientSeller.post(
            "/seller/send/code/phone",
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
export const forgotPasswordSellerAPI = (credentials) => {
    return apiClientSeller.post("/seller/forget/password", credentials);
};

// Forgot Password OTP API (post)
export const forgotPasswordOtpSellerAPI = (phone, code) => {
    return apiClientSeller.post("/seller/forget/sms/verify/otp", {
        phone,
        code,
    });
};

// Resend Forgot Password OTP API (post)
export const resendforgotPasswordOtpSellerAPI = (phone) => {
    return apiClientSeller.post("/seller/forget/sms/resend", { phone });
};

// Reset Password API (post)
export const resetPasswordSellerAPI = (
    phone,
    token,
    password,
    passwordConfirmation,
) => {
    return apiClientSeller.post("/seller/forget/sms/reset/password", {
        phone,
        token,
        password,
        password_confirmation: passwordConfirmation,
    });
};

// 2fa API (post)
export const twoFactorSellerAPI = (otp) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/google-2fa/otp/verify",
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
export const logoutSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/logout",
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
export const dashboardGetSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get("/seller/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Wallet Get API (get)
export const walletGetSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get("/seller/wallets", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Get API (get)
export const profiledGetSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get("/seller/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Profile Update API (post)
export const profileUpdateSellerAPI = (formData) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post("/seller/profile/update", formData, {
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
) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/password/update",
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
export const kycGetSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get("/seller/kyc", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// KYC Update API (post)
export const kycUpdateSellerAPI = (frontFile, backFile) => {
    const token = getSellerToken();
    if (!token) {
        throw new Error("No token found. Please log in.");
    }

    const formData = new FormData();
    if (frontFile) formData.append("id_front_part", frontFile);
    if (backFile) formData.append("id_back_part", backFile);

    return apiClientSeller.post("/seller/kyc/submit", formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
};

// Setup Pin API (post)
export const SetupPinSellerAPI = (pinCode) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/setup/pin/store",
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
export const UpdatePinSellerAPI = (oldPin, newPin) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/setup/pin/update",
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
export const VerifyPinSellerAPI = (pin) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/verify/pin",
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
export const ProfileDeleteSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/delete/account",
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
export const google2faGetSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get("/seller/security/google-2fa", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Google 2FA Submit API (post)
export const submitGoogle2faSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/security/google-2fa/status/update",
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
export const productGetSellerAPI = () => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get("/seller/product", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};

// Store Product API (post)
export const StoreProductSellerAPI = (formData) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post("/seller/product/store", formData, {
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
export const productStatusUpdateSellerAPI = (ids, status) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post(
            "/seller/product/bulk-status-update",
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
export const editProductSellerAPI = (productId) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.get(
            `/seller/product/edit?product_id=${productId}`,
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
export const UpdateProductSellerAPI = (formData) => {
    const token = getSellerToken();
    if (token) {
        return apiClientSeller.post("/seller/product/update", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
    } else {
        throw new Error("No token found. Please log in.");
    }
};
