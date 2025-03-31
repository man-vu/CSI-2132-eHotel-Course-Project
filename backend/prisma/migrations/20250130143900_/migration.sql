-- CreateTable
CREATE TABLE "booking" (
    "bookingid" SERIAL NOT NULL,
    "customerid" INTEGER NOT NULL,
    "roomid" INTEGER NOT NULL,
    "bookingdate" DATE NOT NULL,
    "startdate" DATE NOT NULL,
    "enddate" DATE NOT NULL,
    "isarchived" BOOLEAN DEFAULT false,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("bookingid")
);

-- CreateTable
CREATE TABLE "customer" (
    "customerid" SERIAL NOT NULL,
    "fullname" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255),
    "idtype" VARCHAR(50) NOT NULL,
    "registrationdate" DATE NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customerid")
);

-- CreateTable
CREATE TABLE "employee" (
    "employeeid" SERIAL NOT NULL,
    "hotelid" INTEGER NOT NULL,
    "fullname" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255),
    "ssn" VARCHAR(15) NOT NULL,
    "role" VARCHAR(50) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("employeeid")
);

-- CreateTable
CREATE TABLE "hotel" (
    "hotelid" SERIAL NOT NULL,
    "chainid" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "starrating" INTEGER,
    "email" VARCHAR(100),
    "phone" VARCHAR(15),
    "numberofrooms" INTEGER NOT NULL,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("hotelid")
);

-- CreateTable
CREATE TABLE "hotelchain" (
    "chainid" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "centralofficeaddress" VARCHAR(255) NOT NULL,
    "numberofhotels" INTEGER NOT NULL,
    "email" VARCHAR(100),
    "phone" VARCHAR(15),

    CONSTRAINT "hotelchain_pkey" PRIMARY KEY ("chainid")
);

-- CreateTable
CREATE TABLE "renting" (
    "rentingid" SERIAL NOT NULL,
    "customerid" INTEGER NOT NULL,
    "roomid" INTEGER NOT NULL,
    "rentdate" DATE NOT NULL,
    "duration" INTEGER NOT NULL,
    "handledby" INTEGER NOT NULL,
    "isarchived" BOOLEAN DEFAULT false,

    CONSTRAINT "renting_pkey" PRIMARY KEY ("rentingid")
);

-- CreateTable
CREATE TABLE "room" (
    "roomid" SERIAL NOT NULL,
    "hotelid" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "capacity" VARCHAR(50) NOT NULL,
    "amenities" VARCHAR(255),
    "viewtype" VARCHAR(50),
    "isextendable" BOOLEAN NOT NULL,
    "damagedescription" TEXT,

    CONSTRAINT "room_pkey" PRIMARY KEY ("roomid")
);

-- CreateIndex
CREATE INDEX "idx_booking_bookingdate_roomid" ON "booking"("bookingdate", "roomid");

-- CreateIndex
CREATE UNIQUE INDEX "employee_ssn_key" ON "employee"("ssn");

-- CreateIndex
CREATE INDEX "idx_hotel_starrating" ON "hotel"("starrating");

-- CreateIndex
CREATE INDEX "idx_room_price" ON "room"("price");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customerid_fkey" FOREIGN KEY ("customerid") REFERENCES "customer"("customerid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_roomid_fkey" FOREIGN KEY ("roomid") REFERENCES "room"("roomid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_hotelid_fkey" FOREIGN KEY ("hotelid") REFERENCES "hotel"("hotelid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_chainid_fkey" FOREIGN KEY ("chainid") REFERENCES "hotelchain"("chainid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "renting" ADD CONSTRAINT "renting_customerid_fkey" FOREIGN KEY ("customerid") REFERENCES "customer"("customerid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "renting" ADD CONSTRAINT "renting_handledby_fkey" FOREIGN KEY ("handledby") REFERENCES "employee"("employeeid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "renting" ADD CONSTRAINT "renting_roomid_fkey" FOREIGN KEY ("roomid") REFERENCES "room"("roomid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_hotelid_fkey" FOREIGN KEY ("hotelid") REFERENCES "hotel"("hotelid") ON DELETE CASCADE ON UPDATE NO ACTION;
