import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["en", "ar", "bn", "es", "hi", "fr"],
    defaultLocale: "en",
    // localePrefix: "as-needed",
    localePrefix: "always",
});
