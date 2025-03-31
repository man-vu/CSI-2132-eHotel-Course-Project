-- Drop views
DROP VIEW IF EXISTS AvailableRoomsByArea CASCADE;
DROP VIEW IF EXISTS AggregatedRoomCapacity CASCADE;
DROP VIEW IF EXISTS TopExpensiveHotels CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS AfterRoomInsert ON Room;
DROP TRIGGER IF EXISTS AfterRoomDelete ON Room;
DROP TRIGGER IF EXISTS PreventHotelDelete ON Hotel;
DROP TRIGGER IF EXISTS ArchiveBookingOnRoomDelete ON Room;

-- Drop indexes
DROP INDEX IF EXISTS idx_Room_Price;
DROP INDEX IF EXISTS idx_Booking_BookingDate_RoomID;
DROP INDEX IF EXISTS idx_Hotel_StarRating;

-- Drop tables
DROP TABLE IF EXISTS Renting CASCADE;
DROP TABLE IF EXISTS Booking CASCADE;
DROP TABLE IF EXISTS ContactInfo CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS Room CASCADE;
DROP TABLE IF EXISTS AddressInfo CASCADE;
DROP TABLE IF EXISTS Hotel CASCADE;
DROP TABLE IF EXISTS HotelChain CASCADE;
DROP TABLE IF EXISTS Transaction CASCADE;


-- HotelChain Table
CREATE TABLE HotelChain (
    ChainID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    CentralOfficeAddress VARCHAR(255) NOT NULL,
    NumberOfHotels INT NOT NULL
);

-- Hotel Table 
CREATE TABLE Hotel (
    HotelID SERIAL PRIMARY KEY,
    ChainID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    StarRating INT CHECK (StarRating BETWEEN 1 AND 5),
    NumberOfRooms INT NOT NULL,
    FOREIGN KEY (ChainID) REFERENCES HotelChain(ChainID)
        ON DELETE CASCADE
);


-- Room Table
CREATE TABLE Room (
    RoomID INT NOT NULL,         -- Unique only within a hotel
    HotelID INT NOT NULL,        -- Hotel association
    Price INT NOT NULL,
    Capacity VARCHAR(50) NOT NULL CHECK (Capacity IN ('Single', 'Double', 'Suite')),
    Amenities VARCHAR(255),
    ViewType VARCHAR(50),
    IsExtendable BOOLEAN NOT NULL,
    DamageDescription TEXT,
    PRIMARY KEY (RoomID, HotelID),  -- Composite Primary Key
    FOREIGN KEY (HotelID) REFERENCES Hotel(HotelID) ON DELETE CASCADE
);

-- Customer Table
CREATE TABLE Customer (
    CustomerID SERIAL PRIMARY KEY,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    IDType VARCHAR(50) NOT NULL CHECK (IDType IN ('SSN', 'SIN', 'Driver''s License')),
    IDNumber VARCHAR(50) UNIQUE NOT NULL,
    RegistrationDate DATE NOT NULL
);

-- Employee Table
CREATE TABLE Employee (
    EmployeeID SERIAL PRIMARY KEY,
    HotelID INT NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    SSN VARCHAR(15) UNIQUE NOT NULL,
    Role VARCHAR(50) NOT NULL,
    FOREIGN KEY (HotelID) REFERENCES Hotel(HotelID)
);

-- Fix AddressInfo table
CREATE TABLE AddressInfo (
  EntityID INT,
  EntityType VARCHAR(20) CHECK (EntityType IN ('Hotel', 'HotelChain', 'Customer', 'Employee')),
  Address VARCHAR(255),
  AddressType VARCHAR(50),
  PRIMARY KEY (EntityID, EntityType, AddressType)
);

-- Fix ContactInfo table
CREATE TABLE ContactInfo (
  EntityID INT,
  EntityType VARCHAR(20) CHECK (EntityType IN ('Customer', 'Employee', 'Hotel', 'HotelChain')),
  ContactType VARCHAR(10) CHECK (ContactType IN ('Email', 'Phone')),
  ContactValue VARCHAR(100),
  PRIMARY KEY (EntityID, EntityType, ContactType)
);



-- Booking Table
CREATE TABLE Booking (
    BookingID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL,
    HotelID INT NOT NULL,
    RoomID INT NOT NULL,
    BookingDate DATE NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsArchived BOOLEAN DEFAULT FALSE, -- To mark bookings as archived instead of deleting
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

-- Renting Table
CREATE TABLE Renting (
    RentingID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL,
    RoomID INT NOT NULL,
	HotelID INT NOT NULL,
    RentDate DATE NOT NULL,
    Duration INT NOT NULL,
    HandledBy INT,
    IsArchived BOOLEAN DEFAULT FALSE, -- To mark rentings as archived instead of deleting
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (RoomID, HotelID) REFERENCES Room(RoomID, HotelID) ON DELETE CASCADE,
    FOREIGN KEY (HandledBy) REFERENCES Employee(EmployeeID) ON DELETE SET NULL
);

-- Transaction Table (Tracks Payments)
CREATE TABLE Transaction (
    TransactionID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL,
    RentingID INT, -- Nullable because some payments may be for bookings
    BookingID INT, -- Nullable because some payments may be for renting
    Amount INT NOT NULL CHECK (Amount >= 0), -- Ensure valid amount
    PaymentMethod VARCHAR(50) NOT NULL CHECK (PaymentMethod IN ('Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'PayPal')),
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Capture payment time

    -- Foreign Key Constraints
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (RentingID) REFERENCES Renting(RentingID) ON DELETE SET NULL,
    FOREIGN KEY (BookingID) REFERENCES Booking(BookingID) ON DELETE SET NULL,

    -- Ensure that either RentingID or BookingID is provided
    CONSTRAINT transaction_must_have_booking_or_renting 
    CHECK (RentingID IS NOT NULL OR BookingID IS NOT NULL)
);

-- Add ON DELETE CASCADE to enforce data consistency for hierarchical deletions
ALTER TABLE Employee
ADD CONSTRAINT FK_Employee_Hotel FOREIGN KEY (HotelID) REFERENCES Hotel(HotelID)
ON DELETE CASCADE;

ALTER TABLE Booking
DROP CONSTRAINT booking_customerid_fkey,
ADD CONSTRAINT booking_customerid_fkey 
FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE;

-- Modify Renting Table Foreign Key to Allow Customer Deletion
ALTER TABLE Renting
DROP CONSTRAINT IF EXISTS renting_customerid_fkey,
ADD CONSTRAINT renting_customerid_fkey 
FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE;

-- Trigger for Insert: Update number of rooms on room insert
CREATE OR REPLACE FUNCTION update_room_count_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Hotel
    SET NumberOfRooms = NumberOfRooms + 1
    WHERE HotelID = NEW.HotelID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER AfterRoomInsert
AFTER INSERT ON Room
FOR EACH ROW
EXECUTE FUNCTION update_room_count_on_insert();


-- Trigger for Delete: Update number of rooms on room delete
CREATE OR REPLACE FUNCTION update_room_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Hotel
    SET NumberOfRooms = NumberOfRooms - 1
    WHERE HotelID = OLD.HotelID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER AfterRoomDelete
AFTER DELETE ON Room
FOR EACH ROW
EXECUTE FUNCTION update_room_count_on_delete();


-- Trigger to Prevent Hotel Deletion if Active Bookings Exist
CREATE OR REPLACE FUNCTION prevent_hotel_deletion()
RETURNS TRIGGER AS $$
DECLARE
    ActiveBookings INT;
BEGIN
    SELECT COUNT(*) INTO ActiveBookings
    FROM Booking
    WHERE RoomID IN (SELECT RoomID FROM Room WHERE HotelID = OLD.HotelID) AND 
          HotelID = OLD.HotelID AND IsArchived = FALSE;

    IF ActiveBookings > 0 THEN
        RAISE EXCEPTION 'Cannot delete hotel with active bookings.';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER PreventHotelDelete
BEFORE DELETE ON Hotel
FOR EACH ROW
EXECUTE FUNCTION prevent_hotel_deletion();


-- Trigger to Archive Bookings When a Room is Deleted
CREATE OR REPLACE FUNCTION archive_booking_on_room_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Booking
    SET IsArchived = TRUE
    WHERE RoomID = OLD.RoomID AND HotelID = OLD.HotelID;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ArchiveBookingOnRoomDelete
AFTER DELETE ON Room
FOR EACH ROW
EXECUTE FUNCTION archive_booking_on_room_delete();


-- Index for Room prices to accelerate price-based queries
CREATE INDEX idx_Room_Price ON Room(Price);

-- Composite index on BookingDate and RoomID for optimized booking queries
CREATE INDEX idx_Booking_BookingDate_RoomID ON Booking(BookingDate, RoomID);

-- Index for Hotel star ratings to optimize searches by star rating
CREATE INDEX idx_Hotel_StarRating ON Hotel(StarRating);


-- View 1: Available Rooms by Area
CREATE OR REPLACE VIEW AvailableRoomsByArea AS
SELECT 
    ai.Address AS Area, 
    COUNT(r.RoomID) AS TotalAvailableRooms
FROM 
    Hotel h
JOIN 
    AddressInfo ai 
    ON ai.EntityID = h.HotelID AND ai.EntityType = 'Hotel'
JOIN 
    Room r 
    ON h.HotelID = r.HotelID
WHERE 
    NOT EXISTS (
        SELECT 1
        FROM Booking b
        WHERE b.RoomID = r.RoomID 
          AND b.HotelID = r.HotelID
          AND b.IsArchived = FALSE
    )
    AND NOT EXISTS (
        SELECT 1
        FROM Renting rt
        WHERE rt.RoomID = r.RoomID 
          AND rt.HotelID = r.HotelID
          AND rt.IsArchived = FALSE
    )
GROUP BY 
    ai.Address;


-- View 2: Aggregated Room Capacity by Hotel
CREATE OR REPLACE VIEW AggregatedRoomCapacity AS
SELECT 
    h.HotelID, 
    h.Name AS HotelName,
    ai.Address AS HotelAddress,
    SUM(
        CASE 
            WHEN r.Capacity = 'Single' THEN 1
            WHEN r.Capacity = 'Double' THEN 2
            WHEN r.Capacity = 'Suite' THEN 4
            ELSE 0
        END
    ) AS TotalCapacity
FROM 
    Hotel h
JOIN 
    Room r ON h.HotelID = r.HotelID
LEFT JOIN 
    AddressInfo ai ON ai.EntityID = h.HotelID 
                   AND ai.EntityType = 'Hotel'
                   AND ai.AddressType = 'Main'
GROUP BY 
    h.HotelID, h.Name, ai.Address;

-- View 3: Top 3 Most Expensive Hotels by Average Room Price
CREATE OR REPLACE VIEW TopExpensiveHotels AS
SELECT 
    h.HotelID, 
    h.Name AS HotelName, 
    AVG(r.Price) AS AverageRoomPrice
FROM 
    Hotel h
JOIN 
    Room r 
ON 
    h.HotelID = r.HotelID
GROUP BY 
    h.HotelID, h.Name
ORDER BY 
    AverageRoomPrice DESC
LIMIT 3;

INSERT INTO HotelChain (ChainID, Name, CentralOfficeAddress, NumberOfHotels)
VALUES
(1, 'Luxury Hotels', '123 Main St, New York, NY', 8),
(2, 'Comfort Stays', '456 Elm St, Los Angeles, CA', 8),
(3, 'Budget Inns', '789 Pine St, Dallas, TX', 8),
(4, 'Premier Suites', '101 Maple Ave, Chicago, IL', 8),
(5, 'Travel Lodge', '202 Oak Rd, Miami, FL', 8);

-- Email and phone contacts for hotel chains
INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue) VALUES
(1, 'HotelChain', 'Email', 'info@luxuryhotels.com'),
(1, 'HotelChain', 'Phone', '1234567890'),
(2, 'HotelChain', 'Email', 'contact@comfortstays.com'),
(2, 'HotelChain', 'Phone', '2345678901'),
(3, 'HotelChain', 'Email', 'support@budgetinns.com'),
(3, 'HotelChain', 'Phone', '3456789012'),
(4, 'HotelChain', 'Email', 'help@premiersuites.com'),
(4, 'HotelChain', 'Phone', '4567890123'),
(5, 'HotelChain', 'Email', 'service@travellodge.com'),
(5, 'HotelChain', 'Phone', '5678901234');


-- HotelID, ChainID, Name, StarRating, NumberOfRooms
INSERT INTO Hotel (HotelID, ChainID, Name, StarRating, NumberOfRooms) VALUES
-- Chain 1: Luxury Hotels (3 hotels)
(1, 1, 'Luxury NY Downtown', 5, 20),
(2, 1, 'Luxury Miami Beach', 5, 25),
(3, 1, 'Luxury SF Bayview', 4, 16),

-- Chain 2: Comfort Stays (3 hotels)
(4, 2, 'Comfort LA Central', 3, 10),
(5, 2, 'Comfort Miami South', 2, 8),
(6, 2, 'Comfort NY Times', 4, 20),

-- Chain 3: Budget Inns (3 hotels)
(7, 3, 'Budget Chicago North', 3, 12),
(8, 3, 'Budget Denver View', 2, 9),
(9, 3, 'Budget Dallas East', 2, 12),

-- Chain 4: Premier Suites (4 hotels)
(10, 4, 'Premier LA Hills', 5, 18),
(11, 4, 'Premier Chicago Center', 5, 22),
(12, 4, 'Premier Dallas Uptown', 4, 12),
(13, 4, 'Premier SF Elite', 5, 16),

-- Chain 5: Travel Lodge (3 hotels)
(14, 5, 'Travel Lodge Denver', 3, 14),
(15, 5, 'Travel Lodge LA West', 3, 10),
(16, 5, 'Travel Lodge Central Park', 3, 10);


-- Hotel addresses (Main only)
INSERT INTO AddressInfo (EntityID, EntityType, Address, AddressType) VALUES
(1, 'Hotel', '100 Wall St, New York, NY', 'Main'),
(2, 'Hotel', '200 Central Park, New York, NY', 'Main'),
(3, 'Hotel', '300 Ocean Dr, Miami, FL', 'Main'),
(4, 'Hotel', '400 Beverly Hills, Los Angeles, CA', 'Main'),
(5, 'Hotel', '500 Michigan Ave, Chicago, IL', 'Main'),
(6, 'Hotel', '600 Main St, Dallas, TX', 'Main'),
(7, 'Hotel', '700 Bay St, San Francisco, CA', 'Main'),
(8, 'Hotel', '800 Denver Rd, Denver, CO', 'Main'),
(9, 'Hotel', '101 Sunset Blvd, Los Angeles, CA', 'Main'),
(10, 'Hotel', '102 Venice Beach, Los Angeles, CA', 'Main'),
(11, 'Hotel', '103 Brickell Ave, Miami, FL', 'Main'),
(12, 'Hotel', '104 North Ave, Chicago, IL', 'Main'),
(13, 'Hotel', '105 Mission St, San Francisco, CA', 'Main'),
(14, 'Hotel', '106 Rocky Rd, Denver, CO', 'Main'),
(15, 'Hotel', '107 East St, Dallas, TX', 'Main'),
(16, 'Hotel', '108 Times Square, New York, NY', 'Main');

-- Email and phone contacts for hotels
INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue) VALUES
(1, 'Hotel', 'Email', 'luxuryny@luxuryhotels.com'),
(1, 'Hotel', 'Phone', '1234567891'),
(2, 'Hotel', 'Email', 'luxuryuptown@luxuryhotels.com'),
(2, 'Hotel', 'Phone', '1234567892'),
(3, 'Hotel', 'Email', 'luxurymia@luxuryhotels.com'),
(3, 'Hotel', 'Phone', '1234567893'),
(4, 'Hotel', 'Email', 'luxuryla@luxuryhotels.com'),
(4, 'Hotel', 'Phone', '1234567894'),
(5, 'Hotel', 'Email', 'luxurychi@luxuryhotels.com'),
(5, 'Hotel', 'Phone', '1234567895'),
(6, 'Hotel', 'Email', 'luxurydal@luxuryhotels.com'),
(6, 'Hotel', 'Phone', '1234567896'),
(7, 'Hotel', 'Email', 'luxurysf@luxuryhotels.com'),
(7, 'Hotel', 'Phone', '1234567897'),
(8, 'Hotel', 'Email', 'luxuryden@luxuryhotels.com'),
(8, 'Hotel', 'Phone', '1234567898'),
(9, 'Hotel', 'Email', 'comfortla@comfortstays.com'),
(9, 'Hotel', 'Phone', '2345678902'),
(10, 'Hotel', 'Email', 'comfortwest@comfortstays.com'),
(10, 'Hotel', 'Phone', '2345678903'),
(11, 'Hotel', 'Email', 'comfortmia@comfortstays.com'),
(11, 'Hotel', 'Phone', '2345678904'),
(12, 'Hotel', 'Email', 'comfortchi@comfortstays.com'),
(12, 'Hotel', 'Phone', '2345678905'),
(13, 'Hotel', 'Email', 'comfortsf@comfortstays.com'),
(13, 'Hotel', 'Phone', '2345678906'),
(14, 'Hotel', 'Email', 'comfortden@comfortstays.com'),
(14, 'Hotel', 'Phone', '2345678907'),
(15, 'Hotel', 'Email', 'comfortdal@comfortstays.com'),
(15, 'Hotel', 'Phone', '2345678908'),
(16, 'Hotel', 'Email', 'comfortny@comfortstays.com'),
(16, 'Hotel', 'Phone', '2345678909');


INSERT INTO Room (RoomID, HotelID, Price, Capacity, ViewType, IsExtendable, DamageDescription)
VALUES
-- Rooms for Hotel 1
(1, 1, 25000, 'Single', 'City View', TRUE, NULL),
(2, 1, 30000, 'Double', 'City View', FALSE, NULL),
(3, 1, 40000, 'Suite', 'River View', TRUE, 'Minor scratches on table'),
(4, 1, 35000, 'Double', 'City View', TRUE, NULL),
(5, 1, 50000, 'Suite', 'City View', FALSE, NULL),

-- Rooms for Hotel 2
(1, 2, 20000, 'Single', 'City View', TRUE, NULL),
(2, 2, 25000, 'Double', 'Park View', FALSE, NULL),
(3, 2, 30000, 'Suite', 'Park View', TRUE, NULL),
(4, 2, 27500, 'Double', 'City View', FALSE, NULL),
(5, 2, 40000, 'Suite', 'City View', TRUE, 'Cracked mirror'),

-- Rooms for Hotel 3
(1, 3, 30000, 'Single', 'Sea View', TRUE, NULL),
(2, 3, 40000, 'Double', 'Sea View', FALSE, NULL),
(3, 3, 50000, 'Suite', 'Sea View', TRUE, 'Damaged sofa'),
(4, 3, 35000, 'Double', 'Pool View', TRUE, NULL),
(5, 3, 45000, 'Suite', 'Sea View', TRUE, NULL),

-- Rooms for Hotel 4
(1, 4, 22000, 'Single', 'City View', TRUE, NULL),
(2, 4, 27000, 'Double', 'City View', FALSE, NULL),
(3, 4, 40000, 'Suite', 'Mountain View', TRUE, 'Broken chair'),
(4, 4, 35000, 'Double', 'Mountain View', TRUE, NULL),
(5, 4, 45000, 'Suite', 'City View', FALSE, NULL),

-- Rooms for Hotel 5
(1, 5, 24000, 'Single', 'City View', TRUE, NULL),
(2, 5, 29000, 'Double', 'Park View', FALSE, NULL),
(3, 5, 41000, 'Suite', 'Park View', TRUE, NULL),
(4, 5, 36000, 'Double', 'City View', TRUE, 'Broken lamp'),
(5, 5, 46000, 'Suite', 'Lake View', FALSE, NULL),

-- Rooms for Hotel 6
(1, 6, 20000, 'Single', 'City View', TRUE, NULL),
(2, 6, 25000, 'Double', 'City View', FALSE, 'Broken closet handle'),
(3, 6, 38000, 'Suite', 'City View', TRUE, NULL),
(4, 6, 30000, 'Double', 'City View', TRUE, NULL),
(5, 6, 48000, 'Suite', 'City View', FALSE, NULL),

-- Rooms for Hotel 7
(1, 7, 26000, 'Single', 'Bay View', TRUE, NULL),
(2, 7, 31000, 'Double', 'Bay View', FALSE, NULL),
(3, 7, 42000, 'Suite', 'Bay View', TRUE, 'Minor wall damage'),
(4, 7, 37000, 'Double', 'City View', TRUE, NULL),
(5, 7, 47000, 'Suite', 'Bay View', FALSE, NULL),

-- Rooms for Hotel 8
(1, 8, 21000, 'Single', 'Mountain View', TRUE, NULL),
(2, 8, 26000, 'Double', 'Mountain View', FALSE, NULL),
(3, 8, 39000, 'Suite', 'Mountain View', TRUE, NULL),
(4, 8, 31000, 'Double', 'City View', TRUE, NULL),
(5, 8, 45000, 'Suite', 'Mountain View', FALSE, NULL),

-- Rooms for Hotel 9
(1, 9, 15000, 'Single', 'City View', TRUE, NULL),
(2, 9, 20000, 'Double', 'City View', FALSE, NULL),
(3, 9, 30000, 'Suite', 'Mountain View', TRUE, 'Scuffed floor'),
(4, 9, 25000, 'Double', 'City View', TRUE, NULL),
(5, 9, 35000, 'Suite', 'City View', FALSE, NULL),

-- Rooms for Hotel 10
(1, 10, 18000, 'Single', 'City View', TRUE, NULL),
(2, 10, 23000, 'Double', 'City View', FALSE, NULL),
(3, 10, 31000, 'Suite', 'Beach View', TRUE, NULL),
(4, 10, 26000, 'Double', 'Beach View', TRUE, NULL),
(5, 10, 36000, 'Suite', 'Beach View', FALSE, 'Broken curtain rod'),

-- Rooms for Hotel 11
(1, 11, 17000, 'Single', 'Beach View', TRUE, NULL),
(2, 11, 22000, 'Double', 'Beach View', FALSE, NULL),
(3, 11, 32000, 'Suite', 'Ocean View', TRUE, 'Minor wall scratches'),
(4, 11, 25000, 'Double', 'Beach View', TRUE, NULL),
(5, 11, 37000, 'Suite', 'Ocean View', FALSE, NULL),

-- Rooms for Hotel 12
(1, 12, 19000, 'Single', 'City View', TRUE, NULL),
(2, 12, 24000, 'Double', 'Park View', FALSE, NULL),
(3, 12, 33000, 'Suite', 'Lake View', TRUE, 'Broken lamp'),
(4, 12, 26000, 'Double', 'City View', TRUE, NULL),
(5, 12, 40000, 'Suite', 'Lake View', FALSE, NULL),

-- Rooms for Hotel 13
(1, 13, 20000, 'Single', 'Bay View', TRUE, NULL),
(2, 13, 27000, 'Double', 'Bay View', FALSE, NULL),
(3, 13, 35000, 'Suite', 'Bay View', TRUE, 'Scuffed floor'),
(4, 13, 28000, 'Double', 'City View', TRUE, NULL),
(5, 13, 42000, 'Suite', 'Bay View', FALSE, NULL),

-- Rooms for Hotel 14
(1, 14, 18000, 'Single', 'Mountain View', TRUE, NULL),
(2, 14, 23000, 'Double', 'Mountain View', FALSE, NULL),
(3, 14, 31000, 'Suite', 'Mountain View', TRUE, NULL),
(4, 14, 26000, 'Double', 'City View', TRUE, 'Broken window handle'),
(5, 14, 39000, 'Suite', 'Mountain View', FALSE, NULL),

-- Rooms for Hotel 15
(1, 15, 19000, 'Single', 'City View', TRUE, NULL),
(2, 15, 25000, 'Double', 'City View', FALSE, 'Cracked tiles'),
(3, 15, 32000, 'Suite', 'City View', TRUE, NULL),
(4, 15, 27000, 'Double', 'Park View', TRUE, NULL),
(5, 15, 41000, 'Suite', 'Park View', FALSE, NULL),

-- Rooms for Hotel 16
(1, 16, 24000, 'Single', 'City View', TRUE, NULL),
(2, 16, 30000, 'Double', 'City View', FALSE, NULL),
(3, 16, 38000, 'Suite', 'City View', TRUE, 'Stained carpet'),
(4, 16, 33000, 'Double', 'Park View', TRUE, NULL),
(5, 16, 45000, 'Suite', 'Park View', FALSE, NULL);

-- Insert Customers (IDs 1–3)
INSERT INTO Customer (CustomerID, Password, FullName, IDType, IDNumber, RegistrationDate)
VALUES
(1, '$2a$12$rtdhOyHKH/XGf.rCWbDJLOOrhbGEKGfbO9uzjwq4U7qOcXbnyTvf6', 'John Doe', 'SSN', '123-45-6789', '2023-01-01'),
(2, '$2a$12$rtdhOyHKH/XGf.rCWbDJLOOrhbGEKGfbO9uzjwq4U7qOcXbnyTvf6', 'Jane Smith', 'SIN', '987-65-4321', '2023-02-01'),
(3, '$2a$12$rtdhOyHKH/XGf.rCWbDJLOOrhbGEKGfbO9uzjwq4U7qOcXbnyTvf6', 'Alice Jones', 'Driver''s License', 'TX1234567', '2023-03-01');

-- Contact Info for Customers
INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue) VALUES
(1, 'Customer', 'Email', 'john.doe@example.com'),
(2, 'Customer', 'Email', 'jane.smith@example.com'),
(3, 'Customer', 'Email', 'alice.jones@example.com');

-- Address Info for Customers
INSERT INTO AddressInfo (EntityID, EntityType, Address, AddressType) VALUES
(1, 'Customer', '123 Maple St, New York, NY', 'Home'),
(2, 'Customer', '456 Oak St, Los Angeles, CA', 'Home'),
(3, 'Customer', '789 Pine St, Dallas, TX', 'Home');

-- Insert Employees (IDs 1–3)
INSERT INTO Employee (EmployeeID, HotelID, Password, FullName, SSN, Role)
VALUES
(1, 1, '$2a$12$rtdhOyHKH/XGf.rCWbDJLOOrhbGEKGfbO9uzjwq4U7qOcXbnyTvf6', 'Manager NY', '111-22-3333', 'Manager'),
(2, 9, '$2a$12$rtdhOyHKH/XGf.rCWbDJLOOrhbGEKGfbO9uzjwq4U7qOcXbnyTvf6', 'Receptionist LA', '222-33-4444', 'Receptionist'),
(3, 3, '$2a$12$rtdhOyHKH/XGf.rCWbDJLOOrhbGEKGfbO9uzjwq4U7qOcXbnyTvf6', 'Cleaner Miami', '333-44-5555', 'Cleaner');

-- Contact Info for Employees
INSERT INTO ContactInfo (EntityID, EntityType, ContactType, ContactValue) VALUES
(1, 'Employee', 'Email', 'manager.ny@example.com'),
(2, 'Employee', 'Email', 'receptionist.la@example.com'),
(3, 'Employee', 'Email', 'cleaner.mia@example.com');

-- Address Info for Employees
INSERT INTO AddressInfo (EntityID, EntityType, Address, AddressType) VALUES
(1, 'Employee', '100 Wall St, New York, NY', 'Work'),
(2, 'Employee', '101 Sunset Blvd, Los Angeles, CA', 'Work'),
(3, 'Employee', '300 Ocean Dr, Miami, FL', 'Work');

INSERT INTO Booking (CustomerID, HotelID, RoomID, BookingDate, StartDate, EndDate)
VALUES
(1, 1, 1, '2025-03-15', '2025-03-20', '2025-03-25'),
(2, 2, 2, '2025-03-16', '2025-04-01', '2025-04-05'),
(3, 3, 3, '2025-03-17', '2025-04-10', '2025-04-15'),
(1, 4, 4, '2025-03-18', '2025-04-20', '2025-04-22'),
(2, 5, 5, '2025-03-19', '2025-04-25', '2025-04-30');

INSERT INTO Renting (CustomerID, RoomID, HotelID, RentDate, Duration, HandledBy)
VALUES
(3, 1, 1, '2025-03-10', 3, 1),
(1, 2, 2, '2025-03-12', 2, 2),
(2, 3, 3, '2025-03-14', 5, 3),
(3, 4, 4, '2025-03-16', 1, 1),
(1, 5, 5, '2025-03-18', 4, 2);
