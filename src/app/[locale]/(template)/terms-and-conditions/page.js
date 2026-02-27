// Components
import TermsSection from "@/components/pages/terms/terms";
import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";

export default async function TermsPage() {
    let termsConditions;

    try {
        const result = await footerInfoGetAPI();

        termsConditions = result?.data?.data?.useful_links?.find(
            (item) => item?.slug === "terms-and-conditions",
        );
    } catch (error) {
        return (
            <div className="p-6 text-red-600 text-center">
                Failed to load privacy policy.
            </div>
        );
    }

    return (
        <>
            <TermsSection termsConditions={termsConditions} />
        </>
    );
}
