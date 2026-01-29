'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentLinkListAPI } from "@root/services/apiClient/apiClient";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Link from "next/link";

const ShareLinkSkeleton = () => {
    return (
        <div className="bg-white rounded-[12px] p-7 max-w-2xl mx-auto animate-pulse">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
            <div className="mb-6">
                <div className="h-4 w-1/4 bg-gray-200 rounded mb-3"></div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                </div>
            </div>
            <div className="h-11 w-full bg-gray-200 rounded-md"></div>
        </div>
    );
};

export default function ShareLinkPage() {
    const router = useRouter();
    const [link, setLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [localShareLink, setLocalShareLink] = useState('');

    useEffect(() => {
        const fetchLink = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            try {
                setIsLoading(true);
                const response = await paymentLinkListAPI();
                const foundLink = response.data.data.payment_links.find(
                    l => l.token === token
                );
                
                if (foundLink) {
                    setLink(foundLink);
                    // Create local share link URL
                    const localUrl = `${window.location.origin}/user/payment/link/share/token?token=${token}`;
                    setLocalShareLink(localUrl);
                    localStorage.setItem("intendedUrl", localUrl);
                } else {
                    toast.error("Payment link not found");
                    router.push('/user/payment/link');
                }
            } catch (error) {
                toast.error("Failed to fetch payment link");
                router.push('/user/payment/link');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLink();
    }, [router]);

    const copyToClipboard = () => {
        if (!localShareLink) return;
        
        navigator.clipboard.writeText(localShareLink);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    if (isLoading) {
        return <ShareLinkSkeleton />;
    }

    if (!link) {
        return null; // or a "not found" message
    }

    return (
        <div className="bg-white rounded-[12px] p-7 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold mb-3">Share Payment Link</h4>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Copy Link</label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={localShareLink}
                        readOnly
                        className="flex-1 p-2 border rounded-md bg-gray-50"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="p-2 bg-primary__color text-white rounded-md hover:bg-blue-600 transition"
                    >
                        {copied ? (
                            <CheckIcon className="h-5 w-5" />
                        ) : (
                            <ClipboardIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <Link href="/user/payment/link/create" className="px-4 py-2.5 w-full text-center font-semibold bg-primary__color text-white rounded-md hover:bg-blue-600 transition">
                    Create Another Link
                </Link>
                <Link href={`/user/payment/link/edit/${link.id}`} className="px-4 py-2.5 w-full text-center font-semibold bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition">
                    Edit Link
                </Link>
            </div>
        </div>
    );
}