// Components
import PrivacySection from "@/components/pages/privacy/privacy";
import { footerInfoGetAPI } from "@root/services/apiClient/apiClient";

export default async function PrivacyPage() {
    let privacyPolicy;

    try {
        const result = await footerInfoGetAPI();

        privacyPolicy = result?.data?.data?.useful_links?.find(
            (item) => item?.slug === "privacy-policy",
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
            <PrivacySection privacyPolicy={privacyPolicy} />
        </>
    );
}
