import { useDashboardData } from "@/components/context/DashboardContext";

export const useFeatureAccess = () => {
    const { dashboardData, affiliatePlan, loading } = useDashboardData();
    
    if (loading) {
        return {
            canRefer: false,
            canEarnWallet: false,
            canWithdraw: false,
            canP2PTrade: false,
            canProductRefer: false,
            canReselling: false,
            canStallBooking: false,
            canWholesaleBuy: false,
            isLoading: true
        };
    }
    
    // Get features from either location
    const features = affiliatePlan?.features || dashboardData?.active_affiliate_plan?.features || [];
    
    const findFeature = (name) => {
        const feature = features.find(f => f.name === name);
        return feature ? feature.value : false;
    };

    return {
        canRefer: findFeature("refer_code"),
        canEarnWallet: findFeature("earn_wallet"),
        canWithdraw: findFeature("withdraw"),
        canP2PTrade: findFeature("p2p_trade"),
        canProductRefer: findFeature("product_link_refer"),
        canReselling: findFeature("reselling"),
        canStallBooking: findFeature("stall_booking"),
        canWholesaleBuy: findFeature("wholesale_buy"),
        isLoading: false
    };
};