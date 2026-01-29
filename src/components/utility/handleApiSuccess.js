import { toast } from "react-hot-toast";

export const handleApiSuccess = (result, fallbackMessage = "Success!") => {
    const successMessage =
        result?.data?.message?.success?.[0] ||
        result?.data?.message ||
        fallbackMessage;

    if (successMessage) {
        toast.success(successMessage);
    }
};
