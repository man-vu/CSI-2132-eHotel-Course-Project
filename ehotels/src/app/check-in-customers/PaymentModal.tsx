"use client";
import { useState } from "react";
import { apiFetch } from "@/app/utils/api";
import { useEffect } from "react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentingId: number;
  customerId: number;
  remainingAmount: number;
  onPaymentSuccess: () => void; // New prop
}

const PaymentModal = ({ isOpen, onClose, rentingId, customerId, remainingAmount, onPaymentSuccess }: PaymentModalProps) => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handlePayment = async () => {
    if (!amount || !paymentMethod) {
      setMessage({ text: "Please fill in all fields.", type: "error" });
      return;
    }
    
    const parsedAmount = parseFloat(amount) * 100;
    if (parsedAmount > remainingAmount) {
      setMessage({ text: `Payment amount cannot exceed the remaining amount of $${(remainingAmount / 100).toFixed(2)}.`, type: "error" });
      return;
    }

    try {
      const response = await apiFetch(`/rentings/${rentingId}/payment`, {
        method: "POST",
        body: JSON.stringify({
          customerId,
          rentingId,
          amount: parsedAmount,
          paymentMethod,
        }),
      });

      if (response.ok) {
        setMessage({ text: "Payment successful!", type: "success" });
        setTimeout(() => {
          onClose();
          onPaymentSuccess();
        }, 2000);
      } else {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          setMessage({ text: `Payment failed: ${errorData.error}`, type: "error" });
        } else {
          setMessage({ text: `Payment failed: HTTP error! Status: ${response.status}`, type: "error" });
        }
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setMessage({ text: `Payment failed: ${error.message}`, type: "error" });
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
        {message && (
          <div
            className={`mb-4 p-2 rounded ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <div className="mb-4">
          <p className="text-gray-700">
            Remaining Amount: <span className="font-semibold">${(remainingAmount / 100).toFixed(2)}</span>
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            className="border p-2 w-full mb-2"
            value={amount}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (value >= 0 || e.target.value === "") {
          setAmount(e.target.value);
              }
            }}
            placeholder={(remainingAmount / 100).toString()}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="paymentMethod">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            className="border p-2 w-full mb-2"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white p-2 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white p-2 rounded"
            onClick={handlePayment}
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;