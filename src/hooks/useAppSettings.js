import { useEffect, useState } from "react";

export function useAppSettings() {
    const [appSettingsData, setAppSettingsData] = useState(null);

    useEffect(() => {
        try {
            const appSettings = sessionStorage.getItem("appSettings");
            setAppSettingsData(appSettings ? JSON.parse(appSettings) : null);
        } catch {
            setAppSettingsData(null);
        }
    }, []);

    const updateAppSettings = (data) => {
        sessionStorage.setItem("appSettings", JSON.stringify(data));
        setAppSettingsData(data);
    };

    return { appSettingsData, setAppSettingsData: updateAppSettings };
}
