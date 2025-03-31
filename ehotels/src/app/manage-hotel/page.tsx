"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/app/utils/api";
import ConfirmationModal from "./ConfirmationModal";
import UpdateModal from "./UpdateModal";
import InsertModal from "./InsertModal";

interface Customer {
  CustomerID: number;
  FullName: string;
  Email: string;
  IdType: string;
  IdNumber: string;
}

interface Employee {
  EmployeeID: number;
  FullName: string;
  Email: string;
  SSN: string;
  Role: string;
}

interface Hotel {
  HotelID: number;
  ChainID: number;
  Name: string;
  Address: string;
  Email: string;
  Phone: string;
  NumberOfRooms: number;
  Rating: number;
}

interface Room {
  RoomID: number;
  HotelID: number;
  Price: number;
  Capacity: string;
}

const ManageHotel = () => {
const [customers, setCustomers] = useState<Customer[]>([]);
const [employees, setEmployees] = useState<Employee[]>([]);
const [hotels, setHotels] = useState<Hotel[]>([]);
const [rooms, setRooms] = useState<Room[]>([]);
const [chains, setChains] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState("customers");
const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
const [entityToDelete, setEntityToDelete] = useState<{ entity: string; id: number } | null>(null);
const [entityToUpdate, setEntityToUpdate] = useState<{ entity: string; id: number; data: any } | null>(null);
const [entityToInsert, setEntityToInsert] = useState<{ entity: string; initialData: any } | null>(null);
const [successMessage, setSuccessMessage] = useState<string | null>(null);
const [failureMessage, setFailureMessage] = useState<string | null>(null);
useEffect(() => {
    fetchData();
}, []);

const fetchData = async () => {
    try {
        const [customersData, employeesData, hotelsData, roomsData, chainsData] = await Promise.all([
            apiFetch("/customers"),
            apiFetch("/employees"),
            apiFetch("/hotels"),
            apiFetch("/rooms"),
            apiFetch("/hotel-chains"),
        ]);
        setCustomers(customersData);
        setEmployees(employeesData);
        setHotels(hotelsData);
        setRooms(roomsData);
        setChains(chainsData);
        setLoading(false);
    } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
    }
};
const handleInsert = async (entity: string, data: any) => {
  try {
    await apiFetch(`/${entity}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    fetchData();
    setSuccessMessage(`Successfully added new ${entity.slice(0, -1)}.`);
    setTimeout(() => setSuccessMessage(null), 3000); // Hide message after 3 seconds
  } catch (error) {
    console.error(`Error inserting ${entity}:`, error);
    setFailureMessage(`Failed to add new ${entity.slice(0, -1)}.`);
    setTimeout(() => setFailureMessage(null), 3000); // Hide message after 3 seconds
  }
};

const handleDelete = async (entity: string, id: number) => {
  try {
    await apiFetch(`/${entity}/${id}`, {
      method: "DELETE",
    });
    fetchData();
    setSuccessMessage(`Successfully deleted ${entity.slice(0, -1)}.`);
    setTimeout(() => setSuccessMessage(null), 3000); // Hide message after 3 seconds
  } catch (error) {
    console.error(`Error deleting ${entity}:`, error);
    setFailureMessage(`Failed to delete ${entity.slice(0, -1)}. Error: ${error.message}`);

    debugger
    setTimeout(() => setFailureMessage(null), 3000); // Hide message after 3 seconds
  }
};

const handleUpdate = async (entity: string, id: number, data: any) => {
  try {
    await apiFetch(`/${entity}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    fetchData();
    setSuccessMessage(`Successfully updated ${entity.slice(0, -1)}.`);
    setTimeout(() => setSuccessMessage(null), 3000); // Hide message after 3 seconds
  } catch (error) {
    console.error(`Error updating ${entity}:`, error);
    setFailureMessage(`Failed to update ${entity.slice(0, -1)}.`);
    setTimeout(() => setFailureMessage(null), 3000); // Hide message after 3 seconds
  }
};

  const openConfirmationModal = (entity: string, id: number) => {
    setEntityToDelete({ entity, id });
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setEntityToDelete(null);
    setIsConfirmationModalOpen(false);
  };

  const confirmDeletion = () => {
    if (entityToDelete) {
      handleDelete(entityToDelete.entity, entityToDelete.id);
      closeConfirmationModal();
    }
  };

  const openUpdateModal = (entity: string, id: number, data: any) => {
    const populatedData = populateUpdateData(entity, data);
    setEntityToUpdate({ entity, id, data: populatedData });
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setEntityToUpdate(null);
    setIsUpdateModalOpen(false);
  };

  const saveUpdate = (data: any) => {
    if (entityToUpdate) {
      handleUpdate(entityToUpdate.entity, entityToUpdate.id, data);
    }
  };

  const openInsertModal = (entity: string, initialData: any) => {
    setEntityToInsert({ entity, initialData });
    setIsInsertModalOpen(true);
  };

  const closeInsertModal = () => {
    setEntityToInsert(null);
    setIsInsertModalOpen(false);
  };

  const saveInsert = (data: any) => {
    if (entityToInsert) {
      handleInsert(entityToInsert.entity, data);
    }
  };

    const initialCustomerData = {
        fullName: { value: "", placeholder: "Full Name", type: "text", required: true, valueType: "string" },
        email: { value: "", placeholder: "Email", type: "email", required: true, valueType: "string" },
        idType: { value: "", placeholder: "ID Type", type: "dropdown", options: ["SSN", "SIN", "Driver's License"], required: true, valueType: "string" },
        idNumber: { value: "", placeholder: "ID Number", type: "text", required: true, valueType: "string" },
        address: { value: "", placeholder: "Address", type: "text", required: false, valueType: "string" },
        password: { value: "", placeholder: "Password", type: "password", required: true, valueType: "string" },
        registrationDate: { value: "", placeholder: "Registration Date", type: "hidden", required: true, valueType: "string" },
    };

    const initialEmployeeData = {
        fullName: { value: "", placeholder: "Full Name", type: "text", required: true, valueType: "string" },
        email: { value: "", placeholder: "Email", type: "email", required: true, valueType: "string" },
        ssn: { value: "", placeholder: "SSN", type: "text", required: true, valueType: "string" },
        role: { value: "employee", placeholder: "Role", type: "hidden", required: true, valueType: "string" },
        address: { value: "", placeholder: "Address", type: "text", required: false, valueType: "string" },
        password: { value: "", placeholder: "Password", type: "password", required: true, valueType: "string" },
        hotelID: { value: 0, placeholder: "Hotel ID", type: "dropdown", options: hotels.map(hotel => ({ label: hotel.Name, value: hotel.HotelID })), required: true, valueType: "number" },
    };

    const initialHotelData = {
        chainID: { value: 0, placeholder: "Hotel Chain", type: "dropdown", options: chains.map(chain => ({ label: chain.Name, value: parseInt(chain.ChainID) })), required: true, valueType: "number" },
        name: { value: "", placeholder: "Name", type: "text", required: true, valueType: "string" },
        address: { value: "", placeholder: "Address", type: "text", required: true, valueType: "string" },
        email: { value: "", placeholder: "Email", type: "email", required: false, valueType: "string" },
        phone: { value: "", placeholder: "Phone", type: "tel", required: false, valueType: "string" },
        numberOfRooms: { value: 0, placeholder: "Number of Rooms", type: "hidden", required: true, valueType: "number" },
        starRating: { value: "", placeholder: "Star Rating", type: "dropdown", options: [1, 2, 3, 4, 5], required: true, valueType: "number" },
    };

    const initialRoomData = {
        hotelID: { value: 0, placeholder: "Hotel ID", type: "dropdown", options: hotels.map(hotel => ({ label: hotel.Name, value: hotel.HotelID })), required: true, valueType: "number" },
        price: { value: 20000, placeholder: "Price", type: "number", required: true, valueType: "number" },
        capacity: { value: 1, placeholder: "Capacity", type: "dropdown", options: ["Single", "Double", "Suite"], required: true, valueType: "string" },
        amenities: { value: "", placeholder: "Amenities", type: "text", required: false, valueType: "string" },
        viewType: { value: "", placeholder: "View Type", type: "text", required: false, valueType: "string" },
        isExtendable: { value: false, placeholder: "Is Extendable", type: "checkbox", required: true, valueType: "boolean" },
        damageDescription: { value: "", placeholder: "Damage Description", type: "text", required: false, valueType: "string" },
    };

    const populateUpdateData = (entity: string, data: any) => {
      switch (entity) {
        case "customers":
          
          return {
            fullName: { value: data.FullName, placeholder: "Full Name", type: "text", required: true, valueType: "string" },
            email: { value: data.Email, placeholder: "Email", type: "email", required: true, valueType: "string" },
            idType: { value: data.IDType, placeholder: "ID Type", type: "dropdown", options: ["SSN", "SIN", "Driver's License"], required: true, valueType: "string" },
            idNumber: { value: data.IDNumber, placeholder: "ID Number", type: "text", required: true, valueType: "string" },
            address: { value: data.Address || "", placeholder: "Address", type: "text", required: false, valueType: "string" },
            password: { value: data.Password, placeholder: "Password", type: "password", required: true, valueType: "string" },
            registrationDate: { value: data.RegistrationDate, placeholder: "Registration Date", type: "date", required: true, valueType: "string" },
          };
        case "employees":
          
          return {
            fullName: { value: data.FullName, placeholder: "Full Name", type: "text", required: true, valueType: "string" },
            email: { value: data.Email, placeholder: "Email", type: "email", required: true, valueType: "string" },
            ssn: { value: data.SSN, placeholder: "SSN", type: "text", required: true, valueType: "string" },
            role: { value: data.Role, placeholder: "Role", type: "text", required: true, valueType: "string" },
            address: { value: data.Address || "", placeholder: "Address", type: "text", required: false, valueType: "string" },
            password: { value: data.Password, placeholder: "Password", type: "password", required: true, valueType: "string" },
            hotelID: { value: data.HotelID, placeholder: "Hotel ID", type: "dropdown", options: hotels.map(hotel => ({ label: hotel.Name, value: hotel.HotelID })), required: true, valueType: "number" },
          };
        case "hotels":
          
          return {
            chainID: { value: data.ChainID, placeholder: "Hotel Chain", type: "dropdown", options: chains.map(chain => ({ label: chain.Name, value: parseInt(chain.ChainID) })), required: true, valueType: "number" },
            name: { value: data.Name, placeholder: "Name", type: "text", required: true, valueType: "string" },
            address: { value: data.Address, placeholder: "Address", type: "text", required: true, valueType: "string" },
            email: { value: data.Email || "", placeholder: "Email", type: "email", required: false, valueType: "string" },
            phone: { value: data.Phone || "", placeholder: "Phone", type: "tel", required: false, valueType: "string" },
            numberOfRooms: { value: data.NumberOfRooms, placeholder: "Number of Rooms", type: "hidden", required: true, valueType: "number" },
            starRating: { value: data.StarRating, placeholder: "Star Rating", type: "dropdown", options: [1, 2, 3, 4, 5], required: true, valueType: "number" },
          };
        case "rooms":
        
          return {
            hotelID: { value: data.HotelID, placeholder: "Hotel ID", type: "hidden", required: true, valueType: "number" },
            price: { value: data.Price, placeholder: "Price", type: "number", required: true, valueType: "number" },
            capacity: { value: data.Capacity, placeholder: "Capacity", type: "dropdown", options: ["Single", "Double", "Suite"], required: true, valueType: "string" },
            amenities: { value: data.Amenities || "", placeholder: "Amenities", type: "text", required: false, valueType: "string" },
            viewType: { value: data.ViewType || "", placeholder: "View Type", type: "text", required: false, valueType: "string" },
            isExtendable: { value: data.IsExtendable, placeholder: "Is Extendable", type: "checkbox", required: true, valueType: "boolean" },
            damageDescription: { value: data.DamageDescription || "", placeholder: "Damage Description", type: "text", required: false, valueType: "string" },
          };
        default:
          return {};
      }
    };


  if (loading) return <p className="text-center text-gray-500">Loading data...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Hotel</h2>

      {successMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {successMessage}
      </div>
      )}

      {failureMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {failureMessage}
        </div>
      )}

      {/* Tabs */}
    <div className="mb-6">
      <button
      className={`px-4 py-2 mr-2 rounded ${activeTab === "customers" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      onClick={() => setActiveTab("customers")}
      >
      Customers
      </button>
      <button
      className={`px-4 py-2 mr-2 rounded ${activeTab === "employees" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      onClick={() => setActiveTab("employees")}
      >
      Employees
      </button>
      <button
      className={`px-4 py-2 mr-2 rounded ${activeTab === "hotels" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      onClick={() => setActiveTab("hotels")}
      >
      Hotels
      </button>
      <button
      className={`px-4 py-2 rounded ${activeTab === "rooms" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
      onClick={() => setActiveTab("rooms")}
      >
      Rooms
      </button>
    </div>

      {/* Tab Content */}
      {activeTab === "customers" && (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Customers</h3>
        <table className="w-full border-collapse">
        <thead>
          <tr>
          <th className="border p-2">ID</th>
          <th className="border p-2">Full Name</th>
          <th className="border p-2">Email</th>
          <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.sort((a, b) => a.CustomerID - b.CustomerID).map((customer) => (
          <tr key={customer.CustomerID}>
            <td className="border p-2">{customer.CustomerID}</td>
            <td className="border p-2">{customer.FullName}</td>
            <td className="border p-2">{customer.Email}</td>
            <td className="border p-2">
            <button
              className="bg-red-600 text-white px-2 py-1 rounded mr-2"
              onClick={() => openConfirmationModal("customers", customer.CustomerID)}
            >
              Delete
            </button>
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => openUpdateModal("customers", customer.CustomerID, customer)}
            >
              Update
            </button>
            </td>
          </tr>
          ))}
        </tbody>
        </table>
        <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        onClick={() => openInsertModal("customers", initialCustomerData)}
        >
        Add Customer
        </button>
      </div>
      )}

      {activeTab === "employees" && (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Employees</h3>
        <table className="w-full border-collapse">
        <thead>
          <tr>
          <th className="border p-2">ID</th>
          <th className="border p-2">Full Name</th>
          <th className="border p-2">Email</th>
          <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.sort((a, b) => a.EmployeeID - b.EmployeeID).map((employee) => (
          <tr key={employee.EmployeeID}>
            <td className="border p-2">{employee.EmployeeID}</td>
            <td className="border p-2">{employee.FullName}</td>
            <td className="border p-2">{employee.Email}</td>
            <td className="border p-2">
            <button
              className="bg-red-600 text-white px-2 py-1 rounded mr-2"
              onClick={() => openConfirmationModal("employees", employee.EmployeeID)}
            >
              Delete
            </button>
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => openUpdateModal("employees", employee.EmployeeID, employee)}
            >
              Update
            </button>
            </td>
          </tr>
          ))}
        </tbody>
        </table>
        <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        onClick={() => openInsertModal("employees", initialEmployeeData)}
        >
        Add Employee
        </button>
      </div>
      )}

      {activeTab === "hotels" && (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Hotels</h3>
        <table className="w-full border-collapse">
        <thead>
          <tr>
          <th className="border p-2">ID</th>
          <th className="border p-2">Name</th>
          <th className="border p-2">Address</th>
          <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.sort((a, b) => a.HotelID - b.HotelID).map((hotel) => (
          <tr key={hotel.HotelID}>
            <td className="border p-2">{hotel.HotelID}</td>
            <td className="border p-2">{hotel.Name}</td>
            <td className="border p-2">{hotel.Address}</td>
            <td className="border p-2">
            <button
              className="bg-red-600 text-white px-2 py-1 rounded mr-2"
              onClick={() => openConfirmationModal("hotels", hotel.HotelID)}
            >
              Delete
            </button>
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => openUpdateModal("hotels", hotel.HotelID, hotel)}
            >
              Update
            </button>
            </td>
          </tr>
          ))}
        </tbody>
        </table>
        <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        onClick={() => openInsertModal("hotels", initialHotelData)}
        >
        Add Hotel
        </button>
      </div>
      )}

      {activeTab === "rooms" && (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Rooms</h3>
        <table className="w-full border-collapse">
        <thead>
          <tr>
          <th className="border p-2">Hotel</th>
          <th className="border p-2">Room Number</th>
          <th className="border p-2">Price</th>
          <th className="border p-2">Capacity</th>
          <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
            {rooms.sort((a, b) => a.HotelID - b.HotelID || a.RoomID - b.RoomID).map((room) => (
            <tr key={`${room.RoomID}-${room.HotelID}`}>
            <td className="border p-2">
              {hotels.find(hotel => hotel.HotelID === room.HotelID)?.Name || "Unknown Hotel"}
            </td>
            <td className="border p-2">{room.RoomID}</td>
            <td className="border p-2">${(room.Price / 100).toFixed(2)}</td>
            <td className="border p-2">{room.Capacity}</td>
            <td className="border p-2">
            <button
              className="bg-red-600 text-white px-2 py-1 rounded mr-2"
              onClick={() => openConfirmationModal("rooms", room.RoomID)}
            >
              Delete
            </button>
            <button
              className="bg-blue-600 text-white px-2 py-1 rounded"
              onClick={() => openUpdateModal("rooms", room.RoomID, room)}
            >
              Update
            </button>
            </td>
          </tr>
          ))}
        </tbody>
        </table>
        <button
        className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        onClick={() => openInsertModal("rooms", initialRoomData)}
        >
        Add Room
        </button>
      </div>
      )}

      {entityToDelete && (
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmDeletion}
        message={`Are you sure you want to delete this ${entityToDelete.entity.slice(0, -1)}?`}
      />
      )}

      {entityToUpdate && (
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={closeUpdateModal}
        onSave={saveUpdate}
        entity={entityToUpdate.entity}
        initialData={entityToUpdate.data}
      />
      )}

      {entityToInsert && (
      <InsertModal
        isOpen={isInsertModalOpen}
        onClose={closeInsertModal}
        onSave={saveInsert}
        entity={entityToInsert.entity}
        initialData={entityToInsert.initialData}
      />
      )}
    </div>
  );
};

export default ManageHotel;