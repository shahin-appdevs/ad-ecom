"use client";
import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";

export default function BrandCreateSection() {
    const [imageFile, setImageFile] = useState(null);

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

    return (
        <div className="bg-white rounded-[12px] p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 mb-2 gap-3 border-b-[1.5px] border-[#F5F7FF]">
                <h2 className="text-[16px] font-semibold">Brand</h2>
            </div>
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
        </div>
    );
}