"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { homeGetAPI } from "@root/services/apiClient/apiClient";

const HomeContext = createContext();

export const useHomeData = () => useContext(HomeContext);

export const HomeProvider = ({ children, value }) => {
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const response = await homeGetAPI();   
                setHomeData(response.data.data);                                                        
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    return (
        <HomeContext.Provider value={{
            value,
            loading,
            homeData
        }}>
            {children}
        </HomeContext.Provider>
    );
};