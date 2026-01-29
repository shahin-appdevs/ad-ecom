'use client'
// Packages
import Image from "next/image";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";

const Select = ({ label, options, placeholder, value, onChange, className, styles, ...props }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Custom Single Value Render
    const SingleValue = ({ data }) => (
        <div className="inline-flex items-center gap-2">
            <Image src={data.image} alt={data.label} width={20} height={15} />
            <span>{data.label}</span>
        </div>
    );

    // Custom Option Render
    const CustomSingleOption = (props) => {
        const { data, innerRef, innerProps } = props;
        return (
            <div ref={innerRef} {...innerProps} className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
                <Image src={data.image} alt={data.label} width={20} height={15} />
                <span>{data.label}</span>
            </div>
        );
    };


    return (
        <div>
            {label && (
                <label className="text-small__font font-medium text-color__text block mb-1">{label}</label>
            )}
            <ReactSelect
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`basic-single w-full ${className}`}
                classNamePrefix="react-select"
                components={
                    options.some(option => option.image) ? { SingleValue, Option: CustomSingleOption } : {}
                }
                {...props}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "rgb(var(--primary__color)) !important" : "#9ca3af33",
                        boxShadow: "none",
                        height: "40px",
                        borderRadius: "8px",
                        color: "rgb(var(--color__heading))",
                        fontSize: "var(--small__font)",
                        fontWeight: "600",
                        cursor: "pointer",
                        "&:hover": {
                            borderColor: "rgb(var(--color__paragraph), 0.3)",
                        },
                        ...(styles?.control ? styles.control(base, state) : {}),
                    }),
                    menu: (base) => ({
                        ...base,
                        borderRadius: "8px",
                        marginTop: "5px",
                        paddingTop: "0",
                        boxShadow: "var(--primary__shadow)",
                        ...(styles?.menu ? styles.menu(base) : {}),
                    }),
                    option: (base, state) => ({
                        ...base,
                        cursor: 'pointer',
                        backgroundColor: state.isSelected ? "rgb(var(--primary__color), 0.1)" : state.isFocused ? "rgb(var(--primary_border_color))" : "white",
                        color: state.isSelected ? "#1A202C" : "#333",
                        "&:hover": {
                            backgroundColor: "#D1E7FD",
                        },
                        ...(styles?.option ? styles.option(base, state) : {}),
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: "rgb(var(--color__paragraph))",
                        fontSize: "var(--small__font)",
                        fontWeight: "500",
                        ...(styles?.placeholder ? styles.placeholder(base) : {}),
                    }),
                    valueContainer: (base) => ({
                        ...base,
                        display: "flex",
                    }),
                }}
            />
        </div>
    );
};

export default Select;