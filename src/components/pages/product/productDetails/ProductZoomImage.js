import Image from "next/image";
import React, { useEffect } from "react";

export default function ProductZoomImage({ selectedImage, productData }) {
    // image zooming
    useEffect(() => {
        let imageZoom = document.getElementById("imageZoom");
        imageZoom.addEventListener("mousemove", (event) => {
            imageZoom.style.setProperty("--display", "block");
            let pointer = {
                x: (event.offsetX * 100) / imageZoom.offsetWidth,
                y: (event.offsetY * 100) / imageZoom.offsetHeight,
            };
            imageZoom.style.setProperty("--zoomX", `${pointer.x}%`);
            imageZoom.style.setProperty("--zoomY", `${pointer.y}%`);
        });

        imageZoom.addEventListener("mouseleave", (event) => {
            imageZoom.style.setProperty("--display", "none");
        });
    }, []);

    const styles = {
        "--url": `url(${selectedImage ? selectedImage : productData.image})`,
        "--zoomX": "0%",
        "--zoomY": "0%",
        "--display": "none",
    };
    return (
        <div id="imageZoom" style={styles}>
            <Image
                src={selectedImage || productData.image}
                alt={productData.title}
                width={600}
                height={800}
                className="w-full h-full object-contain rounded-md"
            />
        </div>
    );
}
