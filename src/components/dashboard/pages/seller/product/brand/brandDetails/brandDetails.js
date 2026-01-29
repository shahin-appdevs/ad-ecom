"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Menu, Listbox } from '@headlessui/react';
import {
    ComputerDesktopIcon,
    ChevronUpDownIcon,
    CheckIcon
} from "@heroicons/react/24/outline";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";

import product20 from "@public/images/product/product20.jpg";
import product3 from "@public/images/product/product3.jpg";
import product15 from "@public/images/product/product15.jpg";

const sortOptions = ['Latest', 'Oldest', 'Name (A-Z)', 'Name (Z-A)', 'Price (Low-High)', 'Price (High-Low)'];

const filterOptions = {
    category: [
        { id: 1, name: 'Select category', value: '' },
        { id: 2, name: 'Electronics', value: 'electronics' },
        { id: 3, name: 'Clothing', value: 'clothing' }
    ],
    childCategory: [
        { id: 1, name: 'Select child category', value: '' },
        { id: 2, name: 'Laptops', value: 'laptops' },
        { id: 3, name: 'Phones', value: 'phones' }
    ],
    subChildCategory: [
        { id: 1, name: 'Select sub child category', value: '' },
        { id: 2, name: 'Gaming Laptops', value: 'gaming' },
        { id: 3, name: 'Ultrabooks', value: 'ultrabooks' }
    ],
    collection: [
        { id: 1, name: 'Select collection', value: '' },
        { id: 2, name: 'Offer 50%', value: 'offer50' },
        { id: 3, name: 'Offer 70%', value: 'offer70' }
    ],
    brand: [
        { id: 1, name: 'Select brand', value: '' },
        { id: 2, name: 'ASUS', value: 'asus' },
        { id: 3, name: 'Apple', value: 'apple' }
    ],
    supplier: [
        { id: 1, name: 'Select supplier', value: '' },
        { id: 2, name: 'Supplier 1', value: 'supplier1' },
        { id: 3, name: 'Supplier 2', value: 'supplier2' }
    ],
    shop: [
        { id: 1, name: 'Select merchant', value: '' },
        { id: 2, name: 'Shop 1', value: 'shop1' },
        { id: 3, name: 'Shop 2', value: 'shop2' }
    ],
    sort: sortOptions.map((option, index) => ({ id: index + 1, name: option, value: option }))
};

export default function BrandDetailsSection() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [productActiveTab, setProductActiveTab] = useState("All");
    const [imageFile, setImageFile] = useState(null);
    const [filters, setFilters] = useState({
        category: filterOptions.category[0],
        childCategory: filterOptions.childCategory[0],
        subChildCategory: filterOptions.subChildCategory[0],
        collection: filterOptions.collection[0],
        brand: filterOptions.brand[0],
        supplier: filterOptions.supplier[0],
        shop: filterOptions.shop[0],
        sort: filterOptions.sort[0]
    });

    const [products, setProducts] = useState([
        {
            sl: "1",
            title: "ASUS VivoBook 15 X515EA Core-i3 11th Gen Laptop - 4GB RAM - 1TB HDD - Intel UHD Graphics - Peacock Blue",
            id: "i7azq",
            image: product20,
            stock: "2000",
            cost: "52,500",
            price: "53,500",
            profit: "1,000",
            status: "Active",
            active: true,
        },
        {
            sl: "2",
            title: "New Arrival luxury Party Panjabi Misty Color",
            id: "nfvoa",
            image: product3,
            stock: "2000",
            cost: "52,500",
            price: "53,500",
            profit: "1,000",
            status: "Active",
            active: true,
        },
        {
            sl: "3",
            title: "Mini Usb Portable Electric Hair Razer",
            id: "w50ye",
            image: product15,
            stock: "2000",
            cost: "52,500",
            price: "53,500",
            profit: "1,000",
            status: "Inactive",
            active: false,
        },
    ]);

    const handleImageDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
        }
    }, []);

    const handleImageInputChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            LinkExtension.configure({
                openOnClick: false,
            }),
            ImageExtension,
        ],
        content: "<p>Start writing your product description here...</p>",
    });

    const [statusOptions, setStatusOptions] = useState([
        {
            id: 1,
            name: "Active",
            description: "User can switch between active/inactive.",
            checked: true,
        },
        {
            id: 2,
            name: "Private",
            description:
                "If private, third party can not list this to their site",
            checked: false,
        },
    ]);

    const toggleStatusOption = (id) => {
        setStatusOptions(
            statusOptions.map((option) =>
                option.id === id
                    ? { ...option, checked: !option.checked }
                    : option,
            ),
        );
    };

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
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
                    <Image
                        src={image}
                        width={50}
                        height={50}
                        alt="Product"
                        className="w-full h-full rounded-md object-cover"
                    />
                </div>
            </div>
        );
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const ToggleButton = ({ active, onChange }) => {
        return (
            <button
            type="button"
            onClick={() => onChange(!active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary__color focus:ring-offset-2 ${
                active ? 'bg-primary__color' : 'bg-gray-200'
            }`}
            >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                active ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
            </button>
        );
    };

    const toggleProductActive = (index) => {
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newProducts[index].active = !newProducts[index].active;
            newProducts[index].status = newProducts[index].active ? "Active" : "Inactive";
            return newProducts;
        });
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
                            key={option.id}
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

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">Brand</h2>
            </div>
            <div className="tab-wrapper overflow-x-auto">
                <div className="flex border-b-[1.5px] border-[#F5F7FF]-200 mb-4 min-w-max sm:min-w-full">
                    {[
                        "Overview",
                        "Products",
                        "All Products",
                    ].map((tab) => (
                        <button
                            key={tab}
                            className={`py-2 px-3 sm:px-5 font-medium text-sm focus:outline-none ${
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
            </div>
            {activeTab === "Overview" && (
                <form className="pt-4 grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6 md:col-span-6">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter title..."
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-6 md:col-span-4">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Translation
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Translation..."
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-12 md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Priority..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <div className="border border-gray-300 rounded-md">
                            {editor && (
                                <div className="editor-toolbar border-b border-gray-300 p-2 flex flex-wrap gap-1">
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleBold()
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
                                        title="Bold"
                                    >
                                        <span className="font-bold">B</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleItalic()
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
                                        title="Italic"
                                    >
                                        <span className="italic">I</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleUnderline()
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("underline") ? "bg-gray-200" : ""}`}
                                        title="Underline"
                                    >
                                        <span className="underline">U</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleStrike()
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("strike") ? "bg-gray-200" : ""}`}
                                        title="Strikethrough"
                                    >
                                        <span className="line-through">S</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleHeading({ level: 1 })
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}`}
                                        title="Heading 1"
                                    >
                                        H1
                                    </button>
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleHeading({ level: 2 })
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}`}
                                        title="Heading 2"
                                    >
                                        H2
                                    </button>
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleBulletList()
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
                                        title="Bullet List"
                                    >
                                        • List
                                    </button>
                                    <button
                                        onClick={() =>
                                            editor
                                                .chain()
                                                .focus()
                                                .toggleOrderedList()
                                                .run()
                                        }
                                        className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
                                        title="Ordered List"
                                    >
                                        1. List
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = window.prompt(
                                                "Enter the URL of the link:",
                                            );
                                            if (url) {
                                                editor
                                                    .chain()
                                                    .focus()
                                                    .toggleLink({ href: url })
                                                    .run();
                                            }
                                        }}
                                        className={`p-2 rounded ${editor.isActive("link") ? "bg-gray-200" : ""}`}
                                        title="Link"
                                    >
                                        Link
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = window.prompt(
                                                "Enter the URL of the image:",
                                            );
                                            if (url) {
                                                editor
                                                    .chain()
                                                    .focus()
                                                    .setImage({ src: url })
                                                    .run();
                                            }
                                        }}
                                        className="p-2 rounded"
                                        title="Image"
                                    >
                                        Image
                                    </button>
                                    <input
                                        type="color"
                                        onInput={(event) =>
                                            editor
                                                .chain()
                                                .focus()
                                                .setColor(event.target.value)
                                                .run()
                                        }
                                        value={
                                            editor.getAttributes("textStyle")
                                                .color || "#000000"
                                        }
                                        title="Text Color"
                                        className="w-8 h-8 focus:outline-none"
                                    />
                                </div>
                            )}
                            <EditorContent
                                editor={editor}
                                className="min-h-[100px] p-4"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Image
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-md ${
                                imageFile
                                    ? "border-gray-300"
                                    : "border-gray-300"
                            }`}
                            onDrop={handleImageDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {imageFile ? (
                                <div className="p-4">
                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                        <div className="flex items-center">
                                            <svg
                                                className="h-10 w-10 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {imageFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(
                                                        imageFile.size /
                                                        (1024 * 1024)
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 flex items-center justify-center gap-5">
                                    <svg
                                        className="h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div>
                                        <p className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium text-primary__color">
                                                Drag & Drop your files
                                            </span>{" "}
                                            or Browse
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageInputChange}
                                            className="sr-only"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Select Image
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base font-medium text-gray-700 mb-2">
                            Status
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            The details used to determine your product behaviour
                            around the web.
                        </p>
                        <div className="space-y-4">
                            {statusOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex items-start"
                                >
                                    <div className="flex items-center h-5">
                                        <input
                                            id={`status-option-${option.id}`}
                                            name={`status-option-${option.id}`}
                                            type="checkbox"
                                            checked={option.checked}
                                            onChange={() =>
                                                toggleStatusOption(option.id)
                                            }
                                            className="focus:ring-primary__color h-4 w-4 text-primary__color border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label
                                            htmlFor={`status-option-${option.id}`}
                                            className="font-medium text-gray-700"
                                        >
                                            {option.name}
                                        </label>
                                        <p className="text-gray-500">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Save
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Products" && (
                <div className="">
                    <div className="flex border-b-[1.5px] border-[#F5F7FF]-200 mb-4">
                        {["All", "Active", "Inactive"].map((tab) => (
                            <button
                                key={tab}
                                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                                    productActiveTab === tab
                                        ? "border-b-2 border-primary__color text-primary__color"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => setProductActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {productActiveTab === "All" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                                    <FilterListbox name="category" options={filterOptions.category} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Child Category</label>
                                    <FilterListbox 
                                        name="childCategory" 
                                        options={filters.category.value === 'electronics' 
                                            ? filterOptions.childCategory 
                                            : [filterOptions.childCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Sub Child Category</label>
                                    <FilterListbox 
                                        name="subChildCategory" 
                                        options={filters.childCategory.value === 'laptops' 
                                            ? filterOptions.subChildCategory 
                                            : [filterOptions.subChildCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Collection</label>
                                    <FilterListbox name="collection" options={filterOptions.collection} />
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
                            </div>
                            <div className="table-wrapper overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                            <th className="py-4 px-5 font-semibold">SL</th>
                                            <th className="py-4 px-5 font-semibold whitespace-nowrap">Title</th>
                                            <th className="py-4 px-5 font-semibold">Image</th>
                                            <th className="py-4 px-5 font-semibold">Stock</th>
                                            <th className="py-4 px-5 font-semibold">Cost</th>
                                            <th className="py-4 px-5 font-semibold">Price</th>
                                            <th className="py-4 px-5 font-semibold">Profit</th>
                                            <th className="py-4 px-5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                        {products.map((product, index) => (
                                            <tr key={index}>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{index + 1}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                                    <span className="block mb-1">{product.title}</span>
                                                    <span className="font-bold text-primary__color mr-2">{product.id}</span>
                                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getProductImage(product.image)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{product.stock}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.cost}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.price}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.profit}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-center gap-4">
                                                    <ToggleButton 
                                                        active={product.active} 
                                                        onChange={() => toggleProductActive(index)} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    {productActiveTab === "Active" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                                    <FilterListbox name="category" options={filterOptions.category} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Child Category</label>
                                    <FilterListbox 
                                        name="childCategory" 
                                        options={filters.category.value === 'electronics' 
                                            ? filterOptions.childCategory 
                                            : [filterOptions.childCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Sub Child Category</label>
                                    <FilterListbox 
                                        name="subChildCategory" 
                                        options={filters.childCategory.value === 'laptops' 
                                            ? filterOptions.subChildCategory 
                                            : [filterOptions.subChildCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Collection</label>
                                    <FilterListbox name="collection" options={filterOptions.collection} />
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
                            </div>
                            <div className="table-wrapper overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                            <th className="py-4 px-5 font-semibold">SL</th>
                                            <th className="py-4 px-5 font-semibold whitespace-nowrap">Title</th>
                                            <th className="py-4 px-5 font-semibold">Image</th>
                                            <th className="py-4 px-5 font-semibold">Stock</th>
                                            <th className="py-4 px-5 font-semibold">Cost</th>
                                            <th className="py-4 px-5 font-semibold">Price</th>
                                            <th className="py-4 px-5 font-semibold">Profit</th>
                                            <th className="py-4 px-5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                        {products.map((product, index) => (
                                            <tr key={index}>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{index + 1}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                                    <span className="block mb-1">{product.title}</span>
                                                    <span className="font-bold text-primary__color mr-2">{product.id}</span>
                                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getProductImage(product.image)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{product.stock}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.cost}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.price}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.profit}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-center gap-4">
                                                    <ToggleButton 
                                                        active={product.active} 
                                                        onChange={() => toggleProductActive(index)} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    {productActiveTab === "Inactive" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                                    <FilterListbox name="category" options={filterOptions.category} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Child Category</label>
                                    <FilterListbox 
                                        name="childCategory" 
                                        options={filters.category.value === 'electronics' 
                                            ? filterOptions.childCategory 
                                            : [filterOptions.childCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Sub Child Category</label>
                                    <FilterListbox 
                                        name="subChildCategory" 
                                        options={filters.childCategory.value === 'laptops' 
                                            ? filterOptions.subChildCategory 
                                            : [filterOptions.subChildCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Collection</label>
                                    <FilterListbox name="collection" options={filterOptions.collection} />
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
                            </div>
                            <div className="table-wrapper overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                            <th className="py-4 px-5 font-semibold">SL</th>
                                            <th className="py-4 px-5 font-semibold whitespace-nowrap">Title</th>
                                            <th className="py-4 px-5 font-semibold">Image</th>
                                            <th className="py-4 px-5 font-semibold">Stock</th>
                                            <th className="py-4 px-5 font-semibold">Cost</th>
                                            <th className="py-4 px-5 font-semibold">Price</th>
                                            <th className="py-4 px-5 font-semibold">Profit</th>
                                            <th className="py-4 px-5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                        {products.map((product, index) => (
                                            <tr key={index}>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{index + 1}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                                    <span className="block mb-1">{product.title}</span>
                                                    <span className="font-bold text-primary__color mr-2">{product.id}</span>
                                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getProductImage(product.image)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{product.stock}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.cost}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.price}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.profit}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-center gap-4">
                                                    <ToggleButton 
                                                        active={product.active} 
                                                        onChange={() => toggleProductActive(index)} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
            {activeTab === "All Products" && (
                <div className="">
                    <div className="flex border-b-[1.5px] border-[#F5F7FF]-200 mb-4">
                        {["All", "Active", "Inactive"].map((tab) => (
                            <button
                                key={tab}
                                className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                                    productActiveTab === tab
                                        ? "border-b-2 border-primary__color text-primary__color"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                                onClick={() => setProductActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    {productActiveTab === "All" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                                    <FilterListbox name="category" options={filterOptions.category} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Child Category</label>
                                    <FilterListbox 
                                        name="childCategory" 
                                        options={filters.category.value === 'electronics' 
                                            ? filterOptions.childCategory 
                                            : [filterOptions.childCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Sub Child Category</label>
                                    <FilterListbox 
                                        name="subChildCategory" 
                                        options={filters.childCategory.value === 'laptops' 
                                            ? filterOptions.subChildCategory 
                                            : [filterOptions.subChildCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Collection</label>
                                    <FilterListbox name="collection" options={filterOptions.collection} />
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
                            </div>
                            <div className="table-wrapper overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                            <th className="py-4 px-5 font-semibold">SL</th>
                                            <th className="py-4 px-5 font-semibold whitespace-nowrap">Title</th>
                                            <th className="py-4 px-5 font-semibold">Image</th>
                                            <th className="py-4 px-5 font-semibold">Stock</th>
                                            <th className="py-4 px-5 font-semibold">Cost</th>
                                            <th className="py-4 px-5 font-semibold">Price</th>
                                            <th className="py-4 px-5 font-semibold">Profit</th>
                                            <th className="py-4 px-5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                        {products.map((product, index) => (
                                            <tr key={index}>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{index + 1}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                                    <span className="block mb-1">{product.title}</span>
                                                    <span className="font-bold text-primary__color mr-2">{product.id}</span>
                                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getProductImage(product.image)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{product.stock}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.cost}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.price}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.profit}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-center gap-4">
                                                    <ToggleButton 
                                                        active={product.active} 
                                                        onChange={() => toggleProductActive(index)} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    {productActiveTab === "Active" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                                    <FilterListbox name="category" options={filterOptions.category} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Child Category</label>
                                    <FilterListbox 
                                        name="childCategory" 
                                        options={filters.category.value === 'electronics' 
                                            ? filterOptions.childCategory 
                                            : [filterOptions.childCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Sub Child Category</label>
                                    <FilterListbox 
                                        name="subChildCategory" 
                                        options={filters.childCategory.value === 'laptops' 
                                            ? filterOptions.subChildCategory 
                                            : [filterOptions.subChildCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Collection</label>
                                    <FilterListbox name="collection" options={filterOptions.collection} />
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
                            </div>
                            <div className="table-wrapper overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                            <th className="py-4 px-5 font-semibold">SL</th>
                                            <th className="py-4 px-5 font-semibold whitespace-nowrap">Title</th>
                                            <th className="py-4 px-5 font-semibold">Image</th>
                                            <th className="py-4 px-5 font-semibold">Stock</th>
                                            <th className="py-4 px-5 font-semibold">Cost</th>
                                            <th className="py-4 px-5 font-semibold">Price</th>
                                            <th className="py-4 px-5 font-semibold">Profit</th>
                                            <th className="py-4 px-5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                        {products.map((product, index) => (
                                            <tr key={index}>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{index + 1}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                                    <span className="block mb-1">{product.title}</span>
                                                    <span className="font-bold text-primary__color mr-2">{product.id}</span>
                                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getProductImage(product.image)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{product.stock}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.cost}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.price}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.profit}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-center gap-4">
                                                    <ToggleButton 
                                                        active={product.active} 
                                                        onChange={() => toggleProductActive(index)} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    {productActiveTab === "Inactive" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
                                    <FilterListbox name="category" options={filterOptions.category} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Child Category</label>
                                    <FilterListbox 
                                        name="childCategory" 
                                        options={filters.category.value === 'electronics' 
                                            ? filterOptions.childCategory 
                                            : [filterOptions.childCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Sub Child Category</label>
                                    <FilterListbox 
                                        name="subChildCategory" 
                                        options={filters.childCategory.value === 'laptops' 
                                            ? filterOptions.subChildCategory 
                                            : [filterOptions.subChildCategory[0]]
                                        } 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Collection</label>
                                    <FilterListbox name="collection" options={filterOptions.collection} />
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
                            </div>
                            <div className="table-wrapper overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                            <th className="py-4 px-5 font-semibold">SL</th>
                                            <th className="py-4 px-5 font-semibold whitespace-nowrap">Title</th>
                                            <th className="py-4 px-5 font-semibold">Image</th>
                                            <th className="py-4 px-5 font-semibold">Stock</th>
                                            <th className="py-4 px-5 font-semibold">Cost</th>
                                            <th className="py-4 px-5 font-semibold">Price</th>
                                            <th className="py-4 px-5 font-semibold">Profit</th>
                                            <th className="py-4 px-5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                        {products.map((product, index) => (
                                            <tr key={index}>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-primary__color">{index + 1}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">
                                                    <span className="block mb-1">{product.title}</span>
                                                    <span className="font-bold text-primary__color mr-2">{product.id}</span>
                                                    <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getStatusColor(product.status)}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getProductImage(product.image)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">{product.stock}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.cost}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.price}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium">৳{product.profit}</td>
                                                <td className="py-3.5 px-5 whitespace-nowrap text-sm font-medium text-center gap-4">
                                                    <ToggleButton 
                                                        active={product.active} 
                                                        onChange={() => toggleProductActive(index)} 
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}