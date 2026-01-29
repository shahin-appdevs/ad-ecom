"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    PlusIcon,
    ComputerDesktopIcon,
    FunnelIcon,
    ChevronUpDownIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import { Menu, Listbox } from '@headlessui/react';
import { productGetSellerAPI, productStatusUpdateSellerAPI, editProductSellerAPI } from "@root/services/apiClient/apiClient";
import { toast } from 'react-hot-toast';

import product20 from "@public/images/product/product20.jpg";

function SkeletonRow() {
    return (
        <tr>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
            <td className="py-3.5 px-5 whitespace-nowrap">
                <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
            </td>
        </tr>
    );
}

const actionOptions = ['Active', 'Inactive'];
const sortOptions = ['Latest', 'Oldest', 'Name (A-Z)', 'Name (Z-A)', 'Price (Low-High)', 'Price (High-Low)'];

const backendBaseURL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export default function ProductSection() {
    const [activeTab, setActiveTab] = useState("All");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedAction, setSelectedAction] = useState('Action');
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statusloading, setStatusLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const router = useRouter();
    const [filterOptions, setFilterOptions] = useState({
        category: [{ id: 1, name: 'Select category', value: '' }],
        childCategory: [{ id: 2, name: 'Select child category', value: '' }],
        subChildCategory: [{ id: 3, name: 'Select sub child category', value: '' }],
        brand: [{ id: 4, name: 'Select brand', value: '' }],
        supplier: [{ id: 5, name: 'Select supplier', value: '' }],
        shop: [{ id: 6, name: 'Select merchant', value: '' }],
        sort: sortOptions.map((option, index) => ({ id: index + 1, name: option, value: option }))
    });
    const [filters, setFilters] = useState({
        category: filterOptions.category[0],
        childCategory: filterOptions.childCategory[0],
        subChildCategory: filterOptions.subChildCategory[0],
        brand: filterOptions.brand[0],
        supplier: filterOptions.supplier[0],
        shop: filterOptions.shop[0],
        sort: filterOptions.sort[0]
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await productGetSellerAPI();
                
                const transformedProducts = response.data.data.my_products.data.map(product => ({
                    sl: product.id,
                    title: product.name,
                    id: product.id,
                    image: product.main_image,
                    imagePath: response.data.data.main_image_path,
                    stock: product.product_quantity || "0",
                    cost: product.cost_price || "0",
                    price: product.cashback_price || "0",
                    profit: (product.sale_price - product.cost_price) || "0",
                    status: product.status ? "Active" : "Inactive",
                    updateDay: formatUpdateTime(product.updated_at).day,
                    updateTime: formatUpdateTime(product.updated_at).time,
                    action: ComputerDesktopIcon,
                }));
                
                setProducts(transformedProducts);
                
                setFilterOptions(prev => ({
                    ...prev,
                    category: [
                        { id: 1, name: 'Select category', value: '' },
                        ...response.data.data.categories.map(cat => ({
                            id: cat.id,
                            name: cat.title,
                            value: cat.slug
                        }))
                    ],
                    childCategory: [
                        { id: 1, name: 'Select child category', value: '' },
                        ...response.data.data.child_categories.map(child => ({
                            id: child.id,
                            name: child.title,
                            value: child.slug,
                            categoryId: child.category_id
                        }))
                    ],
                    subChildCategory: [
                        { id: 1, name: 'Select sub child category', value: '' },
                        ...response.data.data.child_sub_categories.map(sub => ({
                            id: sub.id,
                            name: sub.title,
                            value: sub.slug,
                            childCategoryId: sub.child_category_id
                        }))
                    ],
                    brand: [
                        { id: 1, name: 'Select brand', value: '' },
                        ...response.data.data.brands.map(brand => ({
                            id: brand.id,
                            name: brand.title,
                            value: brand.slug
                        }))
                    ],
                    supplier: [
                        { id: 1, name: 'Select supplier', value: '' },
                        ...response.data.data.suppliers.map(supplier => ({
                            id: supplier.id,
                            name: supplier.fullname,
                            value: supplier.username
                        }))
                    ]
                }));
                
                setLoading(false);
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0]);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleStatusUpdate = async (newStatus) => {
        try {
            setStatusLoading(true);
            setSelectedAction(newStatus);
            
            const statusValue = newStatus === "Active" ? 1 : 0;

            const response = await productStatusUpdateSellerAPI(selectedProducts, statusValue);
            
            setProducts(prevProducts => 
                prevProducts.map(product => 
                    selectedProducts.includes(product.id) 
                        ? { ...product, status: newStatus } 
                        : product
                )
            );
            
            toast.success(response.data.message.success[0]);
            setSelectedProducts([]);
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleEditProduct = async (productId) => {
        try {
            const response = await editProductSellerAPI(productId);
            localStorage.setItem('editProductData', JSON.stringify(response.data.data));
            router.push(`/seller/product/edit?product_id=${productId}`);
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        }
    };

    const formatUpdateTime = (dateString) => {
        if (!dateString) return { day: "N/A", time: "N/A" };
        
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        let dayText;
        if (diffInDays === 0) dayText = "today";
        else if (diffInDays === 1) dayText = "yesterday";
        else if (diffInDays < 7) dayText = `${diffInDays} days ago`;
        else if (diffInDays < 30) dayText = `${Math.floor(diffInDays / 7)} weeks ago`;
        else if (diffInDays < 365) dayText = `${Math.floor(diffInDays / 30)} months ago`;
        else dayText = `${Math.floor(diffInDays / 365)} years ago`;
        
        const timeText = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        
        return {
            day: dayText,
            time: `${timeText} ${formattedDate}`
        };
    };

    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(product => product.id));
        }
    };

    const filteredProducts = activeTab === "All" 
        ? products 
        : products.filter(product => product.status === activeTab);

    const getStatusColor = (status) => {
        switch (status) {
            case "Inactive":
                return "bg-yellow-100 text-yellow-800";
            case "Active":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (name === 'category') {
            setFilters(prev => ({
                ...prev,
                childCategory: filterOptions.childCategory[0],
                subChildCategory: filterOptions.subChildCategory[0]
            }));
        }
        
        if (name === 'childCategory') {
            setFilters(prev => ({
                ...prev,
                subChildCategory: filterOptions.subChildCategory[0]
            }));
        }
    };

    const getProductImage = (image, imagePath) => {
        if (!image) {
            return (
                <div className="w-12 h-12 flex items-center justify-center">
                    <Image
                        src={product20}
                        width={50}
                        height={50}
                        alt="Default product"
                        className="w-full h-full rounded-md object-cover"
                    />
                </div>
            );
        }

        const imageUrl = `${backendBaseURL}/${imagePath}/${image}`;

        return (
            <div className="w-12 h-12 flex items-center justify-center">
                <img
                    src={imageUrl}
                    width={50}
                    height={50}
                    alt="Product"
                    className="w-full h-full rounded-md object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = product20.src;
                    }}
                />
            </div>
        );
    };

    const FilterListbox = ({ name, options }) => (
        <Listbox value={filters[name]} onChange={(value) => handleFilterChange(name, value)}>
            <div className="relative">
                <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-1 focus:ring-primary__color sm:text-sm sm:leading-6">
                    <span className="block truncate">{filters[name].name}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {options.map((option) => (
                        <Listbox.Option
                            key={option.name}
                            className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-primary__color text-white' : 'text-gray-900'
                                }`
                            }
                            value={option}
                        >
                            {({ selected }) => (
                                <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {option.name}
                                    </span>
                                    {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    ) : null}
                                </>
                            )}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </div>
        </Listbox>
    );

    const applyFilters = () => {
        let filtered = [...products];
        
        if (filters.category.value) {
        }
        
        if (filters.childCategory.value) {
        }
        
        if (filters.subChildCategory.value) {
        }
        
        if (filters.brand.value) {
        }
        
        if (filters.sort.value) {
            switch (filters.sort.value) {
                case 'Latest':
                    filtered.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime));
                    break;
                case 'Oldest':
                    filtered.sort((a, b) => new Date(a.updateTime) - new Date(b.updateTime));
                    break;
                case 'Name (A-Z)':
                    filtered.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'Name (Z-A)':
                    filtered.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                case 'Price (Low-High)':
                    filtered.sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
                    break;
                case 'Price (High-Low)':
                    filtered.sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
                    break;
                default:
                    break;
            }
        }
        
        return filtered;
    };

    const displayedProducts = showFilters ? applyFilters() : filteredProducts;

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">Products</h2>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded-[8px] hover:bg-gray-200 transition"
                    >
                        <FunnelIcon className="h-4 w-4" />
                        Filters
                    </button>
                    <Link href="/seller/product/create" className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition">
                        <PlusIcon className="h-5 w-5" />
                        Add New
                    </Link>
                </div>
            </div>
            <div className="flex border-b-[1.5px] border-[#F5F7FF]-200 mb-4">
                {["All", "Active", "Inactive"].map((tab) => (
                    <button
                        key={tab}
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                            activeTab === tab
                                ? "border-b-2 border-primary__color text-primary__color"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                        <FilterListbox name="category" options={filterOptions.category} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Child Category</label>
                        <FilterListbox 
                            name="childCategory" 
                            options={[
                                filterOptions.childCategory[0],
                                ...filterOptions.childCategory.filter(
                                    child => child.categoryId === filters.category.id
                                )
                            ]} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Sub Child Category</label>
                        <FilterListbox 
                            name="subChildCategory" 
                            options={[
                                filterOptions.subChildCategory[0],
                                ...filterOptions.subChildCategory.filter(
                                    sub => sub.childCategoryId === filters.childCategory.id
                                )
                            ]} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Brand</label>
                        <FilterListbox name="brand" options={filterOptions.brand} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Supplier</label>
                        <FilterListbox name="supplier" options={filterOptions.supplier} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Shop</label>
                        <FilterListbox name="shop" options={filterOptions.shop} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Sort</label>
                        <FilterListbox name="sort" options={filterOptions.sort} />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                toast.success('Filters applied');
                            }}
                            className="px-4 py-2 bg-primary__color text-white text-sm rounded-md hover:bg-[#5851e3] transition"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
            {loading ? (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">SL</th>
                                <th className="py-4 px-5 font-semibold">Title</th>
                                <th className="py-4 px-5 font-semibold">Image</th>
                                <th className="py-4 px-5 font-semibold">Stock</th>
                                <th className="py-4 px-5 font-semibold">Cost</th>
                                <th className="py-4 px-5 font-semibold">Price</th>
                                <th className="py-4 px-5 font-semibold">Profit</th>
                                <th className="py-4 px-5 font-semibold">Update</th>
                                <th className="py-4 px-5 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {[...Array(2)].map((_, index) => (
                                <SkeletonRow key={index} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : displayedProducts.length === 0 ? (
                <div className="text-center py-5">No products found. {products.length === 0 && (
                    <Link href="/seller/product/create" className="text-primary__color hover:underline">
                        Add your first product
                    </Link>
                )}</div>
            ) : (
                <div className="table-wrapper overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                <th className="py-4 px-5 font-semibold">SL</th>
                                <th className="py-4 font-semibold">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-primary__color focus:ring-primary__color relative top-[3px]"
                                    />
                                </th>
                                <th className="py-4 px-5 font-semibold whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {selectedProducts.length === 0 ? (
                                            "Title"
                                        ) : (
                                            <Menu as="div" className="relative inline-block text-left">
                                                <Menu.Button className="bg-[#F5F7FF] text-sm rounded-[8px] flex items-center gap-1">
                                                    {selectedAction}
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </Menu.Button>
                                                <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="py-1">
                                                        {actionOptions.map((item) => (
                                                            <Menu.Item key={item}>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(item)}
                                                                        className={`${
                                                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                                        } block w-full px-4 py-2 text-left text-sm`}
                                                                    >
                                                                        {item}
                                                                        {statusloading && selectedAction === item && (
                                                                            <span className="ml-2">...</span>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                        ))}
                                                    </div>
                                                </Menu.Items>
                                            </Menu>
                                        )}
                                    </div>
                                </th>
                                <th className="py-4 px-5 font-semibold">Image</th>
                                <th className="py-4 px-5 font-semibold">Stock</th>
                                <th className="py-4 px-5 font-semibold">Cost</th>
                                <th className="py-4 px-5 font-semibold">Price</th>
                                <th className="py-4 px-5 font-semibold">Profit</th>
                                <th className="py-4 px-5 font-semibold">Update</th>
                                <th className="py-4 px-5 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F5F7FF]">
                            {displayedProducts.map((product, index) => (
                                <tr key={index}>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{index + 1}</td>
                                    <td className="py-3.5 font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => toggleProductSelection(product.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary__color focus:ring-primary__color relative top-[3px]"
                                        />
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                        <span className="block mb-1">{product.title}</span>
                                        <span className="font-bold text-primary__color mr-2">{product.id}</span>
                                        <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getProductImage(product.image, product.imagePath)}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{product.stock}</td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.cost}</td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.price}</td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.profit}</td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm">
                                        <span className="block">{product.updateDay}</span>
                                        <span className="block text-[12px] font-bold">{product.updateTime}</span>
                                    </td>
                                    <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium gap-4">
                                        <button 
                                            onClick={() => handleEditProduct(product.id)}
                                        >
                                            <ComputerDesktopIcon className="h-5 w-5 text-gray-600 cursor-pointer" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}