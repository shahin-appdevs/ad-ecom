// Components
import ProductDetailsSection from "@/components/pages/product/productDetails";
import RelatedProductSection from "@/components/pages/product/relatedProduct";
import { productDetailsGetAPI } from "@root/services/apiClient/apiClient";
import { notFound } from "next/navigation";
import { cache } from "react";

// const getProduct = cache(async (id) => {
//     try {
//         const { data } = await productDetailsGetAPI(id);

//         // // Adjust based on your API response structure
//         // if (!data.product) {
//         //     notFound();
//         // }

//         return data; // { product, recentlyViewed, etc. }
//     } catch (error) {
//         console.error("Product fetch error:", error.message);
//         notFound();
//     }
// });

export default async function ProductDetailsPage() {
    return (
        <>
            <ProductDetailsSection />
            <RelatedProductSection />
        </>
    );
}
