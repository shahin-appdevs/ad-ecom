// Packages
import { Inter, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
// Style Sheets
import "@/styles/css/globals.css";
import "@/styles/sass/main.scss";
import "/public/css/fontawesome-all.min.css";

// Font init - Heading
const headingFont = DM_Sans({
    subsets: ["latin"],
    display: "swap",
});
// Font init - Body
const bodyFont = DM_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
    display: "swap",
});

// Metadata
export const metadata = {
    title: {
        template: "%s | JARA B2B",
        default: "JARA B2B",
    },
    description: "Multi ventor e-commerce platform",
    icons: {
        icon: "/images/logo/favicon.jpeg",
    },
};

// Root Layout
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <style>
                    {`
                        h1, h2, h3, h4, h5, h6 {
                            font-family: ${headingFont.style.fontFamily}, sans-serif;
                        }
                    `}
                </style>
            </head>
            <body className={`${bodyFont.className} antialiased`}>
                {children}
                <Toaster />
            </body>
        </html>
    );
}
