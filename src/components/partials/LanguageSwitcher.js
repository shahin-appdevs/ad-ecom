"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchString = searchParams.toString();

    const currentLocale = pathname.split("/")[1] || routing.defaultLocale;
    const currentLang =
        languages.find((l) => l.code === currentLocale) || languages[0];

    // Close dropdown on click outside
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLanguageChange = (newLocale) => {
        setIsOpen(false);
        const pathSegments = pathname.split("/");
        pathSegments[1] = newLocale;

        const newPath =
            `${pathSegments.join("/")}${searchString ? `?${searchString}` : ""}` ||
            "/";

        router.push(newPath);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Custom Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95"
            >
                {/* <span className="text-base">{currentLang.flag}</span> */}
                <span className="hidden sm:inline">{currentLang.name}</span>
                <span className="inline sm:hidden uppercase">
                    {currentLang.code}
                </span>
                <ChevronDownIcon
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-40 origin-top-right bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 z-[100] overflow-hidden animate-in fade-in zoom-in duration-150">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors
                                    ${
                                        currentLocale === lang.code
                                            ? "bg-blue-50 text-blue-600 font-semibold"
                                            : "text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {/* <span className="text-lg">{lang.flag}</span> */}
                                <span className="flex-1">{lang.name}</span>
                                {currentLocale === lang.code && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
