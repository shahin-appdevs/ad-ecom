"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
    PlusIcon,
    ChevronUpDownIcon,
    CheckIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";
import { toast } from "react-hot-toast";
import BarcodePreview from "@/components/dashboard/partials/seller/BarcodePreview";
import { productGetSellerAPI, StoreProductSellerAPI } from "@root/services/apiClient/apiClient";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";

const fileTypes = [{ id: 1, name: "PDF" }];

export default function ProductCreateSection() {
    const [activeTab, setActiveTab] = useState("Overview");
    const [selectedProductType, setSelectedProductType] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState(fileTypes[0]);
    const [productTitle, setProductTitle] = useState('');
    const [translation, setTranslation] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [review, setReview] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [keywords, setKeywords] = useState(["New"]);
    const [currentKeyword, setCurrentKeyword] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubChildCategory, setSelectedSubChildCategory] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [selectedChildCategory, setSelectedChildCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const [selectedVariantType, setSelectedVariantType] = useState(null);
    const [selectedUnitType, setSelectedUnitType] = useState(null);
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [retailPrice, setRetailPrice] = useState(0);
    const [regularPrice, setRegularPrice] = useState(0);
    const [vat, setVat] = useState(0);
    const [quantity, setQuantity] = useState(10);
    const [minOrder, setMinOrder] = useState(1);
    const [sku, setSku] = useState('e07z4');
    const [unit, setUnit] = useState(1);
    const [weight, setWeight] = useState(1);
    const [priority, setPriority] = useState(1);
    const [maxOrder, setMaxOrder] = useState(100);
    const [barcode, setBarcode] = useState('1372745');
    const [question, setQuestion] = useState('');
    const [faqList, setFaqList] = useState([]);
    const [variantSize, setVariantSize] = useState('');
    const [variantList, setVariantList] = useState([]);
    const [variantTitle, setVariantTitle] = useState('');
    const [variantCost, setVariantCost] = useState('');
    const [variantPrice, setVariantPrice] = useState('');
    const [variantStock, setVariantStock] = useState('');
    const [variantMrp, setVariantMrp] = useState('');
    const [variantResell, setVariantResell] = useState('');
    const [featureInputs, setFeatureInputs] = useState([{ title: "", value: "" }]);
    const [productTypes, setProductTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);
    const [subChildCategories, setSubChildCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [collections, setCollections] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [variantTypes, setVariantTypes] = useState([]);
    const [unitTypes, setUnitTypes] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [apiLoading, setApiLoading] = useState(true);

    const prepareProductData = () => {
        return {
            product_type: selectedProductType.id,
            product_title: productTitle,
            translation: translation,
            file_url: fileUrl,
            review: review,
            meta_title: metaTitle,
            meta_description: metaDescription,
            description: editor?.getHTML() || '',
            tab_description: editor?.getHTML() || '',
            main_image: imageFile,
            product_video: videoFile,
            product_keywords: keywords,
            categories: selectedCategories.map(cat => cat.id),
            child_categories: selectedChildCategory ? [selectedChildCategory.id] : [],
            child_sub_categories: selectedSubChildCategory ? [selectedSubChildCategory.id] : [],
            brands: selectedBrand ? [selectedBrand.id] : [],
            campaigns: selectedCampaign ? [selectedCampaign.id] : [],
            collections: selectedCollection ? [selectedCollection.id] : [],
            supplier_id: selectedSupplier?.id || null,
            file_type: selectedFileType?.id || null,
            shops: selectedShop ? [selectedShop.id] : [],
            author_id: selectedAuthor?.id || null,
            status: 1,
            product_cost: purchasePrice,
            product_retail_price: retailPrice,
            product_regular_price: regularPrice,
            product_vat: vat,
            product_quantity: quantity,
            product_priority: priority,
            product_min_order: minOrder,
            product_max_order: maxOrder,
            product_sku: sku,
            product_barcode: barcode,
            product_weight: weight,
            product_unit: unit,
            product_unit_type: selectedUnitType.id,
            feature_title: featureInputs.map(f => f.title),
            feature_value: featureInputs.map(f => f.value),
            variant_data: variantList.map(v => ({
            type: v.type,
            size: v.size,
            title: v.title,
            cost: v.cost,
            price: v.price,
            stock: v.stock,
            mrp: v.mrp,
            resell: v.resell
            })),
            question: faqList.map(faq => faq.question),
            answer: faqList.map(faq => faq.answer),
            meta_title: document.querySelector('[name="meta_title"]')?.value || '',
            meta_description: document.querySelector('[name="meta_description"]')?.value || '',
            image_1: imageFile,
        };
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setApiLoading(true);
                const response = await productGetSellerAPI();
                const data = response.data.data;
                
                setProductTypes(data.product_types);
                setCategories(data.categories);
                setChildCategories(data.child_categories);
                setSubChildCategories(data.child_sub_categories);
                setBrands(data.brands);
                setCampaigns(data.product_campaigns);
                setCollections(data.product_collections);
                setSuppliers(data.suppliers);
                setVariantTypes(data.product_variants);
                setUnitTypes(data.product_units_type);
                
                if (data.product_types.length > 0) {
                    setSelectedProductType(data.product_types[0]);
                }
                if (data.product_variants.length > 0) {
                    setSelectedVariantType(data.product_variants[0]);
                }
                if (data.product_units_type.length > 0) {
                    setSelectedUnitType(data.product_units_type[0]);
                }
                if (data.suppliers.length > 0) {
                    setSelectedSupplier(data.suppliers[0]);
                }
                
            } catch (error) {
                toast.error(error.response?.data?.message?.error?.[0] || "Failed to fetch product data");
            } finally {
                setApiLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredChildCategories = (selectedCategories && selectedCategories.length > 0) 
    ? childCategories.filter(childCat => 
        selectedCategories.some(cat => cat.id === childCat.category_id))
    : childCategories;

    const filteredSubChildCategories = selectedChildCategory
        ? subChildCategories.filter(subCat => 
            subCat.child_category_id === selectedChildCategory.id)
        : subChildCategories;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const productData = prepareProductData();
            const formData = new FormData();
            Object.keys(productData).forEach(key => {
                if (Array.isArray(productData[key])) {
                    productData[key].forEach(item => {
                        formData.append(`${key}[]`, item);
                    });
                } else {
                    formData.append(key, productData[key]);
                }
            });
            if (imageFile) {
                formData.append('main_image', imageFile);
            }
            if (videoFile) {
                formData.append('product_video', videoFile);
            }
            const response = await StoreProductSellerAPI(formData);
            console.log(response);
            toast.success(response?.data?.message?.success?.[0]);
        } catch (error) {
            toast.error(error.response?.data?.message?.error?.[0]);
        } finally {
            setLoading(false);
        }
    };

    const getResellColor = (resell) => {
        switch (resell) {
            case "No":
                return "bg-red-100 text-red-800";
            case "Yes":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleAddFaq = () => {
        const answer = editor?.getHTML();

        const newFaq = { question, answer };
        setFaqList([...faqList, newFaq]);

        // Optional: Reset inputs
        setQuestion('');
        editor?.commands.clearContent();
    };

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

    const handleAddKeyword = () => {
        if (currentKeyword.trim() && !keywords.includes(currentKeyword)) {
            setKeywords([...keywords, currentKeyword.trim()]);
            setCurrentKeyword("");
        }
    };

    const handleRemoveKeyword = (keywordToRemove) => {
        setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
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

    const handleVideoDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("video/")) {
            setVideoFile(file);
        }
    }, []);

    const handleVideoInputChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("video/")) {
            setVideoFile(file);
        }
    };

    const removeVideo = () => {
        setVideoFile(null);
    };

    const [statusOptions, setStatusOptions] = useState([
        {
            id: 1,
            name: "Active",
            description: "Customer can view and order",
            checked: true,
        },
        {
            id: 2,
            name: "Private",
            description:
                "If private, third party can not list this to their site",
            checked: false,
        },
        {
            id: 3,
            name: "Featured",
            description: 'Will be shown at "Featured" section',
            checked: false,
        },
        {
            id: 4,
            name: "Campaign Product",
            description:
                "Mark this if the product belongs to your own campaign",
            checked: false,
        },
        {
            id: 5,
            name: "New Arrival",
            description: 'Will be shown at "New arrival" section',
            checked: false,
        },
        {
            id: 6,
            name: "One Time Purchase",
            description:
                "A customer can only purchase one time only. Useful for promotion",
            checked: false,
        },
        {
            id: 7,
            name: "Continue Selling",
            description: "Customer can order after stock out",
            checked: false,
        },
        {
            id: 8,
            name: "Unlisted",
            description: "Will not show in home screen",
            checked: false,
        },
        {
            id: 9,
            name: "COD Available",
            description: "Customer can pay cash on delivery",
            checked: false,
        },
        {
            id: 10,
            name: "Track with Parent product",
            description:
                "To order this product customer have to purchase its parent product",
            checked: false,
        },
        {
            id: 11,
            name: "Add QR code to image",
            description: "To find product easily by image",
            checked: false,
        },
        {
            id: 12,
            name: "Add Barcode code to image",
            description: "To find product easily by image",
            checked: false,
        },
    ]);

    const [priceStatusOptions, setPriceStatusOptions] = useState([
        {
            id: 1,
            name: "Flash price",
            description: "Do you offer flash price for this product?",
            checked: false,
        },
        {
            id: 2,
            name: "Pre Order",
            description:
                "If pre order, need to set pre order delivery date.",
            checked: false,
        },
        {
            id: 3,
            name: "EMI",
            description: 'Do you offer EMI for this product?',
            checked: false,
        },
        {
            id: 4,
            name: "Resellable",
            description:
                "Anyone can resell and order for others on your platform.",
            checked: false,
        },
        {
            id: 5,
            name: "Wholesale",
            description: 'Do you offer wholesale rate for business?',
            checked: false,
        },
        {
            id: 6,
            name: "Affiliate",
            description:
                "Do you offer affiliate commission for this product?",
            checked: false,
        },
        {
            id: 7,
            name: "Cashback",
            description: "Do you offer cashback for this product?",
            checked: false,
        },
        {
            id: 8,
            name: "Reward Points",
            description: "Do you offer reward points for this product?",
            checked: false,
        },
        {
            id: 9,
            name: "Warranty",
            description: "Do this product have warranty?",
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

    const togglePriceStatusOption = (id) => {
        setPriceStatusOptions(
            priceStatusOptions.map((option) =>
                option.id === id
                    ? { ...option, checked: !option.checked }
                    : option,
            ),
        );
    };

    const handleInputChange = (index, field, newValue) => {
        const updatedInputs = [...featureInputs];
        updatedInputs[index][field] = newValue;
        setFeatureInputs(updatedInputs);
    };

    const handleAddFeatureInput = () => {
        setFeatureInputs([...featureInputs, { title: "", value: "" }]);
    };

    const calculateMargin = () => {
        if (!purchasePrice || purchasePrice === 0) return 0;
        return ((retailPrice - purchasePrice) / purchasePrice) * 100;
    };

    const calculateDiscount = () => {
        if (!regularPrice || regularPrice === 0) return 0;
        return ((regularPrice - retailPrice) / regularPrice) * 100;
    };

    const authors = [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
        { id: 3, name: "Robert Johnson" },
    ];

    const shops = [
        { id: 1, name: "Main Store" },
        { id: 2, name: "Outlet" },
        { id: 3, name: "Online Exclusive" },
    ];

    const CustomListbox = ({
        value,
        onChange,
        options,
        placeholder,
        multiple = false,
    }) => (
        <Listbox value={value} onChange={onChange} multiple={multiple}>
            <div className="relative">
                <Listbox.Button className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                    <span className="truncate">
                        {multiple
                            ? value.length > 0
                                ? value.map((v) => v.name).join(', ') || value.map((v) => v.title).join(', ')
                                : placeholder
                            : value
                                ? value.name || value.title
                                : placeholder}
                    </span>
                    <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                </Listbox.Button>
                <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10 border border-gray-200 max-h-60 overflow-auto">
                    {options.map((option) => (
                        <Listbox.Option
                            key={option.id}
                            value={option}
                            className={({ active }) =>
                                `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                            }
                        >
                            {({ selected }) => (
                                <span className="flex justify-between">
                                    {/* {option.name} */}
                                    {option.name || option.title}
                                    {selected && (
                                        <CheckIcon className="w-4 h-4 text-indigo-600" />
                                    )}
                                </span>
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
                <h2 className="text-[16px] font-semibold">Products</h2>
            </div>
            <div className="tab-wrapper overflow-x-auto">
                <div className="flex border-b-[1.5px] border-[#F5F7FF]-200 mb-4 min-w-max sm:min-w-full">
                    {[
                        "Overview",
                        "Filter",
                        "Features",
                        "Price",
                        "Stock",
                        "Description",
                        "Image",
                        "File",
                        "Variant",
                        "Faq",
                        "Meta",
                        "Review",
                        "Landing Page",
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
                <form className="pt-4 grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6 md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Product Type
                            </label>
                             <Listbox
                                value={selectedProductType}
                                onChange={setSelectedProductType}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        {selectedProductType?.name || "Select a product type"}
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10 max-h-60 overflow-auto">
                                        {productTypes.map((productType) => (
                                            <Listbox.Option
                                                key={productType.id}
                                                value={productType}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span className="flex justify-between">
                                                        {productType.name}
                                                        {selected && (
                                                            <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                        )}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        <div className="col-span-12 sm:col-span-6 md:col-span-6">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={productTitle}
                                onChange={(e) => setProductTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter title..."
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-12 md:col-span-4">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Translation
                            </label>
                            <input
                                type="text"
                                name="translation"
                                value={translation}
                                onChange={(e) => setTranslation(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter Translation..."
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
                            Main Image
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
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Select Video
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-md ${
                                videoFile
                                    ? "border-gray-300"
                                    : "border-gray-300"
                            }`}
                            onDrop={handleVideoDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {videoFile ? (
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
                                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {videoFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(
                                                        videoFile.size /
                                                        (1024 * 1024)
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeVideo}
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
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                        >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={1} 
                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
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
                                            accept="video/*"
                                            onChange={handleVideoInputChange}
                                            className="sr-only"
                                            id="video-upload"
                                        />
                                        <label
                                            htmlFor="video-upload"
                                            className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Select Video
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Keyword
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                            {keywords.map((keyword) => (
                                <div
                                    key={keyword}
                                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                        keyword === "New"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {keyword}
                                    {keyword !== "New" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveKeyword(keyword)
                                            }
                                            className="ml-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-500"
                                        >
                                            <span className="sr-only">
                                                Remove
                                            </span>
                                            <svg
                                                className="h-3.5 w-3.5"
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
                                    )}
                                </div>
                            ))}
                            <div className="flex-1 flex">
                                <input
                                    type="text"
                                    value={currentKeyword}
                                    onChange={(e) =>
                                        setCurrentKeyword(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleAddKeyword()
                                    }
                                    className="flex-1 min-w-[120px] border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Enter Keyword"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddKeyword}
                                    className="ml-2 px-3 py-2 bg-primary__color text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Add
                                </button>
                            </div>
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
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Filter" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        <div className="col-span-12 md:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <CustomListbox
                                        value={selectedCategories}
                                        onChange={setSelectedCategories}
                                        options={categories}
                                        placeholder="Select categories"
                                        multiple
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Child Category
                                    </label>
                                    <CustomListbox
                                        value={selectedChildCategory}
                                        onChange={setSelectedChildCategory}
                                        options={filteredChildCategories}
                                        placeholder="Select child category"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Sub Child Category
                                    </label>
                                    <CustomListbox
                                        value={selectedSubChildCategory}
                                        onChange={setSelectedSubChildCategory}
                                        options={filteredSubChildCategories}
                                        placeholder="Select sub child category"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Brand
                                    </label>
                                    <CustomListbox
                                        value={selectedBrand}
                                        onChange={setSelectedBrand}
                                        options={brands}
                                        placeholder="Select brand"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Campaign
                                    </label>
                                    <CustomListbox
                                        value={selectedCampaign}
                                        onChange={setSelectedCampaign}
                                        options={campaigns}
                                        placeholder="Select Campaign"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Collection
                                    </label>
                                    <CustomListbox
                                        value={selectedCollection}
                                        onChange={setSelectedCollection}
                                        options={collections}
                                        placeholder="Select collection"
                                    />
                                </div>
                                {/* <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Supplier
                                    </label>
                                    <CustomListbox
                                        value={selectedSupplier}
                                        onChange={setSelectedSupplier}
                                        options={suppliers}
                                        placeholder="Select supplier"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Shop
                                    </label>
                                    <CustomListbox
                                        value={selectedShop}
                                        onChange={setSelectedShop}
                                        options={shops}
                                        placeholder="Select shop"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Author
                                    </label>
                                    <CustomListbox
                                        value={selectedAuthor}
                                        onChange={setSelectedAuthor}
                                        options={authors}
                                        placeholder="Select author"
                                    />
                                </div> */}
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="bg-[#F5F7FF] py-6 px-8 rounded-md">
                                <div className="space-y-3">
                                    {selectedCategories.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                                Categories
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedCategories.map(
                                                    (category) => (
                                                        <span
                                                            key={category.id}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                        >
                                                            {category.title}
                                                        </span>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {selectedChildCategory && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                                Child categories
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {selectedChildCategory.title}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedSubChildCategory && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                                Sub Child categories
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {
                                                        selectedSubChildCategory.title
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedBrand && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                                Brands
                                            </h4>
                                            <div className="flex flex-wrap gap-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {selectedBrand.title}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Features" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    {/* <label className="block text-xs font-medium text-gray-700 mb-2">
                        Sample feature
                    </label>
                    <Listbox
                        value={selectedSampleType}
                        onChange={setSelectedSampleType}
                    >
                        <div className="relative">
                            <Listbox.Button className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                {selectedSampleType.name}
                                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                            </Listbox.Button>
                            <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10">
                                {sampleTypes.map((sampleType) => (
                                    <Listbox.Option
                                        key={sampleType.id}
                                        value={sampleType}
                                        className={({ active }) =>
                                            `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                        }
                                    >
                                        {({ selected }) => (
                                            <span className="flex justify-between">
                                                {sampleType.name}
                                                {selected && (
                                                    <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                )}
                                            </span>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </div>
                    </Listbox> */}
                    <div>
                        <h3 className="text-base font-medium text-gray-700 mb-2">
                            Features
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            This information will be displayed publicly so be careful what you share.
                        </p>
                    </div>
                    {featureInputs.map((input, index) => (
                        <div key={index} className="grid grid-cols-12 items-end gap-4">
                            <div className="col-span-12 md:col-span-5 mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={input.title}
                                    onChange={(e) => handleInputChange(index, "title", e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter title..."
                                />
                            </div>
                            <div className="col-span-12 md:col-span-5 mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Value
                                </label>
                                <input
                                    type="text"
                                    value={input.value}
                                    onChange={(e) => handleInputChange(index, "value", e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Enter title..."
                                />
                            </div>
                            {index === featureInputs.length - 1 && (
                                <div className="col-span-12 md:col-span-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={handleAddFeatureInput}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Add Feature
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Price" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        <div className="col-span-12 md:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Cost / Purchase Price
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">৳</span>
                                        </div>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="0.00"
                                            value={purchasePrice}
                                            onChange={(e) => setPurchasePrice(Number(e.target.value))}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">BDT</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Sale / Retail Price
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">৳</span>
                                        </div>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="0.00"
                                            value={retailPrice}
                                            onChange={(e) => setRetailPrice(Number(e.target.value))}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">BDT</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        List / Regular Price
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">৳</span>
                                        </div>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="0.00"
                                            value={regularPrice}
                                            onChange={(e) => setRegularPrice(Number(e.target.value))}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">BDT</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        VAT
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">৳</span>
                                        </div>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-md px-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="0.00"
                                            value={vat}
                                            onChange={(e) => setVat(Number(e.target.value))}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">BDT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="bg-[#F5F7FF] py-6 px-8 rounded-md">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-600">Margin</p>
                                        <p className={`text-sm font-medium ${calculateMargin() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {calculateMargin().toFixed(2)}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Discount</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {calculateDiscount().toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-base font-medium text-gray-700 mb-2">
                            Additional Pricing
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            The details used to determine your product behaviour
                            around the web.
                        </p>
                        <div className="space-y-4">
                            {priceStatusOptions.map((option) => (
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
                                                togglePriceStatusOption(option.id)
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
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Stock" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        <div className="col-span-12 md:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="0.00"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="1"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Min Order
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="1"
                                        value={minOrder}
                                        onChange={(e) => setMinOrder(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Max Order
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="100"
                                        value={maxOrder}
                                        onChange={(e) => setMaxOrder(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        SKU
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="Enter title..."
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Barcode
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="Enter title..."
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="my-5">
                                <h2 className="text-[16px] font-semibold mb-2">Unit & weight</h2>
                                <p>The details used to identify your product type around the web.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Weight(kg)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="1"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Unit
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                        placeholder="1"
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Unit Type
                                    </label>
                                    <Listbox
                                        value={selectedUnitType}
                                        onChange={setSelectedUnitType}
                                    >
                                        <div className="relative">
                                            <Listbox.Button className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                                {selectedUnitType.name}
                                                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10 max-h-60 overflow-auto">
                                                {unitTypes.map((unit) => (
                                                    <Listbox.Option
                                                        key={unit.id}
                                                        value={unit}
                                                        className={({ active }) =>
                                                            `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <span className="flex justify-between">
                                                                {unit.name}
                                                                {selected && (
                                                                    <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="bg-[#F5F7FF] py-6 px-8 rounded-md">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Quantity</p>
                                        <p className="text-gray-600 text-sm font-medium">{quantity || '10'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">SKU</p>
                                        <p className="text-gray-600 text-sm font-medium">{sku || 'e07z4'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Barcode</p>
                                        <BarcodePreview value={barcode || '1372745'} />
                                    </div>
                                    <div className="pt-4 border-t border-gray-200 space-y-2">
                                        <p className="text-sm text-gray-600">Unit & weight</p>
                                        <p className="text-sm">
                                            Weight - {weight || '1'} kg<br />
                                            Unit - {unit || '1'} {selectedUnitType.name.toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>
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
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Description" && (
                <form className="pt-4" onSubmit={handleSubmit}>
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
                                className="min-h-[400px] p-4"
                            />
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
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Image" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Image 1
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
                                                onChange={
                                                    handleImageInputChange
                                                }
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
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Image 2
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
                                                onChange={
                                                    handleImageInputChange
                                                }
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
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Image 3
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
                                                onChange={
                                                    handleImageInputChange
                                                }
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
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Image 4
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
                                                onChange={
                                                    handleImageInputChange
                                                }
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
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Image 5
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
                                                onChange={
                                                    handleImageInputChange
                                                }
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
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Image 6
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
                                                onChange={
                                                    handleImageInputChange
                                                }
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
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Image 7
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
                                                onChange={
                                                    handleImageInputChange
                                                }
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
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "File" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-3">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                File Type
                            </label>
                            <Listbox
                                value={selectedFileType}
                                onChange={setSelectedFileType}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        {selectedFileType.name}
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10">
                                        {fileTypes.map((fileType) => (
                                            <Listbox.Option
                                                key={fileType.id}
                                                value={fileType}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span className="flex justify-between">
                                                        {fileType.name}
                                                        {selected && (
                                                            <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                        )}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        <div className="col-span-12 md:col-span-9">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                File URL
                            </label>
                            <input
                                type="text"
                                name="file_url"
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter title..."
                            />
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
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Variant" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-6">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Variant Type
                            </label>
                            <Listbox
                                value={selectedVariantType}
                                onChange={setSelectedVariantType}
                            >
                                <div className="relative">
                                    <Listbox.Button className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-left flex justify-between items-center">
                                        {selectedVariantType.name}
                                        <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                    </Listbox.Button>
                                    <Listbox.Options className="absolute mt-1 w-full bg-white shadow-md rounded-md z-10 max-h-60 overflow-auto">
                                        {variantTypes.map((variant) => (
                                            <Listbox.Option
                                                key={variant.id}
                                                value={variant}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none px-4 py-2 text-sm ${active ? "bg-indigo-100" : ""}`
                                                }
                                            >
                                                {({ selected }) => (
                                                    <span className="flex justify-between">
                                                        {variant.name}
                                                        {selected && (
                                                            <CheckIcon className="w-4 h-4 text-indigo-600" />
                                                        )}
                                                    </span>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </div>
                            </Listbox>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Variant Size
                            </label>
                            <input
                                type="text"
                                value={variantSize}
                                onChange={(e) => setVariantSize(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter title..."
                            />
                        </div>
                    </div>
                    <div className="bg-white shadow-md rounded-[12px] p-7 mt-3">
                        <h2 className="text-[16px] font-semibold mb-2">Add Variant</h2>
                        <p className="mb-4 text-sm">Enter variant details:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <input type="text" placeholder="Title" className="input-style" value={variantTitle} onChange={(e) => setVariantTitle(e.target.value)} />
                            <input type="text" placeholder="Cost" className="input-style" value={variantCost} onChange={(e) => setVariantCost(e.target.value)} />
                            <input type="text" placeholder="Price" className="input-style" value={variantPrice} onChange={(e) => setVariantPrice(e.target.value)} />
                            <input type="text" placeholder="Stock" className="input-style" value={variantStock} onChange={(e) => setVariantStock(e.target.value)} />
                            <input type="text" placeholder="MRP" className="input-style" value={variantMrp} onChange={(e) => setVariantMrp(e.target.value)} />
                            <input type="text" placeholder="Resell Status" className="input-style" value={variantResell} onChange={(e) => setVariantResell(e.target.value)} />
                        </div>
                        <button
                            type="button"
                            className="bg-primary__color hover:bg-[#5851e3] text-white px-4 py-2 text-sm rounded-[8px]"
                            onClick={() => {
                                const newVariant = {
                                    title: variantTitle,
                                    cost: variantCost,
                                    price: variantPrice,
                                    stock: variantStock,
                                    mrp: variantMrp,
                                    resell: variantResell,
                                    size: variantSize,
                                    type: selectedVariantType?.name || '',
                                    id: Date.now(),
                                    action: TrashIcon,
                                };
                                setVariantList((prev) => [...prev, newVariant]);
                                setVariantTitle('');
                                setVariantCost('');
                                setVariantPrice('');
                                setVariantStock('');
                                setVariantMrp('');
                                setVariantResell('');
                                setVariantSize('');
                            }}
                        >
                            Add Variant
                        </button>
                    </div>
                    <div className="table-wrapper overflow-x-auto mt-5">
                        <table className="min-w-full divide-y divide-[#F5F7FF] whitespace-nowrap">
                            <thead>
                                <tr className="bg-[#F5F7FF] text-left text-sm text-color__paragraph">
                                    <th className="py-4 px-5 font-semibold">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-primary__color focus:ring-primary__color relative top-[3px]"
                                        />
                                    </th>
                                    <th className="py-4 px-5 font-semibold">Title</th>
                                    <th className="py-4 px-5 font-semibold">Stock</th>
                                    <th className="py-4 px-5 font-semibold">Cost</th>
                                    <th className="py-4 px-5 font-semibold">Price</th>
                                    <th className="py-4 px-5 font-semibold">Resell</th>
                                    <th className="py-4 px-5 font-semibold">MRP</th>
                                    <th className="py-4 px-5 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#F5F7FF]">
                                {variantList.map((variant, index) => (
                                    <tr key={variant.id}>
                                        <td className="py-3.5 px-5">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-primary__color focus:ring-primary__color relative top-[3px]"
                                            />
                                        </td>
                                        <td className="py-3.5 px-5">{variant.title}</td>
                                        <td className="py-3.5 px-5">{variant.stock}</td>
                                        <td className="py-3.5 px-5">৳{variant.cost}</td>
                                        <td className="py-3.5 px-5">৳{variant.price}</td>
                                        <td className="py-3.5 px-5">
                                        <span className={`px-3 inline-flex text-[10px] leading-5 font-semibold rounded-[4px] ${getResellColor(variant.resell)}`}>
                                            {variant.resell}
                                        </span>
                                        </td>
                                        <td className="py-3.5 px-5">৳{variant.mrp}</td>
                                        <td className="py-3.5 px-5">
                                        <TrashIcon
                                            className="h-5 w-5 text-red-500 cursor-pointer inline-block"
                                            onClick={() =>
                                            setVariantList(variantList.filter((v) => v.id !== variant.id))
                                            }
                                        />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Faq" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Question
                        </label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Enter title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Answer
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
                    <div className="bg-white shadow-md rounded-[12px] p-7 mt-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="">
                                <h2 className="text-[16px] font-semibold mb-2">Add Faq</h2>
                                <p>Enter Faq details (e.g., Question, Answare, etc.):</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                type="button"
                                onClick={handleAddFaq}
                                    className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                    {faqList.map((faq, idx) => (
                        <div key={idx} className="mt-4 border p-4 rounded-md">
                            <h5 className="font-semibold">{faq.question}</h5>
                            <div
                                className="text-sm text-gray-700 mt-1"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                        </div>
                    ))}
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Meta" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Meta Title
                        </label>
                        <input
                            type="text"
                            name="meta_title"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Enter title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Meta Description
                        </label>
                        <textarea
                            rows={5}
                            name="meta_description"
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Provide product meta description, like Delicious cookies baked to perfection"
                        />
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Review" && (
                <form className="pt-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Review
                        </label>
                        <textarea
                            rows={5}
                            name="review"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Add your comment..."
                        />
                        <button
                            type="submit"
                            className="px-5 py-2 bg-primary__color text-white font-semibold rounded-md hover:bg-opacity-90 transition mt-2"
                        >
                            Post
                        </button>
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            )}
            {activeTab === "Landing Page" && (
                <div className="bg-white shadow-md rounded-[12px] p-7">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="">
                            <h2 className="text-[16px] font-semibold mb-2">Landing Page</h2>
                            <p>Create Landing Page for this product and boost sell.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/seller/product/create"
                                className="flex justify-center items-center gap-1 px-4 py-2 bg-primary__color text-white text-xs rounded-[8px] hover:bg-[#5851e3] transition"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Create Landing Page
                            </Link>
                        </div>
                    </div>
                    <form className="pt-4" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Page URL
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                placeholder="Enter title"
                            />
                        </div>
                        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary__color hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}