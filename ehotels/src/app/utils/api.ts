const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    let errorData;
    try {
        errorData = await response.json();
    } catch {
        errorData = {};
    }

    if (!response.ok) {
        // Directly check if `errorData` is an array
        if (Array.isArray(errorData)) {
            console.error(errorData);
            throw new Error(JSON.stringify(errorData) || `HTTP error! Status: ${response.status}`);
        }

        // Check if errorData.errors exists (for different API formats)
        if (Array.isArray(errorData.errors)) {
            console.error(errorData);
            throw new Error(JSON.stringify(errorData.errors) || `HTTP error! Status: ${response.status}`);
        }

        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    

    return errorData;
};
