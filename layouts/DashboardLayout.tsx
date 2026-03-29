
import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';
import { HomeIcon, UserGroupIcon, WrenchScrewdriverIcon, BanknotesIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, MegaphoneIcon, BuildingOfficeIcon, ArchiveBoxIcon, ShieldCheckIcon, UserPlusIcon, ChatBubbleBottomCenterTextIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';


interface NavItem {
    name: string;
    path: string;
    icon: React.ElementType;
}

const navItems: Record<UserRole, NavItem[]> = {
    [UserRole.Admin]: [
        { name: 'Dashboard', path: '/admin', icon: HomeIcon },
        { name: 'User Management', path: '/admin/users', icon: UserGroupIcon },
        { name: 'Warden Approvals', path: '/admin/approvals', icon: UserPlusIcon },
        { name: 'System Reports', path: '/admin/reports', icon: BanknotesIcon },
        { name: 'Announcements', path: '/admin/announcements', icon: MegaphoneIcon },
        { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
    ],
    [UserRole.Warden]: [
        { name: 'Dashboard', path: '/warden', icon: HomeIcon },
        { name: 'Student Management', path: '/warden/students', icon: UserGroupIcon },
        { name: 'Student Approvals', path: '/warden/approvals', icon: UserPlusIcon },
        { name: 'Room Management', path: '/warden/rooms', icon: BuildingOfficeIcon },
        { name: 'Complaints', path: '/warden/complaints', icon: WrenchScrewdriverIcon },
        { name: 'Inventory', path: '/warden/inventory', icon: ArchiveBoxIcon },
        { name: 'Clearance', path: '/warden/clearance', icon: ShieldCheckIcon },
        { name: 'Staff Management', path: '/warden/staff', icon: ClipboardDocumentListIcon },
        { name: 'Announcements', path: '/warden/announcements', icon: MegaphoneIcon },
    ],
    [UserRole.Student]: [
        { name: 'Dashboard', path: '/student', icon: HomeIcon },
        { name: 'My Profile', path: '/student/profile', icon: UserGroupIcon },
        { name: 'Payments', path: '/student/payments', icon: BanknotesIcon },
        { name: 'Maintenance', path: '/student/maintenance', icon: WrenchScrewdriverIcon },
        { name: 'Clearance', path: '/student/clearance', icon: ShieldCheckIcon },
        { name: 'AI Assistant', path: '/student/chatbot', icon: ChatBubbleBottomCenterTextIcon },
    ],
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const authContext = useContext(AuthContext);
    const location = useLocation();

    if (!authContext || !authContext.user) {
        return null;
    }

    const { user, logout } = authContext;
    const currentNavItems = navItems[user.role];

    return (
        <div className="flex h-screen bg-[#e5f3e1]">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 px-4 py-5 overflow-y-auto transition duration-300 transform bg-[#14654d] text-white ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">Hostel Portal</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav className="mt-10">
                    {currentNavItems.map((item) => {
                         const isActive = location.pathname === item.path || (item.path !== `/${user.role}` && location.pathname.startsWith(item.path));
                         return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-2 mt-5 text-gray-100 transition-colors duration-200 transform rounded-md hover:bg-white/20 hover:text-white ${isActive ? 'bg-white/20' : ''}`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="mx-4 font-medium">{item.name}</span>
                            </Link>
                         );
                    })}
                </nav>
                 <div className="absolute bottom-0 left-0 w-full p-4">
                     <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 mt-5 text-gray-100 transition-colors duration-200 transform rounded-md hover:bg-white/20 hover:text-white"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        <span className="mx-4 font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-[#14654d]">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none md:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="relative mx-4 md:mx-0">
                            <h1 className="text-xl font-semibold text-gray-700">Welcome, {user.name}</h1>
                            <p className="text-sm text-gray-500 capitalize">{user.role} Dashboard</p>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto bg-[#e5f3e1]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;