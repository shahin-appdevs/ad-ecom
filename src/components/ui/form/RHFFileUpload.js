import { Controller } from "react-hook-form";

export function RHFFileUpload({ label, name, control, rules, error }) {
    return (
        <Controller
            name={name}
            control={control}
            rules={{
                ...rules,
                validate: (files) => {
                    // যদি required হয়, files empty হলে message দেখাবে
                    if (rules?.required && (!files || files.length === 0)) {
                        return rules.required;
                    }
                    return true;
                },
            }}
            render={({ field }) => (
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        <span
                            dangerouslySetInnerHTML={{ __html: label }}
                        ></span>
                    </label>
                    <input
                        type="file"
                        onChange={(e) => field.onChange(e.target.files)} // <-- Send entire FileList
                        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white ${
                            error ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                </div>
            )}
        />
    );
}
