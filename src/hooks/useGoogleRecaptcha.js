import { useEffect, useRef, useState } from "react";

import { basicDataGetAPI } from "@root/services/apiClient/apiClient";
import { handleApiError } from "@/components/utility/handleApiError";
import { useTranslations } from "next-intl";

export default function useGoogleRecaptcha() {
    const t = useTranslations("Login");
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
                handleApiError(error, t("failedToLoadBasicData"));
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
