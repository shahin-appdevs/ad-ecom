import { Controller } from "react-hook-form";

export function RHFTextarea({ label, name, control, rules }) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => (
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        <span
                            dangerouslySetInnerHTML={{ __html: label }}
                        ></span>
                    </label>
                    <textarea
                        {...field}
                        rows={4}
                        className={`w-full rounded-lg border px-3 py-2 focus:ring-1 ${
                            fieldState.error
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                    />
                </div>
            )}
        />
    );
}
