import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
    // We MUST await this, but we treat it as a plain string for static paths
    let locale = await requestLocale;

    // Fallback if locale is undefined (common during build/export)
    if (!locale || !routing.locales.includes(locale)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
