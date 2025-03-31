"use client";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      {/* Left Side (Logo) */}
      <Link href="/" className="text-lg font-bold">🏨 eHotels</Link>

      {/* Hamburger Menu for Mobile */}
      <button
        className="block md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✖️" : "☰"}
      </button>

      {/* Center Links (Depends on Role) */}
      <div className={`flex-col md:flex-row md:flex space-x-4 ${isOpen ? "flex" : "hidden"} md:flex`}>
        {user?.role === "customer" && (
          <>
            <Link href="/rooms" className="hover:text-gray-300">🔎 Available Rooms</Link>
            <Link href="/manage-bookings" className="hover:text-gray-300">📅 My Bookings</Link>
          </>
        )}

        {user?.role === "employee" && (
          <>
            <Link href="/check-in-customers" className="hover:text-gray-300">🏨 Check-in Customers</Link>
            <Link href="/manage-hotel" className="hover:text-gray-300">🏢 Hotel Management</Link>
            <Link href="/customer-bookings" className="hover:text-gray-300">📜 Customer Bookings</Link>
          </>
        )}

        {/* Show these links only if no user is logged in */}
        {!user && (
          <>
            <Link href="/login" className="hover:text-gray-300">🔑 Login</Link>
            <Link href="/register" className="hover:text-gray-300 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">📝 Register</Link>
          </>
        )}
      </div>

      {/* Right Side (User Info & Logout) */}
      <div className={`flex-col md:flex-row md:flex items-center space-x-4 ${isOpen ? "flex" : "hidden"} md:flex`}>
        {user ? (
          <div className="flex items-center space-x-4">
            <span>👋 Welcome, {user.fullName}!</span>
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">🚪 Logout</button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}