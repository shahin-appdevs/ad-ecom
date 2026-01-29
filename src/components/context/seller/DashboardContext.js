"use client";
import { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children, value }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    return (
        <DashboardContext.Provider value={{value, isSidebarOpen, setIsSidebarOpen}}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboardData = () => useContext(DashboardContext);