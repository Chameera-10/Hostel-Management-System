
import { User, UserRole, StudentProfile, WardenProfile, Announcement, Room, InventoryItem, ClearanceRequest, MaintenanceRequest, SystemSettings, HostelBlock, LoginResponse, Payment, StaffMember, StaffTask } from '../types.ts';

// In a production build, the API is expected to be served from the same origin under the /api path.
const API_URL = '/api';

// A helper function to handle API requests, including authentication
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('hostel-token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (options.headers) {
        // Safely merge headers
        const customHeaders = options.headers as Record<string, string>;
        for (const key in customHeaders) {
            headers[key] = customHeaders[key];
        }
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Try to parse error message from backend, otherwise use status text
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || response.statusText;
        throw new Error(errorMessage);
    }

    // Handle responses with no content
    if (response.status === 204) {
        return null;
    }
    
    return response.json();
};

// --- API Functions ---

// Auth
export const apiLogin = (email: string, pass: string): Promise<LoginResponse> => 
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) });

export const getSelfProfile = (): Promise<User> => apiFetch('/auth/me');

export const apiRegisterStudent = (data: Omit<StudentProfile, 'id' | 'role' | 'accountStatus' | 'roomNumber' | 'faculty' | 'year'>): Promise<StudentProfile> =>
    apiFetch('/auth/register/student', { method: 'POST', body: JSON.stringify(data) });

export const apiRegisterWarden = (data: Omit<WardenProfile, 'id' | 'role' | 'accountStatus' | 'hostelManaged'>): Promise<WardenProfile> =>
    apiFetch('/auth/register/warden', { method: 'POST', body: JSON.stringify(data) });

// User Management (Admin/Warden)
export const getAllUsers = (): Promise<User[]> => apiFetch('/users');
export const getPendingStudents = (): Promise<StudentProfile[]> => apiFetch('/users/pending?role=student');
export const getPendingWardens = (): Promise<WardenProfile[]> => apiFetch('/users/pending?role=warden');

const manageUser = (id: string, action: 'approve' | 'reject' | 'toggle-status'): Promise<User> =>
    apiFetch(`/users/${id}/${action}`, { method: 'PATCH' });

export const approveStudent = (id: string) => manageUser(id, 'approve');
export const rejectStudent = (id: string) => manageUser(id, 'reject');
export const toggleStudentStatus = (id: string) => manageUser(id, 'toggle-status');
export const approveWarden = (id: string) => manageUser(id, 'approve');
export const rejectWarden = (id: string) => manageUser(id, 'reject');
export const toggleWardenStatus = (id: string) => manageUser(id, 'toggle-status');

// Student Specific
export const getStudentProfile = (id: string): Promise<StudentProfile | null> => apiFetch(`/students/${id}/profile`);
export const updateStudentProfile = (id: string, profileData: Partial<StudentProfile>): Promise<StudentProfile> =>
    apiFetch(`/students/${id}/profile`, { method: 'PATCH', body: JSON.stringify(profileData) });

export const getStudentPayments = (studentId: string): Promise<Payment[]> => apiFetch(`/students/${studentId}/payments`);
export const getStudentMaintenanceRequests = (studentId: string): Promise<MaintenanceRequest[]> => apiFetch(`/students/${studentId}/maintenance`);
export const getStudentAnnouncements = (): Promise<Announcement[]> => apiFetch('/announcements/student');

export const submitMaintenanceRequest = (req: Omit<MaintenanceRequest, 'id' | 'submittedAt' | 'status' | 'studentName' | 'roomNumber' > & { studentId: string }): Promise<MaintenanceRequest> =>
    apiFetch('/maintenance', { method: 'POST', body: JSON.stringify(req) });
    
export const getStudentClearanceStatus = (studentId: string): Promise<ClearanceRequest | null> => apiFetch(`/students/${studentId}/clearance`);
export const applyForClearance = (studentId: string): Promise<ClearanceRequest> => apiFetch(`/students/${studentId}/clearance`, { method: 'POST' });

// Warden Specific
export const getWardenDashboardStats = (): Promise<any> => apiFetch('/wardens/dashboard/stats');
export const getWardenStudents = (): Promise<StudentProfile[]> => apiFetch('/wardens/students');
export const getUnassignedStudents = (): Promise<StudentProfile[]> => apiFetch('/students?unassigned=true');
export const getComplaints = (): Promise<MaintenanceRequest[]> => apiFetch('/maintenance');
export const updateComplaintStatus = (id: string, status: MaintenanceRequest['status']): Promise<MaintenanceRequest> =>
    apiFetch(`/maintenance/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const getWardenAnnouncements = (): Promise<Announcement[]> => apiFetch('/announcements/warden');
export const postWardenAnnouncement = (announcement: Omit<Announcement, 'id' | 'date' | 'author'>, authorName: string): Promise<Announcement> =>
    apiFetch('/announcements', { method: 'POST', body: JSON.stringify({ ...announcement, author: authorName }) });

// Room Management
export const getRooms = (): Promise<Room[]> => apiFetch('/rooms');
export const addRoom = (data: Omit<Room, 'id' | 'occupants'>): Promise<Room> => apiFetch('/rooms', { method: 'POST', body: JSON.stringify(data) });
export const updateRoom = (id: string, data: Partial<Room>): Promise<Room> => apiFetch(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteRoom = (id: string): Promise<{ success: boolean }> => apiFetch(`/rooms/${id}`, { method: 'DELETE' });
export const assignStudentToRoom = (studentId: string, roomId: string): Promise<{ success: true }> =>
    apiFetch(`/rooms/${roomId}/assign`, { method: 'POST', body: JSON.stringify({ studentId }) });
export const unassignStudentFromRoom = (studentId: string): Promise<{ success: true }> =>
    apiFetch(`/students/${studentId}/unassign`, { method: 'POST' });

// Inventory Management
export const getInventory = (): Promise<InventoryItem[]> => apiFetch('/inventory');
export const addInventoryItem = (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => apiFetch('/inventory', { method: 'POST', body: JSON.stringify(item) });
export const updateInventoryItem = (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => apiFetch(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteInventoryItem = (id: string): Promise<{ success: true }> => apiFetch(`/inventory/${id}`, { method: 'DELETE' });

// Clearance Management (Warden)
export const getClearanceRequests = (): Promise<ClearanceRequest[]> => apiFetch('/clearance');
export const updateRoomInspectionStatus = (clearanceId: string, inspectionStatus: 'approved' | 'rejected', remarks: string): Promise<ClearanceRequest> =>
    apiFetch(`/clearance/${clearanceId}/inspection`, { method: 'PATCH', body: JSON.stringify({ status: inspectionStatus, remarks }) });

// Staff Management (Warden)
export const getStaffMembers = (): Promise<StaffMember[]> => apiFetch('/warden/staff');
export const addStaffMember = (data: Omit<StaffMember, 'id' | 'wardenId'>): Promise<StaffMember> => apiFetch('/warden/staff', { method: 'POST', body: JSON.stringify(data) });
export const updateStaffMember = (id: string, data: Partial<Omit<StaffMember, 'id' | 'wardenId'>>): Promise<StaffMember> => apiFetch(`/warden/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteStaffMember = (id: string): Promise<{ success: true }> => apiFetch(`/warden/staff/${id}`, { method: 'DELETE' });

export const getStaffTasks = (): Promise<StaffTask[]> => apiFetch('/warden/tasks');
export const assignTask = (data: Omit<StaffTask, 'id' | 'assignedAt' | 'status' | 'completedAt'>): Promise<StaffTask> => apiFetch('/warden/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id: string, data: Partial<Omit<StaffTask, 'id' | 'assignedAt'>>): Promise<StaffTask> => apiFetch(`/warden/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTask = (id: string): Promise<{ success: true }> => apiFetch(`/warden/tasks/${id}`, { method: 'DELETE' });

// Admin Specific
export const getSystemStats = (): Promise<any> => apiFetch('/admin/dashboard/stats');
export const getSystemReportsData = (): Promise<any> => apiFetch('/admin/reports');
export const getAllAnnouncements = (): Promise<Announcement[]> => apiFetch('/announcements');

export const postGlobalAnnouncement = (announcement: Omit<Announcement, 'id' | 'date' | 'author'>, authorName: string): Promise<Announcement> =>
    apiFetch('/announcements', { method: 'POST', body: JSON.stringify({ ...announcement, author: authorName }) });

export const updateAnnouncement = (id: string, data: Partial<Pick<Announcement, 'title' | 'content' | 'audience'>>): Promise<Announcement> =>
    apiFetch(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    
export const deleteAnnouncement = (id: string): Promise<{ success: true }> => apiFetch(`/announcements/${id}`, { method: 'DELETE' });

// Settings
export const getSystemSettings = (): Promise<SystemSettings> => apiFetch('/settings');
export const updateSystemSettings = (settings: SystemSettings): Promise<SystemSettings> => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(settings) });
export const getHostelBlocks = (): Promise<HostelBlock[]> => apiFetch('/settings/blocks');
export const addHostelBlock = (name: string): Promise<HostelBlock> => apiFetch('/settings/blocks', { method: 'POST', body: JSON.stringify({ name }) });
export const updateHostelBlock = (id: string, name: string): Promise<HostelBlock> => apiFetch(`/settings/blocks/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
export const deleteHostelBlock = (id: string): Promise<{ success: true }> => apiFetch(`/settings/blocks/${id}`, { method: 'DELETE' });