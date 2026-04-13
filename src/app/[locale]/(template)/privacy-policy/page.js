// Components
import PrivacySection from "@/components/pages/privacy/privacy";
import { handleApiError } from "@/components/utility/handleApiError";
import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
    const t = await getTranslations("Privacy"); // Namespace: Privacy

    let privacyPolicy;

    try {
        const result = await footerInfoGetAPI();

        privacyPolicy = result?.data?.data?.useful_links?.find(
            (item) => item?.slug === "privacy-policy",
        );
    } catch (error) {
        handleApiError(error, t("failedToLoad"));
        return (
            <div className="p-6 text-red-600 text-center">
                {t("failedToLoad")}
            </div>
        );
    }

    return (
        <>
            <PrivacySection privacyPolicy={privacyPolicy} />
        </>
    );
}
