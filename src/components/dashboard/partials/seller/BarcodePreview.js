import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const BarcodePreview = ({ value = "1372745" }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (svgRef.current) {
            JsBarcode(svgRef.current, value.toString(), {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 60,
                displayValue: true,
            });
        }
    }, [value]);

    return (
        <div className="">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default BarcodePreview;