'use client';
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "@/components/utility/Button";
  
export default function CreateTicketSection() {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    return (
        <div className="bg-white rounded-[12px] p-7 col-span-7">
            <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Subject</label>
                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Enter Subject..."
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Message</label>
                        <textarea
                            rows={5}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                            placeholder="Write here..."
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Attachments</label>
                        <div
                            {...getRootProps()}
                            className={`border border-dashed rounded-md p-10 md:p-20 text-center cursor-pointer transition-colors duration-200 ${
                                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                        >
                            <input {...getInputProps()} />
                            {
                                isDragActive ? (
                                    <p className="text-sm text-blue-600">Drop the files here...</p>
                                ) : (
                                    <p className="text-sm text-gray-500">Drag & drop files here, or click to select</p>
                                )
                            }
                        </div>
                        {files.length > 0 && (
                            <ul className="mt-3 space-y-1 text-sm text-gray-600">
                                {files.map((file, index) => (
                                    <li key={index} className="truncate">{file.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <Button
                    title="Add New"
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                />
            </form>
        </div>
    );
}