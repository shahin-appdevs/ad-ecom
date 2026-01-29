import toast from "react-hot-toast";

export const handleApiError = (
    error,
    fallbackMessage = "Something went wrong. Please try again.",
) => {
    const errors =
        error?.response?.data?.message?.error || error?.response?.data?.message;

    if (Array.isArray(errors)) {
        errors.forEach((err) => toast.error(err));
        return;
    }

    toast.error(errors || error?.message || fallbackMessage);
};
