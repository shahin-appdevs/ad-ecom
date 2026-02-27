// Packages
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";

// Style Sheets
import "@/styles/css/globals.css";
import "@/styles/sass/main.scss";
import "/public/css/fontawesome-all.min.css";
import { routing } from "@/i18n/routing";

// Font init - Heading & Body
const dmSans = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    display: "swap",
});

// Metadata
export const metadata = {
    title: {
        template: "%s | QR E-commerce",
        default: "QR E-commerce",
    },
    description: "Multi vendor e-commerce platform",
    icons: {
        icon: "/images/logo/favicon.jpeg",
    },
};

// This is required for output: "export"
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

// Root Layout
export default async function RootLayout({ children, params }) {
    const { locale } = await params;

    // Ensure that the incoming locale is valid
    if (!routing.locales.includes(locale)) {
        notFound();
    }

    // REQUIRED FOR STATIC EXPORT:
    // This tells next-intl which locale to use for this static branch
    setRequestLocale(locale);

    // Fetch messages for this specific locale
    const messages = await getMessages();

    // Define which languages are Right-to-Left
    const isRTL = locale === "ar";

    return (
        <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
            <head>
                <style>
                    {`
                        h1, h2, h3, h4, h5, h6 {
                            font-family: ${dmSans.style.fontFamily}, sans-serif;
                        }
                    `}
                </style>
            </head>
            <body className={`${dmSans.className} antialiased`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
                <Toaster />
            </body>
        </html>
    );
}
