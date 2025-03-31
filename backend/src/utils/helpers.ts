export const getObject = (parent: Record<string, any>, child: string): Record<string, any> => {
    return Object.keys(parent)
        .filter((key) => key.startsWith(child + "."))
        .reduce((acc, key) => {
          acc[key.replace(child + ".", "")] = parent[key];
          return acc;
        }, {} as Record<string, any>);
  };

export const modelSchema = {
  Hotel: ["HotelID", "ChainID", "Name", "StarRating", "NumberOfRooms"],
  HotelChain: ["ChainID", "Name", "CentralOfficeAddress", "NumberOfHotels"],
  Room: ["RoomID", "HotelID", "Price", "Capacity", "Amenities", "ViewType", "IsExtendable", "DamageDescription"],
  Booking: ["BookingID", "CustomerID", "HotelID", "RoomID", "BookingDate", "StartDate", "EndDate", "IsArchived"],
  Customer: ["CustomerID", "Password", "FullName", "IDType", "IDNumber", "RegistrationDate"],
  Employee: ["EmployeeID", "HotelID", "Password", "FullName", "SSN", "Role"],
  Renting: ["RentingID", "CustomerID", "RoomID", "HotelID", "RentDate", "Duration", "HandledBy", "IsArchived"],
  Transaction: ["TransactionID", "CustomerID", "RentingID", "BookingID", "Amount", "PaymentMethod", "PaymentDate"],
  ContactInfo: ["EntityID", "EntityType", "ContactType", "ContactValue"],
  AddressInfo: ["EntityID", "EntityType", "Address", "AddressType"]
};
  

export default modelSchema;
