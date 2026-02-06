"use client";
// Packages
import Link from "next/link";
import Image from "next/image";
// Icons
import {
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/outline";
import {
    FacebookIcon,
    InstagramIcon,
    XIcon,
    YoutubeIcon,
    WhatsappIcon,
} from "@/components/icons/CustomIcons";

// Images
import logo from "@public/images/logo/logo.webp";
import googlePlay from "@public/images/footer/googlePlay.webp";
import { useEffect, useState } from "react";
import { handleApiError } from "../utility/handleApiError";

import {
    appSettingGetAPI,
    footerInfoGetAPI,
} from "@root/services/apiClient/apiClient";

export default function Footer() {
    const [appSettings, setAppSettings] = useState({});
    const [footerInfo, setFooterInfo] = useState({});

    const footerContent = footerInfo?.footer_content?.language?.en;
    const contactInfo = footerInfo?.contact_section?.language?.en;
    const socialLinks = footerInfo?.social_icons?.map((item) => item.en);
    const usefulLinks = footerInfo?.useful_links;

    const footerInfoDataFetch = async () => {
        try {
            const result = await footerInfoGetAPI();
            setFooterInfo(result?.data?.data);
        } catch (error) {
            handleApiError(error);
        }
    };
    const appSettingData = async () => {
        try {
            const result = await appSettingGetAPI();
            const settings = result?.data?.data;
            setAppSettings(settings);

            sessionStorage.setItem(
                "appSettings",
                JSON.stringify({
                    ...result?.data?.data?.app_settings?.user?.basic_settings,
                    logo_image_path: settings?.logo_image_path,
                }),
            );
        } catch (error) {
            handleApiError(error);
        }
    };

    useEffect(() => {
        footerInfoDataFetch();
        appSettingData();
    }, []);

    return (
        <section className="bg-white pt-8 sm:pt-16 pb-4 mt-4 sm:mt-16">
            <div className="xl:max-w-[1530px] container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                    <div>
                        <Link href="/" className="mb-2">
                            <Image
                                src={logo}
                                alt="Logo"
                                className="h-6 lg:h-10 w-auto"
                            />
                        </Link>
                        <p className="text-sm md:text-base text-primary__color font-semibold">
                            {footerContent?.app_text}
                        </p>
                        <p className="font-medium">{footerContent?.details}</p>
                        <p className="text-sm md:text-base font-semibold mt-3">
                            Download the app
                        </p>
                        {appSettings?.app_url?.android_url && (
                            <Link
                                href={appSettings?.app_url?.android_url}
                                target="_blank"
                                className="mt-3"
                            >
                                <Image
                                    src={googlePlay}
                                    alt="Footer"
                                    className="h-6 lg:h-10 w-auto"
                                />
                            </Link>
                        )}
                    </div>
                    <div>
                        <h6 className="font-bold mb-4">Popular</h6>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/categories"
                                    className="font-medium hover:text-primary__color"
                                >
                                    Smart Gadget
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="font-medium hover:text-primary__color"
                                >
                                    Electronics Device
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="font-medium hover:text-primary__color"
                                >
                                    Home & Kitchen
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/categories"
                                    className="font-medium hover:text-primary__color"
                                >
                                    Wholesale
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h6 className="font-bold mb-4">Important Link</h6>
                        <ul className="space-y-2">
                            {usefulLinks?.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={`/important-link?link=${link?.slug}`}
                                        className="font-medium hover:text-primary__color"
                                    >
                                        {link?.title?.language?.en?.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div>
                            <h6 className="font-bold mb-4">Address</h6>
                            <ul className="space-y-3">
                                {contactInfo?.location && (
                                    <li className="flex items-center font-medium gap-1">
                                        <MapPinIcon className="w-4 h-4 shrink-0" />{" "}
                                        {contactInfo?.location}
                                    </li>
                                )}
                                {contactInfo?.mobile && (
                                    <li className="flex items-center font-medium gap-1">
                                        <PhoneIcon className="w-4 h-4 shrink-0" />{" "}
                                        {contactInfo?.mobile}
                                    </li>
                                )}

                                {contactInfo?.email && (
                                    <li className="flex items-center font-medium gap-1">
                                        <EnvelopeIcon className="w-4 h-4 shrink-0" />{" "}
                                        {contactInfo?.email}
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div>
                            {/* social links  */}
                            <ul className="flex gap-3 mt-5">
                                {socialLinks?.map((link, idx) => (
                                    <li key={idx}>
                                        <Link
                                            href={link?.link}
                                            className="hover:text-primary__color"
                                            target="_blank"
                                        >
                                            <i
                                                className={`text-xl ${link?.social_icon}`}
                                            ></i>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border-t pt-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        {footerContent?.footer_text && (
                            <p className="mb-2 md:mb-0 font-medium">
                                {footerContent?.footer_text}
                            </p>
                        )}

                        {appSettings && (
                            <p className="font-bold text-primary__color">
                                POWER BY |{" "}
                                {
                                    appSettings?.app_settings?.user
                                        ?.basic_settings?.site_name
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
