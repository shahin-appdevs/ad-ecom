"use client"
// Packages
import { useState } from "react";
// Icons
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";


const Input = ({ type, placeholder, value, onChange, className, Icon, label, checked }) => {
    const [showPassword, setShowPassword] = useState(false);


    // Base Style
    const baseStyles = `h-[40px] p-3 border border-gray-400/20 rounded-lg outline-none text-small__font text-color__heading placeholder:text-gray-400/80 focus:border-primary__color hover:border-gray-400/60 transition-all ${Icon ? "pl-9" : ""} ${type === "password" ? "pr-9" : ""}`;


    return (
        <>
            {type === "checkbox" ? (
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type={type}
                        onChange={onChange}
                        checked={checked}
                        className="h-4 w-4"
                    />
                    {label && <span className="ml-2 text-small__font text-color__text">{label}</span>}
                </label>
            ) : (
                <div>
                    {label && (
                        <label className="text-small__font font-medium text-color__text block mb-1">{label}</label>
                    )}
                    <div className={Icon ? "relative" : ""}>
                        {Icon && (
                            <Icon className="text-color__paragraph size-4 absolute top-[50%] translate-y-[-50%] left-3" />
                        )}
                        <input
                            type={type === "password" ? (showPassword ? "text" : "password") : type}
                            placeholder={placeholder}
                            value={value}
                            onChange={onChange}
                            className={`${baseStyles} ${className || ""}`}
                        />
                        {type === "password" && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-[50%] translate-y-[-50%] right-3 text-gray-400/80 transition-all hover:text-secondary__color"
                            >
                                {showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}


// Export Component
export default Input;