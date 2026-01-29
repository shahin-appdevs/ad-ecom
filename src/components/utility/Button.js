// Packages
import Link from "next/link";


// Button Component
const Button = ({ title, onClick, href, variant = "primary", className, Icon, size = "base", type = "button", }) => {
    // Base Style
    const baseStyles = `rounded-lg text-center transition-all ${Icon ? "inline-flex items-center justify-center" : ""}`;
    // Icon Base Style
    const iconBaseStyle = "size-5 ms-2";

    // All Variants
    const variants = {
        primary: "bg-primary__color text-white__color hover:bg-secondary__color hover:scale-x-105",
        secondary: "bg-neutral-200 text-color__text hover:bg-primary__color hover:text-white__color hover:scale-x-105",
        gray: "bg-gray-400/20 text-color__heading hover:bg-primary__color hover:text-white__color hover:scale-x-105",
        outline: "border-2 border-color__heading text-color__heading hover:bg-primary__color hover:border-primary__color hover:text-white__color",
    };

    // All Sizes
    const sizes = {
        base: "lg:px-9 sm:px-5 px-3 lg:py-5 sm:py-4 py-3 lg:text-primary__font sm:text-small__font text-[12px] lg:font-semibold font-medium",
        s: "px-3 py-2 text-[13px] font-semibold",
        sm: "px-4 py-2 text-small__font font-semibold",
        md: "px-4 py-3 text-small__font font-semibold",
        lg: "px-8 py-4 text-heading__five font-semibold",
    };

    return (
        <>
            {href ? (
                <Link href={href} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className || ""} ${sizes[size]}`}>
                    {title}
                    {Icon && (
                        <Icon className={iconBaseStyle} />
                    )}
                </Link>
            ) : (
                <button
                    type={type}
                    onClick={onClick}
                    className={`${baseStyles} ${variants[variant]} ${className || ""} ${sizes[size]}`}
                >
                    {title}
                    {Icon && (
                        <Icon className={iconBaseStyle} />
                    )}
                </button>
            )}
        </>
    );
};

// Export Component
export default Button;