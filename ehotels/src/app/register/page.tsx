"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../utils/api";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    address: "",
    idType: "SSN",  // Default selection
    idNumber: "",
    hotelID: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "hotelID" ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = formData.role === "customer" ? "/auth/register/customer" : "/auth/register/employee";
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setMessage("Registration successful! Redirecting to dashboard...");
      setTimeout(() => router.push(formData.role === "customer" ? "/rooms" : "/dashboard"), 3000);
    } catch (err: any) {
      let errorMessage = "Registration failed.";
      try {
        const errorData = JSON.parse(err.message);
        if (Array.isArray(errorData)) {
          errorMessage = errorData.map((error: any) => `${error.msg} (${error.path})`).join(", ");
        }
      } catch (parseError) {
        console.error("Error parsing error message:", parseError);
      }
      setMessage(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {message && <p className="text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="border p-2 w-full" required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} className="border p-2 w-full" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="border p-2 w-full" required />
        
        {/* Role Selection */}
        <select name="role" onChange={handleChange} className="border p-2 w-full">
          <option value="customer">Customer</option>
          <option value="employee">Employee</option>
        </select>

        {/* Show only for Customers */}
        {formData.role === "customer" && (
          <>
            <select name="idType" onChange={handleChange} className="border p-2 w-full">
              <option value="SSN">SSN</option>
              <option value="SIN">SIN</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
            <input type="text" name="idNumber" placeholder="ID Number" onChange={handleChange} className="border p-2 w-full" required />
          </>
        )}

        {/* Show only for Employees */}
        {formData.role === "employee" && (
          <>
            <input type="text" name="idNumber" placeholder="SSN" onChange={handleChange} className="border p-2 w-full" required />
            <input type="number" name="hotelID" placeholder="Hotel ID" onChange={handleChange} className="border p-2 w-full" required />
          </>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Register
        </button>
      </form>
    </div>
  );
}
