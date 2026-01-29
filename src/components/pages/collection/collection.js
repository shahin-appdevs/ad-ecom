"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collectionsGetAPI } from "@root/services/apiClient/apiClient";
import { toast } from "react-hot-toast";

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

const CollectionSkeleton = () => (
    <div className="w-full sm:h-[175px] relative overflow-hidden rounded-md">
        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
        </div>
    </div>
);

export default function Collection() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagePaths, setImagePaths] = useState({
        main_image_path: '',
        default_image_path: ''
    });

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const response = await collectionsGetAPI();
                
                if (response?.data?.data?.all_collections?.data) {
                    const publicCollections = response.data.data.all_collections.data.filter(
                        collection => !collection.private
                    );
                    setCollections(publicCollections);
                    
                    setImagePaths({
                        main_image_path: response.data.data.campaign_image_path || '',
                        default_image_path: response.data.data.default_image_path || ''
                    });
                }
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    return (
        <section className="sm:pt-4">
            <div className="xl:max-w-[1530px] container mx-auto sm:px-4">
                <div className="bg-white p-4 sm:p-6 md:p-10 rounded-md">
                    <div className="flex items-center justify-center mb-4">
                        <h4>All Offers</h4>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...Array(6)].map((_, index) => (
                                <CollectionSkeleton key={index} />
                            ))}
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="text-center py-10">
                            <p>No collections available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {collections.map((collection, index) => (
                                <Link href={`/collections/products?id=${collection.id}`} key={collection.id}>
                                    <div className="w-full sm:h-[175px] relative group">
                                        <div className="w-full h-full bg-gray-100 rounded-md overflow-hidden">
                                            <Image 
                                                src={collection.image 
                                                    ? `${backendBaseURL}/${imagePaths.main_image_path}/${collection.image}`
                                                    : `${backendBaseURL}/${imagePaths.default_image_path}`}
                                                alt={collection.title}
                                                className="w-full h-full object-cover"
                                                width={500}
                                                height={300}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <h3 className="text-white text-lg font-medium text-center px-2">
                                                {collection.title}
                                            </h3>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                                            <h3 className="text-white text-sm font-medium truncate">
                                                {collection.title}
                                            </h3>
                                            <p className="text-white text-xs truncate" dangerouslySetInnerHTML={{ __html: collection.description}} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}