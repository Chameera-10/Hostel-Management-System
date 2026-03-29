export enum UserRole {
    Admin = 'admin',
    Warden = 'warden',
    Student = 'student',
}

export type AccountStatus = 'pending' | 'approved' | 'disabled' | 'rejected';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    accountStatus: AccountStatus;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface StudentProfile extends User {
    studentId: string;
    faculty: string;
    year: number;
    roomNumber: string | null;
    phone: string;
    course: string;
    guardianContact: string;
    emergencyContact: string;
}

export interface WardenProfile extends User {
    wardenId: string;
    hostelManaged: string;
    phone: string;
    username: string;
}

export interface AdminProfile extends User {
    adminId: string;
}

export interface MaintenanceRequest {
    id: string;
    studentId: string;
    studentName: string;
    roomNumber: string;
    issue: string;
    description: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    submittedAt: Date;
}

export interface Payment {
    id: string;
    studentId: string;
    amount: number;
    date: Date;
    status: 'Paid' | 'Pending';
    academicYear: number;
    invoiceUrl?: string;
    slipUrl?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string;
    date: Date;
    audience: UserRole[] | 'all';
}

export interface Room {
    id: string;
    roomNumber: string;
    capacity: number;
    occupants: string[]; // array of student IDs
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    roomId: string | null; // null if it's general stock
}

export interface ClearanceStep {
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    remarks: string;
}

export interface ClearanceRequest {
    id: string;
    studentId: string;
    studentName: string;
    status: 'Not Started' | 'Pending' | 'Approved' | 'Rejected';
    steps: ClearanceStep[];
    appliedAt: Date | null;
}

export interface SystemSettings {
    appName: string;
    defaultHostelFee: number;
    enableEmailNotifications: boolean;
}

export interface HostelBlock {
    id: string;
    name: string;
}

export enum StaffRole {
    Plumber = 'Plumber',
    Electrician = 'Electrician',
    Carpenter = 'Carpenter',
    Cleaner = 'Cleaner / Janitor',
    Security = 'Security Guard',
    Kitchen = 'Cook / Kitchen Staff',
    Laundry = 'Laundry Staff',
    Gardener = 'Gardener',
    Maintenance = 'General Maintenance Worker',
}

export interface StaffMember {
    id: string;
    name: string;
    role: StaffRole;
    contact: string; // phone number or email
    wardenId: string;
}

export interface StaffTask {
    id: string;
    description: string;
    staffMemberId: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    assignedAt: Date;
    completedAt?: Date | null;
}