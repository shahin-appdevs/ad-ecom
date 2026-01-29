import { Controller } from "react-hook-form";

export function Input({ label, error, ...props }) {
    return (
        <div className="w-full!">
            <label className="block mb-1 text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                {...props}
                className={`w-full rounded-lg border px-3 py-2 xl:py-3  focus:ring-1 outline-none ${
                    error
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error.message}</p>
            )}
        </div>
    );
}

export function RHFInput({
    label,
    name,
    control,
    type = "text",
    rules,
    placeholder,
    readOnly = false,
}) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <div className="w-full">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        <span
                            dangerouslySetInnerHTML={{ __html: label }}
                        ></span>
                    </label>
                    <input
                        {...field}
                        readOnly={readOnly}
                        type={type}
                        placeholder={placeholder}
                        className={`w-full rounded-lg border outline-none px-3 py-2 xl:py-3  focus:ring-1 ${
                            fieldState.error
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                    />
                    {fieldState.error && (
                        <p className="mt-1 text-sm text-red-500">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
}
