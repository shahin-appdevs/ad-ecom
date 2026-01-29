"use client"
// Packages
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
// Custom SVG Icons
import { Plus } from "@/components/icons/CustomIcons";
// Images
import dragAndDrop from "@public/images/elements/dragAndDrop.png";

const Dropzone = ({ onFileUpload, onFileRemove, resetFileStates, multiple = true, accept = {}, label }) => {
    const [fileNames, setFileNames] = useState([]);
    const [files, setFiles] = useState([]);

    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                if (!multiple) {
                    const file = acceptedFiles[0];
                    onFileUpload([file]);
                    setFileNames([file.name]);
                    setFiles([file]);
                } else {
                    onFileUpload(acceptedFiles);
                    setFileNames((prevNames) => [
                        ...prevNames,
                        ...acceptedFiles.map((file) => file.name),
                    ]);
                    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
                }
            }
        },
        [onFileUpload, multiple]
    );

    const resetFiles = useCallback(() => {
        setFileNames([]);
        setFiles([]);
    }, []);
    // Pass the reset function to the parent
    resetFileStates(resetFiles);

    const removeFile = (fileNameToRemove) => {
        setFileNames((prevNames) =>
            prevNames.filter((fileName) => fileName !== fileNameToRemove)
        );
        const updatedFiles = files.filter((file) => file.name !== fileNameToRemove);
        setFiles(updatedFiles);
        onFileRemove(fileNameToRemove);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        accept,
        maxSize: 52428800, // 50 MB
    });


    return (
        <div>
            {label && (
                <label className="text-small__font font-medium text-color__text block mb-1">{label}</label>
            )}
            <div {...getRootProps()} className={`w-full h-24 rounded-xl border-2 border-dashed shadow-primary__shadow flex items-center justify-center ${isDragActive ? "border-blue-300" : "border-[#E5E7EB]"}`}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-secondary__color flex items-center justify-center me-2">
                            <Plus className="w-6 h-6 text-white__color" />
                        </span>{" "}
                        Drop the files here...
                    </p>
                ) : (
                    <>
                        <Image
                            src={dragAndDrop}
                            width={70}
                            priority={true}
                            quality={100}
                            className="sm:w-[70px] w-[30px] h-auto"
                            alt="Drag And Drop Image"
                        />
                        <p className="text-color__heading sm:font-medium ms-2">
                            Drop your files here or{" "}
                            <span className="text-primary__color font-semibold cursor-pointer">
                                browse
                            </span>
                        </p>
                    </>
                )}
            </div>

            {/* Show file names */}
            {fileNames.length > 0 && (
                <div className="mt-5 block text-start">
                    <ul className="flex flex-wrap gap-2">
                        {fileNames.map((fileName, index) => (
                            <li key={index} className="text-[12px] text-color__text font-semibold bg-section__color px-3 rounded-full">
                                {fileName}
                                <button
                                    onClick={() => removeFile(fileName)}
                                    className="text-red-500 font-bold ms-2 cursor-pointer transition-all hover:text-primary__color"
                                    aria-label={`Remove ${fileName}`}
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dropzone;