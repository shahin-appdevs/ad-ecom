export const dynamic = "force-dynamic";

// Components
import TermsSection from "@/components/pages/terms/terms";
import { handleApiError } from "@/components/utility/handleApiError";
import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";
import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
    const t = await getTranslations("Terms"); // Namespace: Terms

    let termsConditions;

    try {
        const result = await footerInfoGetAPI();

        termsConditions = result?.data?.data?.useful_links?.find(
            (item) => item?.slug === "terms-and-conditions",
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
            <TermsSection termsConditions={termsConditions} />
        </>
    );
}
