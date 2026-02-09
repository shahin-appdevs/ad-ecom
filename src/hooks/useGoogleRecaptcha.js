import React, { useEffect, useRef, useState } from "react";

import { basicDataGetAPI } from "@root/services/apiClient/apiClient";
import { handleApiError } from "@/components/utility/handleApiError";

export default function useGoogleRecaptcha() {
    const [recaptcha, setRecaptcha] = useState(null);

    const [loginBasicData, setLoginBasicData] = useState(null);
    const recaptchaRef = useRef();
    const recaptchaChange = (e) => {
        setRecaptcha(e);
    };

    useEffect(() => {
        (async () => {
            try {
                const result = await basicDataGetAPI();
                setLoginBasicData(result?.data?.data);
            } catch (error) {
                handleApiError(error, "Failed to fetch basic data");
            }
        })();
    }, []);

    return {
        recaptcha,
        recaptchaRef,
        recaptchaChange,
        loginBasicData,
    };
}
