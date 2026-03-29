import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.tsx";
import { UserRole } from "../types.ts";
import {
  HomeIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  MegaphoneIcon,
  BuildingOfficeIcon,
  ArchiveBoxIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: Record<UserRole, NavItem[]> = {
  [UserRole.Admin]: [
    { name: "Dashboard", path: "/admin", icon: HomeIcon },
    { name: "User Management", path: "/admin/users", icon: UserGroupIcon },
    { name: "Warden Approvals", path: "/admin/approvals", icon: UserPlusIcon },
    { name: "System Reports", path: "/admin/reports", icon: BanknotesIcon },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: MegaphoneIcon,
    },
    { name: "Settings", path: "/admin/settings", icon: Cog6ToothIcon },
  ],
  [UserRole.Warden]: [
    { name: "Dashboard", path: "/warden", icon: HomeIcon },
    {
      name: "Student Management",
      path: "/warden/students",
      icon: UserGroupIcon,
    },
    {
      name: "Student Approvals",
      path: "/warden/approvals",
      icon: UserPlusIcon,
    },
    {
      name: "Room Management",
      path: "/warden/rooms",
      icon: BuildingOfficeIcon,
    },
    {
      name: "Complaints",
      path: "/warden/complaints",
      icon: WrenchScrewdriverIcon,
    },
    { name: "Inventory", path: "/warden/inventory", icon: ArchiveBoxIcon },
    { name: "Clearance", path: "/warden/clearance", icon: ShieldCheckIcon },
    {
      name: "Staff Management",
      path: "/warden/staff",
      icon: ClipboardDocumentListIcon,
    },
    {
      name: "Announcements",
      path: "/warden/announcements",
      icon: MegaphoneIcon,
    },
  ],
  [UserRole.Student]: [
    { name: "Dashboard", path: "/student", icon: HomeIcon },
    { name: "My Profile", path: "/student/profile", icon: UserGroupIcon },
    { name: "Payments", path: "/student/payments", icon: BanknotesIcon },
    {
      name: "Maintenance",
      path: "/student/maintenance",
      icon: WrenchScrewdriverIcon,
    },
    { name: "Clearance", path: "/student/clearance", icon: ShieldCheckIcon },
    {
      name: "AI Assistant",
      path: "/student/chatbot",
      icon: ChatBubbleBottomCenterTextIcon,
    },
  ],
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authContext = useContext(AuthContext);
  const location = useLocation();

  if (!authContext || !authContext.user) {
    return null;
  }

  const { user, logout } = authContext;
  const currentNavItems = navItems[user.role];

  return (
    <div className="flex h-screen bg-[#EAF1FF]">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 px-5 py-6 overflow-y-auto transition duration-300 transform 
        bg-gradient-to-b from-[#1E3A8A]/85 via-[#1D4ED8]/80 to-[#2563EB]/70
        backdrop-blur-2xl border-r border-white/20 shadow-[0_0_25px_rgba(0,0,0,0.25)]
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0`}
      >
        {/* Logo + Title */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-extrabold tracking-wide text-white drop-shadow-lg">
            🏫 Hostel Portal
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/80 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 space-y-3">
          {currentNavItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== `/${user.role}` &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-500 ease-in-out transform
                border border-white/10 backdrop-blur-lg
                ${
                  isActive
                    ? "bg-white/25 text-white font-bold shadow-lg scale-[1.03]"
                    : "bg-white/10 text-white font-bold hover:bg-white/20 hover:scale-[1.04] hover:shadow-[0_0_20px_rgba(147,197,253,0.5)]"
                }`}
              >
                <item.icon className="w-5 h-5 text-white" />
                <span className="ml-3 text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 w-full p-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-white font-bold bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl 
            hover:bg-white/25 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-[1.03] transition-all duration-300"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-sm border-b border-[#93C5FD]/40">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 focus:outline-none md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-[#1E3A8A] drop-shadow-sm">
                Welcome, <span className="text-[#2563EB]">{user.name}</span>
              </h1>
              <p className="text-sm text-gray-600 capitalize font-semibold">
                {user.role} Dashboard
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto bg-[#EAF1FF]">
          <div className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-md border border-white/30 min-h-[85vh] font-semibold text-gray-800">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
