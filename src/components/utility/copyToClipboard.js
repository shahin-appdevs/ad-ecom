import toast from "react-hot-toast";

export async function copyToClipboard(text, message) {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(message || "Copied!");
    } catch (error) {
        toast.error("Copy failed");
    }
}
