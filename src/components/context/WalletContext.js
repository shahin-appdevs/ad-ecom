"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { walletGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [wallet, setWallet] = useState({
        selectedCurrency: null,
        currencies: [],
        balance: 0,
        currencyCode: "",
    });

    const fetchWalletCurrencies = async () => {
        try {
            const response = await walletGetAPI();
            const data = response?.data?.data;
            setDashboardData(data);

            const currencies =
                data?.userWallets?.map((wallet) => wallet.currency) || [];
            const userWallet = data?.userWallets?.find(
                (wallet) => wallet.currency.default,
            );

            // old condition
            // const currencies =
            //     data?.userWallets?.map((wallet) => wallet.currency) || [];
            // const userWallet = data?.userWallets?.find(
            //     (wallet) =>
            //         wallet.currency.default ||
            //         (currencies.length > 0 &&
            //             wallet.currency.code === currencies[0].code),
            // );

            setWallet((prev) => ({
                ...prev,
                currencies,
                selectedCurrency:
                    currencies.find((c) => c.default) || currencies[0] || null,
                balance: userWallet?.balance || 0,
                currencyCode: userWallet?.currency?.code || "",
            }));
        } catch (error) {
            toast.error("Failed to fetch wallet data");
        }
    };

    useEffect(() => {
        fetchWalletCurrencies();
    }, []);

    const updateSelectedCurrency = (currency) => {
        const userWallet = dashboardData?.userWallets?.find(
            (w) => w.currency.id === currency.id,
        );
        setWallet((prev) => ({
            ...prev,
            selectedCurrency: currency,
            balance: userWallet?.balance || 0,
            currencyCode: currency.code,
        }));
    };

    return (
        <WalletContext.Provider
            value={{
                wallet,
                setWallet,
                fetchWalletCurrencies,
                updateSelectedCurrency,
                dashboardData,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);
