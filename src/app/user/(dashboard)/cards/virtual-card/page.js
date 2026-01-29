import VirtualCardPage from "@/components/dashboard/pages/virtualCard/VirtualCardPage";
import React from "react";

const VirtualCard = () => {
    // const [activeVirtualCard, setActiveVirtualCard] = useState(() => {
    //     return sessionStorage.getItem("active_virtual_system");
    // });

    return (
        <>
            <VirtualCardPage />
            {/* {activeVirtualCard === "strowallet" && <VirtualCardPage />}
            {activeVirtualCard === "sudo" && <SudoVirtualCardPage />} */}
        </>
    );
};

export default VirtualCard;
