export const getBaseCurrency = (data) => {
    if (!data) {
        return { baseCurrencyCode: "", baseCurrencySymbol: "" }; // fallback defaults
    }

    return {
        baseCurrencyCode: data?.base_currency || "",
        baseCurrencySymbol: data?.base_curr_symbol || "",
    };
};
