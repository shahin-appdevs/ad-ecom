"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { routing } from "@/i18n/routing";

// Language names in their native script
const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchString = searchParams.toString();

    // Get current locale from the pathname (e.g., "en" from "/en/about")
    const currentLocale = pathname.split("/")[1] || routing.defaultLocale;

    const handleLanguageChange = (e) => {
        const newLocale = e.target.value;

        // Split the path into segments
        const pathSegments = pathname.split("/");

        // Replace the first segment (the locale) with the new one
        // pathSegments[0] is empty string because path starts with /
        // pathSegments[1] is the locale
        pathSegments[1] = newLocale;

        const newPath =
            `${pathSegments.join("/")}${searchString ? `?${searchString}` : ""}` ||
            "/";

        // Push to the new static route
        router.push(newPath);
    };

    return (
        <div className="language-select-wrapper">
            <select
                onChange={handleLanguageChange}
                value={currentLocale} // Use value instead of defaultValue for controlled sync
                className="py-2 px-1 border rounded bg-white text-gray-700 cursor-pointer !text-xs md:!text-sm"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {/* <span> {lang.flag}</span>{" "} */}
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
