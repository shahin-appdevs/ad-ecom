"use client"
// Packages
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
// Icons
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";

const Dropdown = ({ href, btnData }) => {
    // Local variables
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);


    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="transition-all hover:scale-105 hover:text-primary__color"
                onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                <EllipsisVerticalIcon className="size-5" />
            </button>
            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-1 min-w-40 z-10 bg-white__color rounded-xl shadow-lg border border-gray-300/40">
                    <ul className="py-2">
                        {href && href.map((item, index) => (
                            <li key={index}>
                                <Link href={item.link} className="w-full py-2 px-3 font-semibold transition-all hover:bg-gray-400/30 whitespace-nowrap">{item.title}</Link>
                            </li>
                        ))}
                        {btnData && btnData.map((item, index) => (
                            <li key={index}>
                                <button
                                    className="w-full text-start py-2 px-4 font-semibold transition-all hover:bg-gray-400/30 whitespace-nowrap"
                                    onClick={item.onClick}
                                >
                                    {item.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

// Export Component
export default Dropdown;