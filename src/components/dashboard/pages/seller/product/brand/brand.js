"use client"
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    PlusIcon,
    ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { Menu, Listbox } from '@headlessui/react';
import { toast } from 'react-hot-toast';

import brand17 from "@public/images/brand/brand17.jpg";
import brand1 from "@public/images/brand/brand1.png";
import brand2 from "@public/images/brand/brand2.jpg";

const actionOptions = ['Active', 'Inactive', 'Delete'];

export default function BrandSection() {
    const [activeTab, setActiveTab] = useState("All");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedAction, setSelectedAction] = useState('Action');
    const [products, setProducts] = useState([
        {
            sl: "1",
            title: "Walton",
            image: brand17,
            status: "Active",
            updateDay: "a year ago",
            updateTime: "8:52 PM Jan 10",
            action: ComputerDesktopIcon,
        },
        {
            sl: "2",
            title: "Haier",
            image: brand1,
            status: "Active",
            updateDay: "a year ago",
            updateTime: "8:52 PM Jan 10",
            action: ComputerDesktopIcon,
        },
        {
            sl: "3",
            title: "Realme",
            image: brand2,
            status: "Inactive",
            updateDay: "a year ago",
            updateTime: "8:52 PM Jan 10",
            action: ComputerDesktopIcon,
        },
    ]);

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

    const handleStatusUpdate = (newStatus) => {
        setSelectedAction(newStatus);
        
        if (selectedProducts.length > 0) {
            setProducts(prevProducts => 
                prevProducts.map(product => 
                    selectedProducts.includes(product.id) 
                        ? { ...product, status: newStatus } 
                        : product
                )
            );
            
            toast.success(`${selectedProducts.length} product(s) marked as ${newStatus}`);
            setSelectedProducts([]);
        }
    };

    const filteredProducts = activeTab === "All" 
        ? products 
        : products.filter(product => product.status === activeTab);

    const getStatusColor = (status) => {
        switch (status) {
            case "Delete":
                return "bg-red-100 text-red-800";
            case "Inactive":
                return "bg-yellow-100 text-yellow-800";
            case "Active":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getProductImage = (image) => {
        return (
            <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-full">
                    <Image
                        src={image}
                        width={50}
                        height={50}
                        alt="Product"
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">Brand</h2>
                <div className="flex items-center gap-3">
                    <Link href="/seller/product/brand/create" className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition">
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
                            <th className="py-4 px-5 font-semibold">Status</th>
                            <th className="py-4 px-5 font-semibold">Update</th>
                            <th className="py-4 px-5 font-semibold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                        {filteredProducts.map((product, index) => (
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
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center">
                                            {getProductImage(product.image)}
                                        </div>
                                        <span className="block mb-1">{product.title}</span>
                                    </div>
                                </td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm">
                                    <span className="block">{product.updateDay}</span>
                                    <span className="block text-[12px] font-bold">{product.updateTime}</span>
                                </td>
                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-center gap-4">
                                    <Link href="/seller/product/brand/details"><product.action className="h-5 w-5 text-gray-600 cursor-pointer" /></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}