export const dynamic = "force-dynamic";
// Components
import RefundSection from "@/components/pages/refund/refund";
import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";
import { handleApiError } from "@/components/utility/handleApiError";
import { getTranslations } from "next-intl/server";

export default async function RefundPage() {
    const t = await getTranslations("Refund"); // Namespace: Refund

    let refundPolicy;

    try {
        const result = await footerInfoGetAPI();

        refundPolicy = result?.data?.data?.useful_links?.find(
            (item) => item?.slug === "refund-policy",
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
            <RefundSection refundPolicy={refundPolicy} />
        </>
    );
}
