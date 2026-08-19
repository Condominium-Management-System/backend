
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
const prisma = new PrismaClient();

const PASSWORD = "Password123!";
const HASH_ROUNDS = 10;

// Complete seed data in JSON format with UUIDs
const seedData = {
  condos: [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      condoCode: "YEKONDO-001",
      condoName: "Ye Kondominium Residence 1",
      address: "Block 1, Main Condominium Road",
      city: "Addis Ababa",
      gpsCoordinates: { latitude: 8.99, longitude: 38.76 },
      maxAdmins: 3,
      blockNumbers: ["B-1-01"],
      activeStatus: true,
      customSettings: { language: "en", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-07-14"),
      createdAt: new Date("2025-07-14")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      condoCode: "YEKONDO-002",
      condoName: "Ye Kondominium Residence 2",
      address: "Block 2, Main Condominium Road",
      city: "Adama",
      gpsCoordinates: { latitude: 9.00, longitude: 38.77 },
      maxAdmins: 3,
      blockNumbers: ["B-2-01"],
      activeStatus: true,
      customSettings: { language: "am", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-07-19"),
      createdAt: new Date("2025-07-19")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      condoCode: "YEKONDO-003",
      condoName: "Ye Kondominium Residence 3",
      address: "Block 3, Main Condominium Road",
      city: "Bahir Dar",
      gpsCoordinates: { latitude: 9.01, longitude: 38.78 },
      maxAdmins: 3,
      blockNumbers: ["B-3-01"],
      activeStatus: true,
      customSettings: { language: "en", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-07-24"),
      createdAt: new Date("2025-07-24")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      condoCode: "YEKONDO-004",
      condoName: "Ye Kondominium Residence 4",
      address: "Block 4, Main Condominium Road",
      city: "Hawassa",
      gpsCoordinates: { latitude: 9.02, longitude: 38.79 },
      maxAdmins: 3,
      blockNumbers: ["B-4-01"],
      activeStatus: true,
      customSettings: { language: "am", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-07-29"),
      createdAt: new Date("2025-07-29")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      condoCode: "YEKONDO-005",
      condoName: "Ye Kondominium Residence 5",
      address: "Block 5, Main Condominium Road",
      city: "Jimma",
      gpsCoordinates: { latitude: 9.03, longitude: 38.80 },
      maxAdmins: 3,
      blockNumbers: ["B-5-01"],
      activeStatus: true,
      customSettings: { language: "en", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-08-03"),
      createdAt: new Date("2025-08-03")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      condoCode: "YEKONDO-006",
      condoName: "Ye Kondominium Residence 6",
      address: "Block 6, Main Condominium Road",
      city: "Dire Dawa",
      gpsCoordinates: { latitude: 9.04, longitude: 38.81 },
      maxAdmins: 3,
      blockNumbers: ["B-6-01"],
      activeStatus: true,
      customSettings: { language: "am", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-08-08"),
      createdAt: new Date("2025-08-08")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440007",
      condoCode: "YEKONDO-007",
      condoName: "Ye Kondominium Residence 7",
      address: "Block 7, Main Condominium Road",
      city: "Mekelle",
      gpsCoordinates: { latitude: 9.05, longitude: 38.82 },
      maxAdmins: 3,
      blockNumbers: ["B-7-01"],
      activeStatus: true,
      customSettings: { language: "en", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-08-13"),
      createdAt: new Date("2025-08-13")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440008",
      condoCode: "YEKONDO-008",
      condoName: "Ye Kondominium Residence 8",
      address: "Block 8, Main Condominium Road",
      city: "Gondar",
      gpsCoordinates: { latitude: 9.06, longitude: 38.83 },
      maxAdmins: 3,
      blockNumbers: ["B-8-01"],
      activeStatus: true,
      customSettings: { language: "am", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-08-18"),
      createdAt: new Date("2025-08-18")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440009",
      condoCode: "YEKONDO-009",
      condoName: "Ye Kondominium Residence 9",
      address: "Block 9, Main Condominium Road",
      city: "Dessie",
      gpsCoordinates: { latitude: 9.07, longitude: 38.84 },
      maxAdmins: 3,
      blockNumbers: ["B-9-01"],
      activeStatus: true,
      customSettings: { language: "en", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-08-23"),
      createdAt: new Date("2025-08-23")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440010",
      condoCode: "YEKONDO-010",
      condoName: "Ye Kondominium Residence 10",
      address: "Block 10, Main Condominium Road",
      city: "Debre Birhan",
      gpsCoordinates: { latitude: 9.08, longitude: 38.85 },
      maxAdmins: 3,
      blockNumbers: ["B-10-01"],
      activeStatus: false,
      customSettings: { language: "am", notificationEnabled: true, paymentGateway: "hx" },
      registrationDate: new Date("2025-08-28"),
      createdAt: new Date("2025-08-28")
    }
  ],

  blocks: [
    { id: "550e8400-e29b-41d4-a716-446655440011", condoId: "550e8400-e29b-41d4-a716-446655440001", blockNo: "B-1-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440012", condoId: "550e8400-e29b-41d4-a716-446655440002", blockNo: "B-2-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440013", condoId: "550e8400-e29b-41d4-a716-446655440003", blockNo: "B-3-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440014", condoId: "550e8400-e29b-41d4-a716-446655440004", blockNo: "B-4-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440015", condoId: "550e8400-e29b-41d4-a716-446655440005", blockNo: "B-5-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440016", condoId: "550e8400-e29b-41d4-a716-446655440006", blockNo: "B-6-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440017", condoId: "550e8400-e29b-41d4-a716-446655440007", blockNo: "B-7-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440018", condoId: "550e8400-e29b-41d4-a716-446655440008", blockNo: "B-8-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440019", condoId: "550e8400-e29b-41d4-a716-446655440009", blockNo: "B-9-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 },
    { id: "550e8400-e29b-41d4-a716-446655440020", condoId: "550e8400-e29b-41d4-a716-446655440010", blockNo: "B-10-01", noRooms: 5, noFloors: 3, availableRooms: 2, occupiedRooms: 3 }
  ],

  rooms: [
    { id: "550e8400-e29b-41d4-a716-446655440021", condoId: "550e8400-e29b-41d4-a716-446655440001", blockId: "550e8400-e29b-41d4-a716-446655440011", roomNo: "101", floorNo: 1, price: 3000.00, model: "studio", status: "occupied", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440022", condoId: "550e8400-e29b-41d4-a716-446655440001", blockId: "550e8400-e29b-41d4-a716-446655440011", roomNo: "102", floorNo: 1, price: 3500.00, model: "one_bedroom", status: "occupied", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440023", condoId: "550e8400-e29b-41d4-a716-446655440001", blockId: "550e8400-e29b-41d4-a716-446655440011", roomNo: "103", floorNo: 2, price: 4000.00, model: "two_bedroom", status: "occupied", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440024", condoId: "550e8400-e29b-41d4-a716-446655440001", blockId: "550e8400-e29b-41d4-a716-446655440011", roomNo: "104", floorNo: 2, price: 3000.00, model: "studio", status: "free", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440025", condoId: "550e8400-e29b-41d4-a716-446655440001", blockId: "550e8400-e29b-41d4-a716-446655440011", roomNo: "105", floorNo: 3, price: 5000.00, model: "three_bedroom", status: "reserved", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440026", condoId: "550e8400-e29b-41d4-a716-446655440002", blockId: "550e8400-e29b-41d4-a716-446655440012", roomNo: "201", floorNo: 1, price: 3100.00, model: "studio", status: "occupied", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440027", condoId: "550e8400-e29b-41d4-a716-446655440002", blockId: "550e8400-e29b-41d4-a716-446655440012", roomNo: "202", floorNo: 1, price: 3600.00, model: "one_bedroom", status: "occupied", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440028", condoId: "550e8400-e29b-41d4-a716-446655440002", blockId: "550e8400-e29b-41d4-a716-446655440012", roomNo: "203", floorNo: 2, price: 4100.00, model: "two_bedroom", status: "occupied", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440029", condoId: "550e8400-e29b-41d4-a716-446655440002", blockId: "550e8400-e29b-41d4-a716-446655440012", roomNo: "204", floorNo: 2, price: 3100.00, model: "studio", status: "free", occupiedById: null },
    { id: "550e8400-e29b-41d4-a716-446655440030", condoId: "550e8400-e29b-41d4-a716-446655440002", blockId: "550e8400-e29b-41d4-a716-446655440012", roomNo: "205", floorNo: 3, price: 5100.00, model: "three_bedroom", status: "reserved", occupiedById: null }
  ],

  users: [
    {
      id: "550e8400-e29b-41d4-a716-446655440031",
      fullName: "System Super Administrator",
      email: "superadmin@yekondominium.com",
      phoneNumber: "+251911111111",
      password: null,
      role: "super_admin",
      condoId: null,
      condoCode: null,
      block: null,
      roomNo: null,
      isVerified: true,
      profilePhoto: "https://example.com/profile/1.jpg",
      fan: "1000000000000001",
      revenue: 0.00,
      frontId: "https://example.com/id/front-1.jpg",
      backId: "https://example.com/id/back-1.jpg",
      isInIddir: true,
      isInEqub: true,
      isGetEqub: false,
      registerDate: new Date("2025-07-14"),
      dueDate: new Date("2026-01-28"),
      createdAt: new Date("2025-07-14")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440032",
      fullName: "Resident User 2",
      email: "user002@yekondominium.com",
      phoneNumber: "+251912222222",
      password: null,
      role: "condo_admin",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      condoCode: "YEKONDO-001",
      block: "B-1-01",
      roomNo: "101",
      isVerified: true,
      profilePhoto: "https://example.com/profile/2.jpg",
      fan: "1000000000000002",
      revenue: 0.00,
      frontId: "https://example.com/id/front-2.jpg",
      backId: "https://example.com/id/back-2.jpg",
      isInIddir: true,
      isInEqub: true,
      isGetEqub: false,
      registerDate: new Date("2025-07-19"),
      dueDate: new Date("2026-02-12"),
      createdAt: new Date("2025-07-19")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440033",
      fullName: "Resident User 3",
      email: "user003@yekondominium.com",
      phoneNumber: "+251913333333",
      password: null,
      role: "guard",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      condoCode: "YEKONDO-001",
      block: "B-1-01",
      roomNo: "102",
      isVerified: true,
      profilePhoto: "https://example.com/profile/3.jpg",
      fan: "1000000000000003",
      revenue: 0.00,
      frontId: "https://example.com/id/front-3.jpg",
      backId: "https://example.com/id/back-3.jpg",
      isInIddir: true,
      isInEqub: false,
      isGetEqub: false,
      registerDate: new Date("2025-07-24"),
      dueDate: new Date("2026-02-27"),
      createdAt: new Date("2025-07-24")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440034",
      fullName: "Resident User 4",
      email: "user004@yekondominium.com",
      phoneNumber: "+251914444444",
      password: null,
      role: "resident",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      condoCode: "YEKONDO-001",
      block: "B-1-01",
      roomNo: "103",
      isVerified: true,
      profilePhoto: "https://example.com/profile/4.jpg",
      fan: "1000000000000004",
      revenue: 80.00,
      frontId: "https://example.com/id/front-4.jpg",
      backId: "https://example.com/id/back-4.jpg",
      isInIddir: true,
      isInEqub: true,
      isGetEqub: false,
      registerDate: new Date("2025-07-29"),
      dueDate: new Date("2026-03-14"),
      createdAt: new Date("2025-07-29")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440035",
      fullName: "Resident User 5",
      email: "user005@yekondominium.com",
      phoneNumber: "+251915555555",
      password: null,
      role: "resident",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      condoCode: "YEKONDO-001",
      block: "B-1-01",
      roomNo: "105",
      isVerified: false,
      profilePhoto: "https://example.com/profile/5.jpg",
      fan: "1000000000000005",
      revenue: 0.00,
      frontId: "https://example.com/id/front-5.jpg",
      backId: "https://example.com/id/back-5.jpg",
      isInIddir: false,
      isInEqub: false,
      isGetEqub: true,
      registerDate: new Date("2025-08-03"),
      dueDate: new Date("2026-03-29"),
      createdAt: new Date("2025-08-03")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440036",
      fullName: "Resident User 6",
      email: "user006@yekondominium.com",
      phoneNumber: "+251916666666",
      password: null,
      role: "condo_admin",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      condoCode: "YEKONDO-002",
      block: "B-2-01",
      roomNo: "201",
      isVerified: true,
      profilePhoto: "https://example.com/profile/6.jpg",
      fan: "1000000000000006",
      revenue: 0.00,
      frontId: "https://example.com/id/front-6.jpg",
      backId: "https://example.com/id/back-6.jpg",
      isInIddir: true,
      isInEqub: true,
      isGetEqub: false,
      registerDate: new Date("2025-08-08"),
      dueDate: new Date("2026-04-13"),
      createdAt: new Date("2025-08-08")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440037",
      fullName: "Resident User 7",
      email: "user007@yekondominium.com",
      phoneNumber: "+251917777777",
      password: null,
      role: "guard",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      condoCode: "YEKONDO-002",
      block: "B-2-01",
      roomNo: "202",
      isVerified: true,
      profilePhoto: "https://example.com/profile/7.jpg",
      fan: "1000000000000007",
      revenue: 0.00,
      frontId: "https://example.com/id/front-7.jpg",
      backId: "https://example.com/id/back-7.jpg",
      isInIddir: true,
      isInEqub: false,
      isGetEqub: false,
      registerDate: new Date("2025-08-13"),
      dueDate: new Date("2026-04-28"),
      createdAt: new Date("2025-08-13")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440038",
      fullName: "Resident User 8",
      email: "user008@yekondominium.com",
      phoneNumber: "+251918888888",
      password: null,
      role: "resident",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      condoCode: "YEKONDO-002",
      block: "B-2-01",
      roomNo: "203",
      isVerified: true,
      profilePhoto: "https://example.com/profile/8.jpg",
      fan: "1000000000000008",
      revenue: 160.00,
      frontId: "https://example.com/id/front-8.jpg",
      backId: "https://example.com/id/back-8.jpg",
      isInIddir: true,
      isInEqub: true,
      isGetEqub: false,
      registerDate: new Date("2025-08-18"),
      dueDate: new Date("2026-05-13"),
      createdAt: new Date("2025-08-18")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440039",
      fullName: "Resident User 9",
      email: "user009@yekondominium.com",
      phoneNumber: "+251919999999",
      password: null,
      role: "resident",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      condoCode: "YEKONDO-002",
      block: "B-2-01",
      roomNo: "205",
      isVerified: false,
      profilePhoto: "https://example.com/profile/9.jpg",
      fan: "1000000000000009",
      revenue: 0.00,
      frontId: "https://example.com/id/front-9.jpg",
      backId: "https://example.com/id/back-9.jpg",
      isInIddir: false,
      isInEqub: false,
      isGetEqub: true,
      registerDate: new Date("2025-08-23"),
      dueDate: new Date("2026-05-28"),
      createdAt: new Date("2025-08-23")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440040",
      fullName: "Resident User 10",
      email: "user010@yekondominium.com",
      phoneNumber: "+251910000000",
      password: null,
      role: "resident",
      condoId: "550e8400-e29b-41d4-a716-446655440003",
      condoCode: "YEKONDO-003",
      block: "B-3-01",
      roomNo: "301",
      isVerified: true,
      profilePhoto: "https://example.com/profile/10.jpg",
      fan: "1000000000000010",
      revenue: 0.00,
      frontId: "https://example.com/id/front-10.jpg",
      backId: "https://example.com/id/back-10.jpg",
      isInIddir: true,
      isInEqub: true,
      isGetEqub: false,
      registerDate: new Date("2025-08-28"),
      dueDate: new Date("2026-06-12"),
      createdAt: new Date("2025-08-28")
    }
  ],

  userAccounts: [
    {
      id: "550e8400-e29b-41d4-a716-446655440041",
      userId: "550e8400-e29b-41d4-a716-446655440031",
      accountType: "wallet",
      paymentMethod: "others",
      accountName: "System Super Administrator Account",
      accountNumber: "USER-ACC-0001",
      providerName: "Ye Kondominium Wallet",
      balance: 625.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440042",
      userId: "550e8400-e29b-41d4-a716-446655440032",
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: "Resident User 2 Account",
      accountNumber: "USER-ACC-0002",
      providerName: "Commercial Bank of Ethiopia",
      balance: 750.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440043",
      userId: "550e8400-e29b-41d4-a716-446655440033",
      accountType: "mobile_money",
      paymentMethod: "telebirr",
      accountName: "Resident User 3 Account",
      accountNumber: "USER-ACC-0003",
      providerName: "Telebirr",
      balance: 875.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440044",
      userId: "550e8400-e29b-41d4-a716-446655440034",
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: "Resident User 4 Account",
      accountNumber: "USER-ACC-0004",
      providerName: "Commercial Bank of Ethiopia",
      balance: 1000.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440045",
      userId: "550e8400-e29b-41d4-a716-446655440035",
      accountType: "mobile_money",
      paymentMethod: "telebirr",
      accountName: "Resident User 5 Account",
      accountNumber: "USER-ACC-0005",
      providerName: "Telebirr",
      balance: 1125.00,
      status: "blocked",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440046",
      userId: "550e8400-e29b-41d4-a716-446655440036",
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: "Resident User 6 Account",
      accountNumber: "USER-ACC-0006",
      providerName: "Commercial Bank of Ethiopia",
      balance: 1250.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440047",
      userId: "550e8400-e29b-41d4-a716-446655440037",
      accountType: "mobile_money",
      paymentMethod: "telebirr",
      accountName: "Resident User 7 Account",
      accountNumber: "USER-ACC-0007",
      providerName: "Telebirr",
      balance: 1375.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440048",
      userId: "550e8400-e29b-41d4-a716-446655440038",
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: "Resident User 8 Account",
      accountNumber: "USER-ACC-0008",
      providerName: "Commercial Bank of Ethiopia",
      balance: 1500.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440049",
      userId: "550e8400-e29b-41d4-a716-446655440039",
      accountType: "mobile_money",
      paymentMethod: "telebirr",
      accountName: "Resident User 9 Account",
      accountNumber: "USER-ACC-0009",
      providerName: "Telebirr",
      balance: 1625.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440050",
      userId: "550e8400-e29b-41d4-a716-446655440040",
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: "Resident User 10 Account",
      accountNumber: "USER-ACC-0010",
      providerName: "Commercial Bank of Ethiopia",
      balance: 1750.00,
      status: "blocked",
      isDefault: true
    }
  ],

  condoAccounts: [
    {
      id: "550e8400-e29b-41d4-a716-446655440051",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: "Ye Kondominium Residence 1 Bank Account",
      accountNumber: "CONDO-ACC-0001",
      providerName: "Commercial Bank of Ethiopia",
      balance: 11000.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440052",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      accountType: "mobile_money",
      paymentMethod: "telebirr",
      accountName: "Ye Kondominium Residence 1 Telebirr Account",
      accountNumber: "CONDO-ACC-0002",
      providerName: "Telebirr",
      balance: 12000.00,
      status: "active",
      isDefault: false
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440053",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: "Ye Kondominium Residence 2 Bank Account",
      accountNumber: "CONDO-ACC-0003",
      providerName: "Commercial Bank of Ethiopia",
      balance: 11500.00,
      status: "active",
      isDefault: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440054",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      accountType: "mobile_money",
      paymentMethod: "telebirr",
      accountName: "Ye Kondominium Residence 2 Telebirr Account",
      accountNumber: "CONDO-ACC-0004",
      providerName: "Telebirr",
      balance: 12500.00,
      status: "inactive",
      isDefault: false
    }
  ],

  hxAccount: {
    id: "550e8400-e29b-41d4-a716-446655440055",
    accountName: "Ye Kondominium HX System Account",
    accountNumber: "HX-SYSTEM-000001",
    balance: 50000.00,
    serviceFeePercentage: 0.34,
    isActive: true
  },

  equbs: [
    {
      id: "550e8400-e29b-41d4-a716-446655440056",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      createdById: "550e8400-e29b-41d4-a716-446655440032",
      name: "Ye Kondominium Residence 1 Equb 1",
      noMembers: 4,
      status: "pending",
      startDate: new Date("2025-10-14"),
      dueDate: new Date("2026-01-12"),
      contributionAmount: 600.00
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440057",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      createdById: "550e8400-e29b-41d4-a716-446655440036",
      name: "Ye Kondominium Residence 2 Equb 1",
      noMembers: 4,
      status: "active",
      startDate: new Date("2025-10-12"),
      dueDate: new Date("2026-01-10"),
      contributionAmount: 700.00
    }
  ],

  equbMembers: [
    {
      id: "550e8400-e29b-41d4-a716-446655440058",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      equbId: "550e8400-e29b-41d4-a716-446655440056",
      userId: "550e8400-e29b-41d4-a716-446655440032",
      status: "active",
      joinedAt: new Date("2025-10-14"),
      totalPaid: 600.00,
      hasReceivedPayout: false,
      payoutCount: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440059",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      equbId: "550e8400-e29b-41d4-a716-446655440056",
      userId: "550e8400-e29b-41d4-a716-446655440033",
      status: "active",
      joinedAt: new Date("2025-10-19"),
      totalPaid: 1200.00,
      hasReceivedPayout: false,
      payoutCount: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440060",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      equbId: "550e8400-e29b-41d4-a716-446655440056",
      userId: "550e8400-e29b-41d4-a716-446655440034",
      status: "suspended",
      joinedAt: new Date("2025-10-24"),
      totalPaid: 1800.00,
      hasReceivedPayout: false,
      payoutCount: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440061",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      equbId: "550e8400-e29b-41d4-a716-446655440056",
      userId: "550e8400-e29b-41d4-a716-446655440035",
      status: "winner",
      joinedAt: new Date("2025-10-29"),
      totalPaid: 2400.00,
      hasReceivedPayout: true,
      payoutCount: 1
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440062",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      equbId: "550e8400-e29b-41d4-a716-446655440057",
      userId: "550e8400-e29b-41d4-a716-446655440036",
      status: "active",
      joinedAt: new Date("2025-10-12"),
      totalPaid: 700.00,
      hasReceivedPayout: false,
      payoutCount: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440063",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      equbId: "550e8400-e29b-41d4-a716-446655440057",
      userId: "550e8400-e29b-41d4-a716-446655440037",
      status: "active",
      joinedAt: new Date("2025-10-17"),
      totalPaid: 1400.00,
      hasReceivedPayout: false,
      payoutCount: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440064",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      equbId: "550e8400-e29b-41d4-a716-446655440057",
      userId: "550e8400-e29b-41d4-a716-446655440038",
      status: "suspended",
      joinedAt: new Date("2025-10-22"),
      totalPaid: 2100.00,
      hasReceivedPayout: false,
      payoutCount: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440065",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      equbId: "550e8400-e29b-41d4-a716-446655440057",
      userId: "550e8400-e29b-41d4-a716-446655440039",
      status: "winner",
      joinedAt: new Date("2025-10-27"),
      totalPaid: 2800.00,
      hasReceivedPayout: true,
      payoutCount: 1
    }
  ],

  iddirs: [
    {
      id: "550e8400-e29b-41d4-a716-446655440066",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      createdById: "550e8400-e29b-41d4-a716-446655440032",
      name: "Ye Kondominium Residence 1 Iddir 1",
      noMembers: 4,
      status: "active",
      startedDate: new Date("2025-08-14"),
      contributionAmount: 250.00
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440067",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      createdById: "550e8400-e29b-41d4-a716-446655440036",
      name: "Ye Kondominium Residence 2 Iddir 1",
      noMembers: 4,
      status: "inactive",
      startedDate: new Date("2025-08-11"),
      contributionAmount: 300.00
    }
  ],

  iddirMembers: [
    {
      id: "550e8400-e29b-41d4-a716-446655440068",
      iddirId: "550e8400-e29b-41d4-a716-446655440066",
      userId: "550e8400-e29b-41d4-a716-446655440032",
      status: "active",
      joinedAt: new Date("2025-08-14"),
      totalPaid: 250.00,
      totalReceived: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440069",
      iddirId: "550e8400-e29b-41d4-a716-446655440066",
      userId: "550e8400-e29b-41d4-a716-446655440033",
      status: "active",
      joinedAt: new Date("2025-08-18"),
      totalPaid: 500.00,
      totalReceived: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440070",
      iddirId: "550e8400-e29b-41d4-a716-446655440066",
      userId: "550e8400-e29b-41d4-a716-446655440034",
      status: "active",
      joinedAt: new Date("2025-08-22"),
      totalPaid: 750.00,
      totalReceived: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440071",
      iddirId: "550e8400-e29b-41d4-a716-446655440066",
      userId: "550e8400-e29b-41d4-a716-446655440035",
      status: "suspended",
      joinedAt: new Date("2025-08-26"),
      totalPaid: 1000.00,
      totalReceived: 1500.00
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440072",
      iddirId: "550e8400-e29b-41d4-a716-446655440067",
      userId: "550e8400-e29b-41d4-a716-446655440036",
      status: "active",
      joinedAt: new Date("2025-08-11"),
      totalPaid: 300.00,
      totalReceived: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440073",
      iddirId: "550e8400-e29b-41d4-a716-446655440067",
      userId: "550e8400-e29b-41d4-a716-446655440037",
      status: "active",
      joinedAt: new Date("2025-08-15"),
      totalPaid: 600.00,
      totalReceived: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440074",
      iddirId: "550e8400-e29b-41d4-a716-446655440067",
      userId: "550e8400-e29b-41d4-a716-446655440038",
      status: "active",
      joinedAt: new Date("2025-08-19"),
      totalPaid: 900.00,
      totalReceived: 0
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440075",
      iddirId: "550e8400-e29b-41d4-a716-446655440067",
      userId: "550e8400-e29b-41d4-a716-446655440039",
      status: "suspended",
      joinedAt: new Date("2025-08-23"),
      totalPaid: 1200.00,
      totalReceived: 1500.00
    }
  ],

  transactions: [
    {
      id: "550e8400-e29b-41d4-a716-446655440076",
      senderId: "550e8400-e29b-41d4-a716-446655440033",
      senderAccountId: "550e8400-e29b-41d4-a716-446655440043",
      senderCondoAccountId: "550e8400-e29b-41d4-a716-446655440051",
      senderAccNo: "USER-ACC-0003",
      senderName: "Resident User 3",
      receiverId: "550e8400-e29b-41d4-a716-446655440034",
      receiverAccountId: "550e8400-e29b-41d4-a716-446655440044",
      receiverCondoAccountId: "550e8400-e29b-41d4-a716-446655440052",
      receiverAccNo: "USER-ACC-0004",
      receiverName: "Resident User 4",
      hxAccountId: "550e8400-e29b-41d4-a716-446655440055",
      referenceNo: "HX-TXN-000001",
      stamp: "HX-STAMP-1734567890-001",
      paymentType: "equb",
      amount: 750.00,
      monthYear: "2026-01",
      paymentMethod: "cbe",
      gateway: "hx",
      status: "completed",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      createdAt: new Date("2026-01-02")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440077",
      senderId: "550e8400-e29b-41d4-a716-446655440034",
      senderAccountId: "550e8400-e29b-41d4-a716-446655440044",
      senderCondoAccountId: "550e8400-e29b-41d4-a716-446655440052",
      senderAccNo: "USER-ACC-0004",
      senderName: "Resident User 4",
      receiverId: "550e8400-e29b-41d4-a716-446655440033",
      receiverAccountId: "550e8400-e29b-41d4-a716-446655440043",
      receiverCondoAccountId: "550e8400-e29b-41d4-a716-446655440051",
      receiverAccNo: "USER-ACC-0003",
      receiverName: "Resident User 3",
      hxAccountId: "550e8400-e29b-41d4-a716-446655440055",
      referenceNo: "HX-TXN-000002",
      stamp: "HX-STAMP-1734567891-002",
      paymentType: "iddir",
      amount: 1000.00,
      monthYear: "2026-02",
      paymentMethod: "telebirr",
      gateway: "hx",
      status: "pending",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      createdAt: new Date("2026-01-04")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440078",
      senderId: "550e8400-e29b-41d4-a716-446655440037",
      senderAccountId: "550e8400-e29b-41d4-a716-446655440047",
      senderCondoAccountId: "550e8400-e29b-41d4-a716-446655440053",
      senderAccNo: "USER-ACC-0007",
      senderName: "Resident User 7",
      receiverId: "550e8400-e29b-41d4-a716-446655440038",
      receiverAccountId: "550e8400-e29b-41d4-a716-446655440048",
      receiverCondoAccountId: "550e8400-e29b-41d4-a716-446655440054",
      receiverAccNo: "USER-ACC-0008",
      receiverName: "Resident User 8",
      hxAccountId: "550e8400-e29b-41d4-a716-446655440055",
      referenceNo: "HX-TXN-000003",
      stamp: "HX-STAMP-1734567892-003",
      paymentType: "equb",
      amount: 1200.00,
      monthYear: "2026-03",
      paymentMethod: "cbe",
      gateway: "hx",
      status: "failed",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      createdAt: new Date("2026-01-06")
    }
  ],

  payments: [
    {
      id: "550e8400-e29b-41d4-a716-446655440079",
      userId: "550e8400-e29b-41d4-a716-446655440033",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      equbId: "550e8400-e29b-41d4-a716-446655440056",
      iddirId: null,
      paymentType: "equb",
      amount: 750.00,
      serviceFee: 2.55,
      totalAmount: 752.55,
      monthYear: "2026-01",
      paymentMethod: "cbe",
      status: "approved",
      transactionId: "550e8400-e29b-41d4-a716-446655440076",
      receiptUrl: "https://example.com/receipts/HX-TXN-000001.pdf",
      paymentDate: new Date("2026-01-02"),
      approvalDate: new Date("2026-01-02"),
      approvedById: "550e8400-e29b-41d4-a716-446655440032",
      adminNotes: "Payment approved successfully",
      createdAt: new Date("2026-01-02")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440080",
      userId: "550e8400-e29b-41d4-a716-446655440034",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      equbId: null,
      iddirId: "550e8400-e29b-41d4-a716-446655440066",
      paymentType: "iddir",
      amount: 1000.00,
      serviceFee: 3.40,
      totalAmount: 1003.40,
      monthYear: "2026-02",
      paymentMethod: "telebirr",
      status: "pending",
      transactionId: "550e8400-e29b-41d4-a716-446655440077",
      receiptUrl: null,
      paymentDate: new Date("2026-01-04"),
      approvalDate: null,
      approvedById: null,
      adminNotes: "Payment awaiting approval",
      createdAt: new Date("2026-01-04")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440081",
      userId: "550e8400-e29b-41d4-a716-446655440037",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      equbId: "550e8400-e29b-41d4-a716-446655440057",
      iddirId: null,
      paymentType: "equb",
      amount: 1200.00,
      serviceFee: 4.08,
      totalAmount: 1204.08,
      monthYear: "2026-03",
      paymentMethod: "cbe",
      status: "rejected",
      transactionId: "550e8400-e29b-41d4-a716-446655440078",
      receiptUrl: null,
      paymentDate: new Date("2026-01-06"),
      approvalDate: new Date("2026-01-07"),
      approvedById: "550e8400-e29b-41d4-a716-446655440036",
      adminNotes: "Payment rejected for testing",
      createdAt: new Date("2026-01-06")
    }
  ],

  serviceFees: [
    {
      id: "550e8400-e29b-41d4-a716-446655440082",
      transactionId: "550e8400-e29b-41d4-a716-446655440076",
      userId: "550e8400-e29b-41d4-a716-446655440033",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      hxAccountId: "550e8400-e29b-41d4-a716-446655440055",
      percentage: 0.34,
      baseAmount: 750.00,
      feeAmount: 2.55,
      status: "collected",
      collectedAt: new Date("2026-01-02")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440083",
      transactionId: "550e8400-e29b-41d4-a716-446655440077",
      userId: "550e8400-e29b-41d4-a716-446655440034",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      hxAccountId: "550e8400-e29b-41d4-a716-446655440055",
      percentage: 0.34,
      baseAmount: 1000.00,
      feeAmount: 3.40,
      status: "pending",
      collectedAt: null
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440084",
      transactionId: "550e8400-e29b-41d4-a716-446655440078",
      userId: "550e8400-e29b-41d4-a716-446655440037",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      hxAccountId: "550e8400-e29b-41d4-a716-446655440055",
      percentage: 0.34,
      baseAmount: 1200.00,
      feeAmount: 4.08,
      status: "refunded",
      collectedAt: null
    }
  ],

  equbPayouts: [
    {
      id: "550e8400-e29b-41d4-a716-446655440085",
      equbId: "550e8400-e29b-41d4-a716-446655440056",
      winnerId: "550e8400-e29b-41d4-a716-446655440035",
      createdById: "550e8400-e29b-41d4-a716-446655440032",
      amount: 2500.00,
      roundNumber: 1,
      selectionReference: "EQB-PAYOUT-000001",
      status: "paid",
      selectedAt: new Date("2025-12-29"),
      paidAt: new Date("2025-12-30"),
      transactionId: "550e8400-e29b-41d4-a716-446655440076"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440086",
      equbId: "550e8400-e29b-41d4-a716-446655440057",
      winnerId: "550e8400-e29b-41d4-a716-446655440039",
      createdById: "550e8400-e29b-41d4-a716-446655440036",
      amount: 2800.00,
      roundNumber: 1,
      selectionReference: "EQB-PAYOUT-000002",
      status: "selected",
      selectedAt: new Date("2025-12-27"),
      paidAt: null,
      transactionId: null
    }
  ],

  announcements: [
    {
      id: "550e8400-e29b-41d4-a716-446655440087",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Announcement 1 - Ye Kondominium Residence 1",
      body: "This is announcement number 1 for Ye Kondominium Residence 1. Please review the condominium information and follow the management instructions.",
      announcementType: "general",
      expiryDate: new Date("2026-02-12"),
      isPinned: true,
      createdById: "550e8400-e29b-41d4-a716-446655440032",
      createdByRole: "admin",
      imageUrl: "https://example.com/announcements/1.jpg",
      isPublic: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440088",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      title: "Announcement 1 - Ye Kondominium Residence 2",
      body: "This is announcement number 1 for Ye Kondominium Residence 2. Please review the condominium information and follow the management instructions.",
      announcementType: "emergency",
      expiryDate: null,
      isPinned: false,
      createdById: "550e8400-e29b-41d4-a716-446655440036",
      createdByRole: "admin",
      imageUrl: null,
      isPublic: true
    }
  ],

  reports: [
    {
      id: "550e8400-e29b-41d4-a716-446655440089",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      title: "Maintenance Report 1",
      description: "This is a sample condominium maintenance report for Ye Kondominium Residence 1. Issue number 1 requires attention from the management team.",
      category: "plumbing",
      photoUrl: "https://example.com/reports/1.jpg",
      status: "resolved",
      reporterId: "550e8400-e29b-41d4-a716-446655440033",
      reporterRole: "resident",
      priority: "high",
      assignedToId: "550e8400-e29b-41d4-a716-446655440032",
      resolvedAt: new Date("2026-01-02"),
      resolutionNotes: "Issue reviewed and resolved by condominium management."
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440090",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      title: "Maintenance Report 2",
      description: "This is a sample condominium maintenance report for Ye Kondominium Residence 2. Issue number 2 requires attention from the management team.",
      category: "electrical",
      photoUrl: null,
      status: "reported",
      reporterId: "550e8400-e29b-41d4-a716-446655440037",
      reporterRole: "resident",
      priority: "emergency",
      assignedToId: null,
      resolvedAt: null,
      resolutionNotes: null
    }
  ],

  reportResponses: [
    {
      id: "550e8400-e29b-41d4-a716-446655440091",
      reportId: "550e8400-e29b-41d4-a716-446655440089",
      userId: "550e8400-e29b-41d4-a716-446655440032",
      message: "Management response 1: We have reviewed this report and will take the appropriate action.",
      isAdminResponse: true
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440092",
      reportId: "550e8400-e29b-41d4-a716-446655440090",
      userId: "550e8400-e29b-41d4-a716-446655440036",
      message: "Management response 2: We have reviewed this report and will take the appropriate action.",
      isAdminResponse: true
    }
  ],

  lostFoundRecords: [
    {
      id: "550e8400-e29b-41d4-a716-446655440093",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      type: "lost",
      userId: "550e8400-e29b-41d4-a716-446655440033",
      itemName: "Mobile Phone 1",
      description: "Lost and found record 1 for Ye Kondominium Residence 1. This item was reported by a condominium resident.",
      category: "electronics",
      photoUrl: "https://example.com/lost-found/1.jpg",
      location: "Block 1, Common Area",
      dateLostFound: new Date("2026-01-02"),
      status: "claimed",
      claimedById: "550e8400-e29b-41d4-a716-446655440034",
      claimVerified: true,
      verifiedById: "550e8400-e29b-41d4-a716-446655440032"
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440094",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      type: "found",
      userId: "550e8400-e29b-41d4-a716-446655440037",
      itemName: "Wallet 2",
      description: "Lost and found record 2 for Ye Kondominium Residence 2. This item was reported by a condominium resident.",
      category: "documents",
      photoUrl: null,
      location: "Block 2, Common Area",
      dateLostFound: new Date("2026-01-04"),
      status: "open",
      claimedById: null,
      claimVerified: false,
      verifiedById: null
    }
  ],

  chatMessages: [
    {
      id: "550e8400-e29b-41d4-a716-446655440095",
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      senderId: "550e8400-e29b-41d4-a716-446655440033",
      receiverId: "550e8400-e29b-41d4-a716-446655440032",
      type: "message",
      content: "Hello, this is test chat message 1 between condominium users.",
      isRead: true,
      readAt: new Date("2026-01-02")
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440096",
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      senderId: "550e8400-e29b-41d4-a716-446655440037",
      receiverId: "550e8400-e29b-41d4-a716-446655440036",
      type: "photo",
      content: "Hello, this is test chat message 2 between condominium users.",
      isRead: false,
      readAt: null
    }
  ],

  promotions: [
    {
      id: "550e8400-e29b-41d4-a716-446655440097",
      title: "Promotion 1",
      description: "Special promotional offer 1 available for residents of Ye Kondominium Residence 1.",
      type: "shop",
      category: "electronics",
      price: 1250.00,
      currency: "ETB",
      status: "active",
      isActive: true,
      reviewedById: "550e8400-e29b-41d4-a716-446655440032",
      reviewedAt: new Date("2026-01-02"),
      rejectionReason: null,
      businessName: "Business 1",
      contactPerson: "Contact Person 1",
      contactNumber: "+251911000000",
      email: "business1@example.com",
      websiteUrl: "https://business1.example.com",
      imageUrl: "https://example.com/promotions/main-1.jpg",
      additionalImages: [
        "https://example.com/promotions/1-1.jpg",
        "https://example.com/promotions/1-2.jpg"
      ],
      expiresAt: new Date("2026-02-02"),
      publishedAt: new Date("2026-01-02"),
      condoId: "550e8400-e29b-41d4-a716-446655440001",
      postedById: "550e8400-e29b-41d4-a716-446655440033",
      postedByRole: "resident",
      views: 25,
      clicks: 5
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440098",
      title: "Promotion 2",
      description: "Special promotional offer 2 available for residents of Ye Kondominium Residence 2.",
      type: "service",
      category: "services",
      price: 1500.00,
      currency: "ETB",
      status: "pending",
      isActive: false,
      reviewedById: null,
      reviewedAt: null,
      rejectionReason: null,
      businessName: "Business 2",
      contactPerson: "Contact Person 2",
      contactNumber: "+251912000000",
      email: "business2@example.com",
      websiteUrl: "https://business2.example.com",
      imageUrl: "https://example.com/promotions/main-2.jpg",
      additionalImages: [
        "https://example.com/promotions/2-1.jpg",
        "https://example.com/promotions/2-2.jpg"
      ],
      expiresAt: new Date("2026-02-04"),
      publishedAt: null,
      condoId: "550e8400-e29b-41d4-a716-446655440002",
      postedById: "550e8400-e29b-41d4-a716-446655440037",
      postedByRole: "resident",
      views: 50,
      clicks: 10
    }
  ]
};

async function main() {
  console.log("🌱 Starting database seeding with UUIDs...\n");

  const hashedPassword = await bcrypt.hash(PASSWORD, HASH_ROUNDS);

  // Update users with hashed password
  const usersWithPassword = seedData.users.map(user => ({
    ...user,
    password: hashedPassword
  }));

  console.log("🏢 Creating condos...");
  for (const condo of seedData.condos) {
    await prisma.condo.create({ data: condo });
  }
  console.log(`✅ Created ${seedData.condos.length} condos`);

  console.log("🏗️ Creating blocks...");
  for (const block of seedData.blocks) {
    await prisma.block.create({ data: block });
  }
  console.log(`✅ Created ${seedData.blocks.length} blocks`);

  console.log("🚪 Creating rooms...");
  for (const room of seedData.rooms) {
    await prisma.room.create({ data: room });
  }
  console.log(`✅ Created ${seedData.rooms.length} rooms`);

  console.log("👤 Creating users...");
  for (const user of usersWithPassword) {
    await prisma.user.create({ data: user });
  }
  console.log(`✅ Created ${usersWithPassword.length} users`);

  console.log("💳 Creating user accounts...");
  for (const account of seedData.userAccounts) {
    await prisma.userAccount.create({ data: account });
  }
  console.log(`✅ Created ${seedData.userAccounts.length} user accounts`);

  console.log("🏦 Creating condo accounts...");
  for (const account of seedData.condoAccounts) {
    await prisma.condoAccount.create({ data: account });
  }
  console.log(`✅ Created ${seedData.condoAccounts.length} condo accounts`);

  console.log("💰 Creating HX account...");
  await prisma.hXAccount.create({ data: seedData.hxAccount });
  console.log("✅ HX account created");

  console.log("🤝 Creating equbs...");
  for (const equb of seedData.equbs) {
    await prisma.equb.create({ data: equb });
  }
  console.log(`✅ Created ${seedData.equbs.length} equbs`);

  console.log("👥 Creating equb members...");
  for (const member of seedData.equbMembers) {
    await prisma.equbMember.create({ data: member });
  }
  console.log(`✅ Created ${seedData.equbMembers.length} equb members`);

  console.log("🤲 Creating iddirs...");
  for (const iddir of seedData.iddirs) {
    await prisma.iddir.create({ data: iddir });
  }
  console.log(`✅ Created ${seedData.iddirs.length} iddirs`);

  console.log("👥 Creating iddir members...");
  for (const member of seedData.iddirMembers) {
    await prisma.iddirMember.create({ data: member });
  }
  console.log(`✅ Created ${seedData.iddirMembers.length} iddir members`);

  console.log("💸 Creating transactions...");
  for (const transaction of seedData.transactions) {
    await prisma.transaction.create({ data: transaction });
  }
  console.log(`✅ Created ${seedData.transactions.length} transactions`);

  console.log("💳 Creating payments...");
  for (const payment of seedData.payments) {
    await prisma.payment.create({ data: payment });
  }
  console.log(`✅ Created ${seedData.payments.length} payments`);

  console.log("💰 Creating service fees...");
  for (const fee of seedData.serviceFees) {
    await prisma.serviceFee.create({ data: fee });
  }
  console.log(`✅ Created ${seedData.serviceFees.length} service fees`);

  console.log("🎁 Creating equb payouts...");
  for (const payout of seedData.equbPayouts) {
    await prisma.equbPayout.create({ data: payout });
  }
  console.log(`✅ Created ${seedData.equbPayouts.length} equb payouts`);

  console.log("📢 Creating announcements...");
  for (const announcement of seedData.announcements) {
    await prisma.announcement.create({ data: announcement });
  }
  console.log(`✅ Created ${seedData.announcements.length} announcements`);

  console.log("🛠️ Creating reports...");
  for (const report of seedData.reports) {
    await prisma.report.create({ data: report });
  }
  console.log(`✅ Created ${seedData.reports.length} reports`);

  console.log("💬 Creating report responses...");
  for (const response of seedData.reportResponses) {
    await prisma.reportResponse.create({ data: response });
  }
  console.log(`✅ Created ${seedData.reportResponses.length} report responses`);

  console.log("🔎 Creating lost & found records...");
  for (const record of seedData.lostFoundRecords) {
    await prisma.lostFound.create({ data: record });
  }
  console.log(`✅ Created ${seedData.lostFoundRecords.length} lost & found records`);

  console.log("💬 Creating chat messages...");
  for (const message of seedData.chatMessages) {
    await prisma.chatMessage.create({ data: message });
  }
  console.log(`✅ Created ${seedData.chatMessages.length} chat messages`);

  console.log("📣 Creating promotions...");
  for (const promotion of seedData.promotions) {
    await prisma.promotion.create({ data: promotion });
  }
  console.log(`✅ Created ${seedData.promotions.length} promotions`);

  console.log("\n========================================");
  console.log("🎉 DATABASE SEEDING COMPLETED");
  console.log("========================================");
  console.log(`
Condo             : ${seedData.condos.length}
Blocks            : ${seedData.blocks.length}
Rooms             : ${seedData.rooms.length}
Users             : ${usersWithPassword.length}
User Accounts     : ${seedData.userAccounts.length}
Condo Accounts    : ${seedData.condoAccounts.length}
HX Accounts       : 1
Equbs             : ${seedData.equbs.length}
Equb Members      : ${seedData.equbMembers.length}
Equb Payouts      : ${seedData.equbPayouts.length}
Iddirs            : ${seedData.iddirs.length}
Iddir Members     : ${seedData.iddirMembers.length}
Transactions      : ${seedData.transactions.length}
Payments          : ${seedData.payments.length}
Service Fees      : ${seedData.serviceFees.length}
Announcements     : ${seedData.announcements.length}
Reports           : ${seedData.reports.length}
Report Responses  : ${seedData.reportResponses.length}
Lost & Found      : ${seedData.lostFoundRecords.length}
Chat Messages     : ${seedData.chatMessages.length}
Promotions        : ${seedData.promotions.length}
`);
  console.log("========================================");
  console.log("🔐 TEST LOGIN");
  console.log("========================================");
  console.log(`
Super Admin
Email    : superadmin@yekondominium.com
Password : ${PASSWORD}

Condo Admin example
Email    : user002@yekondominium.com
Password : ${PASSWORD}

Guard example
Email    : user003@yekondominium.com
Password : ${PASSWORD}

Resident example
Email    : user004@yekondominium.com
Password : ${PASSWORD}
`);
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("\n❌ SEEDING FAILED\n");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });