"use client";
import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import ProductSidebar from '@/components/partials/ProductSidebar';
import { brandGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const BrandSkeleton = () => {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
			{[...Array(10)].map((_, index) => (
				<div key={index} className="bg-[#f1f5f9] rounded-md">
					<div className="relative p-[10px] text-center">
						<div className="w-full h-[80px] bg-gray-200 rounded-md animate-pulse"></div>
						<div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
					</div>
				</div>
			))}
		</div>
	);
};

export default function Brand() {
	const [brandData, setBrandData] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchBrandData = async () => {
			setLoading(true);
			try {
				const response = await brandGetAPI();   
				setBrandData(response.data.data);                                                        
			} catch (error) {
				toast.error(error.response?.data?.message?.error?.[0] || "Failed to fetch brands");
			} finally {
				setLoading(false);
			}
		};
		fetchBrandData();
	}, []);

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 sm:gap-4">
                    <div className="hidden sm:block col-span-1 xl:col-span-2 bg-white rounded-md p-2.5 relative w-full h-full">
                        <ProductSidebar />
                    </div>
                    <div className="col-span-1 xl:col-span-10">
                        <div className="bg-white p-4 rounded-md">
                            <div className="flex items-center justify-between mb-4">
                                <h5>Brand</h5>
                            </div>
							{loading ? (
								<BrandSkeleton />
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
									{brandData?.brands?.data?.map((brand, index) => (
										<Link href={`/brands/products?id=${brand.id}`} key={index} className="bg-[#f1f5f9] rounded-md hover:shadow-md transition-shadow">
											<div className="relative p-[10px] text-center">
												<div className="w-full h-[80px]">
													<Image 
														src={brand.image 
															? `${backendBaseURL}/${brandData.brand_image_path}/${brand.image}`
															: `${backendBaseURL}/${brandData.default_image_path}`}
														width={100}
														height={100}
														alt={brand.title} 
														className="w-full h-full object-cover rounded-md"
													/>
												</div>
												<span className="mt-2 font-medium">{brand.title}</span>
											</div>
										</Link>
									))}
								</div>
							)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}