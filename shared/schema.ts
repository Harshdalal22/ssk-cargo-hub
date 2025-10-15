import { pgTable, uuid, text, timestamp, numeric, date, pgEnum } from "drizzle-orm/pg-core";

export const appRoleEnum = pgEnum('app_role', ['admin', 'staff']);

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  role: appRoleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vehicleHiringDetails = pgTable('vehicle_hiring_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: text('booking_id').notNull(),
  date: date('date').notNull(),
  grNumber: text('gr_number').notNull(),
  billNumber: text('bill_number'),
  lorryNumber: text('lorry_number').notNull(),
  driverNumber: text('driver_number'),
  ownerName: text('owner_name').notNull(),
  fromLocation: text('from_location').notNull(),
  toLocation: text('to_location').notNull(),
  freight: numeric('freight').notNull().default('0'),
  advance: numeric('advance').notNull().default('0'),
  otherExpenses: numeric('other_expenses').notNull().default('0'),
  podStatus: text('pod_status').notNull().default('Pending'),
  podReceivedStatus: text('pod_received_status').default('Not Received'),
  podReceivedDate: date('pod_received_date'),
  paymentStatus: text('payment_status').notNull().default('Pending'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookingRegister = pgTable('booking_register', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: text('booking_id').notNull(),
  partyName: text('party_name').notNull(),
  date: date('date').notNull(),
  grNumber: text('gr_number').notNull(),
  billNumber: text('bill_number'),
  lorryNumber: text('lorry_number').notNull(),
  lorryType: text('lorry_type').notNull(),
  weight: numeric('weight').notNull(),
  fromLocation: text('from_location').notNull(),
  toLocation: text('to_location').notNull(),
  freight: numeric('freight').notNull().default('0'),
  advance: numeric('advance').notNull().default('0'),
  otherExpenses: numeric('other_expenses').notNull().default('0'),
  paymentStatus: text('payment_status').notNull().default('Pending'),
  podReceivedStatus: text('pod_received_status').default('Not Received'),
  podReceivedDate: date('pod_received_date'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const advancePayments = pgTable('advance_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  recordType: text('record_type').notNull(),
  recordId: uuid('record_id').notNull(),
  amount: numeric('amount').notNull().default('0'),
  paymentDate: date('payment_date').notNull().defaultNow(),
  notes: text('notes'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const customerDetails = pgTable('customer_details', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: text('customer_id').notNull().unique(),
  customerName: text('customer_name').notNull(),
  companyName: text('company_name'),
  phoneNumber: text('phone_number').notNull(),
  email: text('email'),
  address: text('address'),
  gstNumber: text('gst_number'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const vehicleFleet = pgTable('vehicle_fleet', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: text('vehicle_id').notNull().unique(),
  lorryNumber: text('lorry_number').notNull().unique(),
  lorryType: text('lorry_type').notNull(),
  capacityTons: numeric('capacity_tons'),
  ownerName: text('owner_name').notNull(),
  ownerPhone: text('owner_phone'),
  registrationDate: date('registration_date'),
  insuranceExpiry: date('insurance_expiry'),
  fitnessExpiry: date('fitness_expiry'),
  status: text('status').default('Available'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const driverInformation = pgTable('driver_information', {
  id: uuid('id').primaryKey().defaultRandom(),
  driverId: text('driver_id').notNull().unique(),
  driverName: text('driver_name').notNull(),
  phoneNumber: text('phone_number').notNull(),
  licenseNumber: text('license_number').notNull().unique(),
  licenseExpiry: date('license_expiry').notNull(),
  experienceYears: numeric('experience_years'),
  currentVehicle: text('current_vehicle'),
  status: text('status').default('Available'),
  address: text('address'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types
export type VehicleHiringDetails = typeof vehicleHiringDetails.$inferSelect;
export type InsertVehicleHiringDetails = typeof vehicleHiringDetails.$inferInsert;

export type BookingRegister = typeof bookingRegister.$inferSelect;
export type InsertBookingRegister = typeof bookingRegister.$inferInsert;

export type AdvancePayment = typeof advancePayments.$inferSelect;
export type InsertAdvancePayment = typeof advancePayments.$inferInsert;

export type CustomerDetails = typeof customerDetails.$inferSelect;
export type InsertCustomerDetails = typeof customerDetails.$inferInsert;

export type VehicleFleet = typeof vehicleFleet.$inferSelect;
export type InsertVehicleFleet = typeof vehicleFleet.$inferInsert;

export type DriverInformation = typeof driverInformation.$inferSelect;
export type InsertDriverInformation = typeof driverInformation.$inferInsert;
