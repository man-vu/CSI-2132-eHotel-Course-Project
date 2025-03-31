"use client";
import { FC, useState, useEffect } from "react";

interface InsertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    entity: string;
    initialData: any;
}

const InsertModal: FC<InsertModalProps> = ({ isOpen, onClose, onSave, entity, initialData }) => {
    const [formData, setFormData] = useState(initialData);
    const [error, setError] = useState<string | null>(null);
    const [invalidFields, setInvalidFields] = useState<string[]>([]);

    console.log(initialData); // Open the

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: {
                ...formData[name],
                value: type === "checkbox" ? checked : value,
            },
        });
    };

    const handleSubmit = () => {
        const dataToSave = Object.keys(formData).reduce((acc, key) => {
            let value = formData[key].value;
            if (formData[key].valueType) {
                switch (formData[key].valueType) {
                    case "number":
                        value = Number(value);
                        break;
                    case "boolean":
                        value = Boolean(value);
                        break;
                    case "string":
                    default:
                        value = String(value);
                        break;
                }
            }

            acc[key] = value;
            return acc;
        }, {} as any);

        const missingFields = Object.keys(formData).filter(
            (key) => formData[key].required && (formData[key].value === null || formData[key].value === undefined) && formData[key].type !== 'hidden'
        );

        if (missingFields.length > 0) {
            const missingLabels = missingFields.map((key) => formData[key].placeholder);
            setError(`Please fill in the following required fields: ${missingLabels.join(", ")}`);
            setInvalidFields(missingFields);
            return;
        }

        // Validate email
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.value)) {
            setError("Valid email is required");
            setInvalidFields(["email"]);
            return;
        }

        // Validate password
        if (formData.password && formData.password.value.length < 6) {
            setError("Password must be at least 6 characters long");
            setInvalidFields(["password"]);
            return;
        }

        console.log(dataToSave);

        setError(null);
        setInvalidFields([]);
        onSave(dataToSave);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Add New {entity.slice(0, -1)}</h3>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                {Object.keys(formData).map((key) => {
                    const field = formData[key];
                    const commonProps = {
                        id: key,
                        name: key,
                        className: `border p-2 w-full mb-2 ${invalidFields.includes(key) ? 'border-red-500' : ''}`,
                        value: field.value,
                        required: field.required,
                        onChange: handleChange,
                    };

                    let inputElement;
                    switch (field.type) {
                        case "dropdown":
                            inputElement = (
                                <select {...commonProps}>
                                    <option value="">Select {field.placeholder}</option>
                                    {field.options.map((option: number | string | { label: string; value: number } | { label: string; value: string }) => {
                                        switch (typeof option) {
                                            case "string":
                                                return (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                );
                                            case "object":
                                                return (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                );
                                            case "number":
                                                return (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </select>
                            );
                            break;
                        case "checkbox":
                            inputElement = (
                                <div className="flex items-center">
                                    <input
                                        {...commonProps}
                                        type="checkbox"
                                        checked={field.value}
                                        className={`mr-2 ${invalidFields.includes(key) ? 'border-red-500' : ''}`}
                                    />
                                </div>
                            );
                            break;
                        default:
                            inputElement = (
                                <input
                                    {...commonProps}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                />
                            );
                            break;
                    }

                    return (
                        field.type !== 'hidden' && <div className="mb-4" key={key}>
                            <label className="block text-gray-700 mb-2" htmlFor={key}>
                                {field.placeholder}
                            </label>
                            {inputElement}
                        </div>
                    );
                })}
                <div className="flex justify-end">
                    <button
                        className="bg-gray-500 text-white p-2 rounded mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-600 text-white p-2 rounded"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsertModal;
