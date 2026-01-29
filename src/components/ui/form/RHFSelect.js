import { useState } from "react";
import { Controller } from "react-hook-form";
import { Listbox } from "@headlessui/react";
import {
    ChevronUpDownIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function RHFSelect({
    label,
    name,
    control,
    options = [],
    rules,
    searchable = false,
    searchPlaceholder = "Search...",
    inputClassName,
}) {
    const [query, setQuery] = useState("");

    const filteredOptions =
        searchable && query
            ? options.filter((option) =>
                  option.toLowerCase().includes(query.toLowerCase()),
              )
            : options;

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

                    <Listbox
                        value={field.value}
                        onChange={(val) => {
                            field.onChange(val);
                            setQuery(""); // reset search on select
                        }}
                    >
                        <div className="relative">
                            {/* Button */}
                            <Listbox.Button
                                className={`relative w-full cursor-pointer rounded-lg border py-2 xl:py-3 pl-3 pr-10 text-left focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                                    fieldState.error
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            >
                                <span className="block truncate">
                                    {field.value || "Select One"}
                                </span>
                                <ChevronUpDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </Listbox.Button>

                            {/* Options */}
                            <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                                {/* Search (conditional) */}
                                {searchable && (
                                    <div className="sticky top-0 bg-white p-2 border-b">
                                        <div className="relative">
                                            <MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={query}
                                                onChange={(e) =>
                                                    setQuery(e.target.value)
                                                }
                                                placeholder={searchPlaceholder}
                                                className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Option list */}
                                <div className="max-h-48 overflow-auto">
                                    {filteredOptions.length === 0 &&
                                        searchable && (
                                            <div className="px-4 py-2 text-gray-500 text-sm">
                                                No results found
                                            </div>
                                        )}

                                    {filteredOptions.map((option) => (
                                        <Listbox.Option
                                            key={option}
                                            value={option}
                                            className={({ active }) =>
                                                `cursor-pointer select-none px-4 py-2 ${
                                                    active
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "text-gray-900"
                                                }`
                                            }
                                        >
                                            {option}
                                        </Listbox.Option>
                                    ))}
                                </div>
                            </Listbox.Options>
                        </div>
                    </Listbox>

                    {/* Error message */}
                    {fieldState.error && (
                        <p className="text-red-500 text-sm mt-1">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
}
