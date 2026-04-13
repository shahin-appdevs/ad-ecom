import VirtualCardPage from "@/components/dashboard/pages/virtualCard/VirtualCardPage";
import React from "react";

const VirtualCard = () => {
    return (
        <>
            <VirtualCardPage />
            {/* {activeVirtualCard === "strowallet" && <VirtualCardPage />}
            {activeVirtualCard === "sudo" && <SudoVirtualCardPage />} */}
        </>
    );
};

export default VirtualCard;
