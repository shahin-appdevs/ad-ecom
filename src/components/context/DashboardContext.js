"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { dashboardGetAPI } from "@root/services/apiClient/apiClient";

const DashboardContext = createContext();

export const useDashboardData = () => useContext(DashboardContext);

export const DashboardProvider = ({ children, value }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [walletInfo, setWalletInfo] = useState({
        balance: null,
        currencyCode: null,
    });
    const [affiliatePlan, setAffiliatePlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardGetAPI();
                setDashboardData(response?.data?.data);
                
                // Find the wallet with currency.default === 1
                const defaultWallet = response?.data?.data?.userWallets?.find(
                    wallet => wallet.currency?.default === 1
                );
                
                // If no default wallet found, fall back to the first wallet
                const walletToUse = defaultWallet || response?.data?.data?.userWallets?.[0];
                
                if (walletToUse) {
                    setWalletInfo({
                        balance: walletToUse.balance,
                        currencyCode: walletToUse.currency?.code,
                    });
                }
                setAffiliatePlan(response?.data?.data?.user?.affiliate_plan || response?.data?.data?.active_affiliate_plan || null);
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Function to update wallet info
    const updateWalletInfo = (newBalance) => {
        setWalletInfo(prev => ({
            ...prev,
            balance: newBalance
        }));
    };

    // Function to check if a feature is enabled
    const isFeatureEnabled = (featureName) => {
        const planFeatures = affiliatePlan?.plan?.features || dashboardData?.active_affiliate_plan?.features;
    
        if (!planFeatures) return false;
        
        const feature = planFeatures.find(f => f.name === featureName);
        return feature ? feature.value : false;
    };

    return (
        <DashboardContext.Provider value={{
            value, 
            dashboardData, 
            loading, 
            walletInfo,
            affiliatePlan,
            isFeatureEnabled,
            setWalletInfo: updateWalletInfo
        }}>
            {children}
        </DashboardContext.Provider>
    );
};