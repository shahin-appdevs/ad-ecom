// Components
import RefundSection from "@/components/pages/refund/refund";
import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";

export default async function RefundPage() {
    let refundPolicy;

    try {
        const result = await footerInfoGetAPI();

        refundPolicy = result?.data?.data?.useful_links?.find(
            (item) => item?.slug === "refund-policy",
        );
    } catch (error) {
        return (
            <div className="p-6 text-red-600 text-center">
                Failed to load refund policy.
            </div>
        );
    }

    return (
        <>
            <RefundSection refundPolicy={refundPolicy} />
        </>
    );
}
