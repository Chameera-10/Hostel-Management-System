import React, { useState, useEffect, useCallback, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";

import {
  // Students
  getWardenStudents,
  toggleStudentStatus,
  getPendingStudents,
  approveStudent,
  rejectStudent,
  // Rooms
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  getUnassignedStudents,
  assignStudentToRoom,
  unassignStudentFromRoom,
  // Complaints
  getComplaints,
  updateComplaintStatus,
  // Announcements
  getWardenAnnouncements,
  postWardenAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  // Inventory
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  // Clearance (warden side)
  getClearanceRequests,
  updateRoomInspectionStatus,
  // Dashboard stats
  getWardenDashboardStats,
  // Staff & tasks
  getStaffMembers,
  getStaffTasks,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  assignTask,
  updateTask,
  deleteTask,
} from "../../services/api";

import {
  StudentProfile,
  Room,
  MaintenanceRequest,
  Announcement,
  UserRole,
  InventoryItem,
  ClearanceRequest,
  ClearanceStep,
  StaffMember,
  StaffTask,
  StaffRole,
} from "../../types";

import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

import {
  UserGroupIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon as ShieldCheckOutlineIcon,
} from "@heroicons/react/24/outline";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

/* =========================================
   Small UI Helpers
========================================= */

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 shadow flex items-center">
    <div className="p-3 bg-[#0A8DFF]/80 rounded-full text-white">{icon}</div>
    <div className="ml-4">
      <p className="text-xl font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-extrabold text-[#185098ff]">{value}</p>
    </div>
  </div>
);

/* =========================================
   HOME (Warden)
========================================= */

const WardenHome: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const [statsData, annData] = await Promise.all([
          getWardenDashboardStats(),
          getWardenAnnouncements(),
        ]);
        setStats(statsData);
        setAnnouncements(annData.slice(0, 4));
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return <div>Dashboard data unavailable.</div>;

  const roomData = [
    { name: "Full", value: stats.rooms.full },
    { name: "Partially Filled", value: stats.rooms.partial },
    { name: "Empty", value: stats.rooms.empty },
  ];
  const roomColors = ["#52abe2ff", "#FBBF24", "#22C55E"];

  const complaintData = stats.complaintStats; // [{name,value}]
  const complaintColors = ["#FBBF24", "#3B82F6", "#22C55E"];

  return (
    <div className="space-y-6 ">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 ">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<UserGroupIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Occupied Rooms"
          value={`${stats.rooms.full + stats.rooms.partial} / ${
            stats.rooms.total
          }`}
          icon={<BuildingOfficeIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Pending Complaints"
          value={stats.pendingComplaints}
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Pending Clearances"
          value={stats.pendingClearance}
          icon={<ShieldCheckOutlineIcon className="w-6 h-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROOM OCCUPANCY */}
        <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow hover:shadow-2xl transition-all duration-500">
          <h3
            className="text-xl font-bold text-[#0f172a]
 mb-4"
          >
            Room Occupancy
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={roomData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={92}
                label
                animationDuration={1200}
                animationEasing="ease-in-out"
                cornerRadius={8}
              >
                {roomData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={["#99a3aaff", "#83b5fcff", "#2679e5ff"][i]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* COMPLAINT STATUS */}
        <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow hover:shadow-2xl transition-all duration-500">
          <h3
            className="text-xl font-bold text-[#0f172a]
 mb-4"
          >
            Complaint Status
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={complaintData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={92}
                label
                animationDuration={1200}
                animationEasing="ease-in-out"
                cornerRadius={8}
              >
                {complaintData.map((_: any, i: number) => (
                  <Cell
                    key={i}
                    fill={["#2679e5ff", "#3bead9ff", "#83b5fcff"][i]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "10px",
                  border: "1px solid #eee",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Announcements */}
      <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 shadow">
        <h3 className="text-xl font-bold text-#198b9aff mb-4">
          Recent Announcements
        </h3>

        <div className="space-y-3">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <div
                key={a.id}
                className="
            relative
            p-4
            rounded-2xl
            bg-white/25
            backdrop-blur-xl
            border border-white/40
            shadow-md
            hover:shadow-xl
            transition-all duration-500
          "
              >
                {/* meta top-right */}
                <div className="absolute top-2 right-2 text-[15px] text-gray-600 text-right">
                  <div className="font-semibold">{a.author}</div>
                  <div>{new Date(a.date).toLocaleDateString()}</div>
                </div>

                {/* Title */}
                <div className="font-bold text-[#2679e5ff]/80 text-[20px] pr-24">
                  {a.title}
                </div>

                {/* Content */}
                <div className="mt-1 text-gray-800 text-lg pr-16 leading-relaxed">
                  {a.content}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No new announcements.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================
   Student Management
========================================= */

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "disabled"
  >("all");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWardenStudents();
      setStudents(data);
    } catch {
      setError("Failed to fetch student data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleToggleStatus = async (id: string) => {
    await toggleStudentStatus(id);
    fetchStudents();
  };

  const filtered = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      (s.roomNumber && s.roomNumber.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === "all" || s.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div>Loading students...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* search + filter box */}
      <div className="p-5 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/40 shadow space-y-3">
        <h2 className="text-2xl font-bold text-#2679e5ff ">
          Student Management
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name / ID / room..."
            className="flex-grow p-3 rounded-xl border border-white/50 bg-white/40 backdrop-blur-lg shadow-inner placeholder-gray-500 focus:ring-2 focus:ring-[#14654d]/60 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-3 rounded-xl border border-white/50 bg-white/40 backdrop-blur-lg shadow-inner focus:ring-2 focus:ring-[#14654d]/60"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* table */}
      <div className="rounded-2xl bg-white/25 backdrop-blur-xl border border-white/40 shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#60a5fa] shadow-[0_0_25px_rgba(0,0,0,0.25)] from-blue-700 via-blue-500 to-blue-600 text-white">
              <th className="px-4 py-3 text-left font-bold text-lg">
                Student ID
              </th>
              <th className="px-4 py-3 text-left font-bold text-lg">Name</th>
              <th className="px-4 py-3 text-left font-bold text-lg">
                Room No.
              </th>
              <th className="px-4 py-3 text-left font-bold text-lg">Status</th>
              <th className="px-8 py-3 text-left font-bold text-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-b border-white/30 hover:bg-white/30 transition-all duration-200"
              >
                <td className="px-4 py-3 text-[15px] text-gray-500">
                  {s.studentId}
                </td>
                <td className="px-4 py-3 text-[15px] text-gray-500">
                  {s.name}
                </td>
                <td className="px-4 py-3 text-[15px] text-gray-500">
                  {s.roomNumber || "-"}
                </td>
                <td className="px-4 py-3 text-[15px] text-gray-500">
                  <span
                    className={`px-3 py-1 text-xs rounded-lg font-semibold ${
                      s.accountStatus === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.accountStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.accountStatus !== "pending" && (
                    <button
                      onClick={() => handleToggleStatus(s.id)}
                      className={`px-4 py-1.5 text-xs rounded-xl font-semibold text-white shadow-md transition-all ${
                        s.accountStatus === "disabled"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-red-500 hover:bg-red-700"
                      }`}
                    >
                      {s.accountStatus === "disabled" ? "Enable" : "Disable"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================
   Student Approvals
========================================= */

const StudentApprovals: React.FC = () => {
  const [pending, setPending] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingStudents();
      setPending(data);
    } catch {
      setError("Failed to fetch pending student approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string) => {
    await approveStudent(id);
    fetchPending();
  };

  const handleReject = async (id: string) => {
    await rejectStudent(id);
    fetchPending();
  };

  if (loading) return <div>Loading approvals...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="p-5 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-lg">
        <h2 className="text-2xl font-bold text-[#0A3D62] tracking-wide">
          Pending Student Approvals
        </h2>
      </div>

      {/* table container glass */}
      <div className="rounded-2xl bg-white/15 backdrop-blur-2xl border border-white/30 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.005]">
        {pending.length === 0 ? (
          <div className="p-10 text-gray-500 text-center text-sm">
            No pending approvals.
          </div>
        ) : (
          <table className="min-w-full text-sm space-x-10">
            <thead className="bg-[#0A8DFF]/80 text-white backdrop-blur-xl">
              <tr>
                <th className="px-6 py-4 text-left font-bold tracking-wide text-[16px]">
                  Student ID
                </th>
                <th className="px-6 py-4 text-left font-bold tracking-wide text-[16px]">
                  Name
                </th>
                <th className="px-6 py-4 text-left font-bold tracking-wide text-[16px]">
                  Email
                </th>
                <th className="px-6 py-4 text-center font-bold tracking-wide text-[16px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {pending.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all"
                >
                  <td className="px-4 py-3 font-medium text-[17px] text-gray-500">
                    {student.studentId}
                  </td>
                  <td className="px-4 py-3 text-[17px] text-gray-500">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-[17px] text-gray-500">
                    {student.email}
                  </td>

                  <td className="px-4 py-3 space-x-5 text-center">
                    <button
                      onClick={() => handleApprove(student.id)}
                      className="px-4 py-1.5 text-sm rounded-lg text-white bg-[#22c55e] hover:bg-[#16a34a] shadow-md backdrop-blur-md"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(student.id)}
                      className="px-4 py-1.5 text-sm rounded-lg text-white bg-[#ef4444] hover:bg-[#dc2626] shadow-md backdrop-blur-md"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

/* =========================================
   Room Modals
========================================= */

const RoomModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Omit<Room, "id" | "occupants"> | Room) => void;
  room: Room | null;
}> = ({ isOpen, onClose, onSave, room }) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState(2);

  useEffect(() => {
    if (room) {
      setRoomNumber(room.roomNumber);
      setCapacity(room.capacity);
    } else {
      setRoomNumber("");
      setCapacity(2);
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { roomNumber, capacity };
    if (room) onSave({ ...room, ...data });
    else onSave(data);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/30 rounded-2xl">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
          {room ? "Edit Room" : "Add Room"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-lg font-semibold text-gray-700">
              Room Number
            </label>
            <input
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:border-[#14654d] focus:ring-1 focus:ring-[#14654d]"
              placeholder="Eg: A-102"
            />
          </div>

          <div className="space-y-1">
            <label className="text-lg font-semibold text-gray-700">
              Capacity
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:border-[#14654d] focus:ring-1 focus:ring-[#14654d]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#14654d] text-white font-semibold rounded-lg hover:bg-[#125943]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AssignStudentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAssign: (studentId: string) => void;
  room: Room | null;
  unassignedStudents: StudentProfile[];
}> = ({ isOpen, onClose, onAssign, room, unassignedStudents }) => {
  const [selectedStudent, setSelectedStudent] = useState("");

  useEffect(() => {
    if (unassignedStudents.length > 0)
      setSelectedStudent(unassignedStudents[0].id);
    else setSelectedStudent("");
  }, [unassignedStudents, isOpen]);

  if (!isOpen || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) onAssign(selectedStudent);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/30 rounded-2xl">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">
          Assign Student • {room.roomNumber}
        </h2>

        {unassignedStudents.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-lg font-semibold text-gray-700">
                Select Student
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="mt-1 block w-full border rounded-md p-2"
              >
                {unassignedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1e3a8a] text-white font-semibold rounded-lg hover:bg-[#125943]"
              >
                Assign
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-600">
            No unassigned students available.
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#14654d] text-white font-semibold rounded-lg hover:bg-[#125943]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================
   Room Management
========================================= */

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Map<string, StudentProfile>>(
    new Map()
  );
  const [unassignedStudents, setUnassignedStudents] = useState<
    StudentProfile[]
  >([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [assigningToRoom, setAssigningToRoom] = useState<Room | null>(null);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState<
    "all" | "full" | "partial" | "available"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsData, studentsData, unassignedData] = await Promise.all([
        getRooms(),
        getWardenStudents(),
        getUnassignedStudents(),
      ]);
      setRooms(roomsData);
      setStudents(new Map(studentsData.map((s) => [s.id, s])));
      setUnassignedStudents(unassignedData);
    } catch {
      setError("Failed to load room management data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenRoomModal = (room: Room | null = null) => {
    setEditingRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsRoomModalOpen(false);
    setAssigningToRoom(null);
    setEditingRoom(null);
  };

  const handleSaveRoom = async (
    roomData: Omit<Room, "id" | "occupants"> | Room
  ) => {
    if ("id" in roomData) await updateRoom(roomData.id, roomData);
    else await addRoom(roomData);
    fetchData();
    handleCloseModals();
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this room? This cannot be undone."
      )
    ) {
      try {
        await deleteRoom(roomId);
      } catch (err: any) {
        alert(`Failed: ${err.message}`);
      }
      fetchData();
    }
  };

  const handleAssignStudent = async (studentId: string) => {
    if (assigningToRoom) {
      await assignStudentToRoom(studentId, assigningToRoom.id);
      fetchData();
      handleCloseModals();
    }
  };

  const handleUnassignStudent = async (studentId: string) => {
    if (window.confirm("Unassign this student from the room?")) {
      await unassignStudentFromRoom(studentId);
      fetchData();
    }
  };

  const getRoomStatus = (room: Room) => {
    const { occupants, capacity } = room;
    if (occupants.length === 0)
      return {
        text: "Available",
        color: "bg-blue-50",
        textColor: "text-blue-700",
      };
    if (occupants.length < capacity)
      return {
        text: "Partially Filled",
        color: "bg-white-50",
        textColor: "text-gray-400",
      };
    return { text: "Full", color: "bg-red-50", textColor: "text-red-700" };
  };

  const filteredRooms = rooms
    .filter((room) => {
      const matchesSearch = room.roomNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (occupancyFilter === "all") return matchesSearch;
      if (occupancyFilter === "full")
        return matchesSearch && room.occupants.length === room.capacity;
      if (occupancyFilter === "partial")
        return (
          matchesSearch &&
          room.occupants.length > 0 &&
          room.occupants.length < room.capacity
        );
      if (occupancyFilter === "available")
        return matchesSearch && room.occupants.length === 0;
      return matchesSearch;
    })
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));

  return (
    <div className="p-4 space-x-4 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-[#0f172a]
"
          >
            Room Management
          </h2>
          <p className="text-gray-600 text-sm">
            Create, edit, and assign students to rooms.
          </p>
        </div>
        <button
          onClick={() => handleOpenRoomModal()}
          className="px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white rounded-xl shadow hover:opacity-95 space-x-2 transition flex items-center"
        >
          + Add New Room
        </button>
      </div>

      {/* FILTER BUTTONS (horizontal) - uses existing occupancyFilter state */}
      <div className="mb-6">
        <div className="inline-flex rounded-2xl border border-gray-200 bg-white/70 backdrop-blur shadow px-2 py-2 gap-2">
          <button
            onClick={() => setOccupancyFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-[17px] font-medium transition ${
              occupancyFilter === "all"
                ? "bg-[#0ea5e9] text-white shadow"
                : "bg-white text-gray-700 hover:bg-sky-50 border border-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setOccupancyFilter("available")}
            className={`px-3 py-1.5 rounded-lg text-[17px] font-medium transition ${
              occupancyFilter === "available"
                ? "bg-[#0ea5e9] text-white shadow"
                : "bg-white text-gray-700 hover:bg-sky-50 border border-gray-200"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setOccupancyFilter("partial")}
            className={`px-3 py-1.5 rounded-lg text-[17px] font-medium transition ${
              occupancyFilter === "partial"
                ? "bg-[#0ea5e9] text-white shadow"
                : "bg-white text-gray-700 hover:bg-sky-50 border border-gray-200"
            }`}
          >
            Partial
          </button>
          <button
            onClick={() => setOccupancyFilter("full")}
            className={`px-3 py-1.5 rounded-lg text-[17px] font-medium transition ${
              occupancyFilter === "full"
                ? "bg-[#0ea5e9] text-white shadow"
                : "bg-white text-gray-700 hover:bg-sky-50 border border-gray-200"
            }`}
          >
            Full
          </button>
        </div>
      </div>

      {/* ROOMS LIST */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 space-4 mb-6 gap-4">
        {filteredRooms.map((room) => {
          const status = getRoomStatus(room);
          const expanded = expandedRoomId === room.id;
          const isFull = room.occupants.length >= room.capacity;

          return (
            <div key={room.id}>
              {/* collapsed pill */}
              {!expanded && (
                <button
                  onClick={() => !isFull && setExpandedRoomId(room.id)}
                  disabled={isFull}
                  className={`w-20 py-3 rounded-lg border font-bold transition shadow ${
                    isFull
                      ? "bg-red-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-300 text-[#14654d] hover:shadow-lg"
                  }`}
                >
                  {room.roomNumber}
                </button>
              )}

              {/* expanded popup */}
              {expanded && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 rounded-2xl">
                  <div
                    className={`w-full max-w-sm p-5 rounded-2xl bg-white border shadow-xl ${status.color}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-xl text-gray-600">
                        {room.roomNumber}
                      </h3>
                      <button
                        onClick={() => setExpandedRoomId(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-[15px] hover:bg-white-400 transition"
                      >
                        Close
                      </button>
                    </div>

                    <p
                      className={`text-[13px] text-gray-500 font-medium mb-3 ${status.textColor}`}
                    >
                      {room.occupants.length} / {room.capacity} Occupants
                    </p>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {room.occupants.length === 0 && (
                        <p className="text-gray-500 text-[16px]">
                          No occupants.
                        </p>
                      )}

                      {room.occupants.map((studentId) => {
                        const student = students.get(studentId);
                        return (
                          <div
                            key={studentId}
                            className="flex justify-between items-center text-[16px] bg-gray-50 rounded-lg px-3 py-2"
                          >
                            {student?.name ?? "Unknown"}
                            <button
                              onClick={() => handleUnassignStudent(studentId)}
                              className="px-2 py-1 bg-red-500 text-white text-[11px] rounded-md shadow hover:bg-red-600 transition"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleOpenRoomModal(room)}
                        className="px-3 py-1.5 bg-blue-500 text-white text-[15px] rounded-md shadow hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-3 py-1.5 bg-red-500 text-white text-[15px] rounded-md shadow hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>

                    {room.occupants.length < room.capacity && (
                      <button
                        onClick={() => setAssigningToRoom(room)}
                        className="mt-4 w-full bg-[#14658B] text-white rounded-lg py-2 text-[15px] shadow hover:bg-[#0f4f6a] transition"
                      >
                        Assign Student
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODALS KEEP */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={handleCloseModals}
        onSave={handleSaveRoom}
        room={editingRoom}
      />
      <AssignStudentModal
        isOpen={!!assigningToRoom}
        onClose={handleCloseModals}
        onAssign={handleAssignStudent}
        room={assigningToRoom}
        unassignedStudents={unassignedStudents}
      />
    </div>
  );
};

/* =========================================
   Complaints
========================================= */

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Pending" | "In Progress" | "Completed"
  >("all");

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    getComplaints()
      .then(setComplaints)
      .catch(() => setError("Failed to fetch complaints."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleStatusChange = async (
    id: string,
    status: MaintenanceRequest["status"]
  ) => {
    await updateComplaintStatus(id, status);
    fetchComplaints();
  };

  const filteredComplaints = complaints.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.issue.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.roomNumber.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div>Loading complaints...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-[#0f172a]
"
          >
            Student Complaints / Maintenance
          </h2>
          <p className="text-gray-600 text-sm">
            Track, filter, and update complaint statuses.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="
    px-4 py-2
    rounded-xl
    bg-white/30
    backdrop-blur-md
    border border-gray-300
    shadow-[0_2px_6px_rgba(0,0,0,0.08)]
    text-[16px]
    font-medium
    text-gray-800
    transition
    hover:bg-white/50
    focus:outline-none
    focus:ring-2
    focus:ring-[#14654d]/50
    cursor-pointer
  "
        >
          <option className="bg-white text-gray-700 " value="all">
            All
          </option>
          <option className="bg-white text-gray-700 " value="Pending">
            Pending
          </option>
          <option className="bg-white text-gray-700 " value="In Progress">
            In Progress
          </option>
          <option className="bg-white text-gray-700 " value="Completed">
            Completed
          </option>
        </select>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by issue, student, or room..."
          className="w-full border border-gray-200 rounded-xl p-3 bg-white/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#14654d]/30"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {filteredComplaints.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white/80 border border-gray-200 rounded-2xl shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-[19px]">
                  {c.issue}{" "}
                  <span className="text-gray-500 font-bold text-sm">
                    — Room {c.roomNumber}
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Reported by{" "}
                  <span className="font-medium text-gray-800 px-1">
                    {c.studentName}
                  </span>{" "}
                  on {new Date(c.submittedAt).toLocaleString()}
                </p>
                <p className="mt-3 text-gray-800 text-[17px] leading-6">
                  {c.description}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:self-start">
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    c.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : c.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {c.status}
                </span>
                <select
                  value={c.status}
                  onChange={(e) =>
                    handleStatusChange(
                      c.id,
                      e.target.value as MaintenanceRequest["status"]
                    )
                  }
                  className="text-[14px] px-2 py-1 border border-gray-300 font-bold rounded-md bg-white/90"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {filteredComplaints.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No complaints match your filters.
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================
   Inventory (with modal)
========================================= */

const InventoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, "id"> | InventoryItem) => void;
  item: InventoryItem | null;
  rooms: Room[];
}> = ({ isOpen, onClose, onSave, item, rooms }) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setRoomId(item.roomId);
    } else {
      setName("");
      setQuantity(1);
      setRoomId(null);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      quantity,
      roomId: roomId === "null" ? null : roomId,
    };
    if (item) onSave({ ...item, ...payload });
    else onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold mb-4 text-[#2363eb]">
          {item ? "Edit" : "Add"} Inventory Item
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[17px] font-medium text-gray-700">
              Item Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-blue-200 rounded-xl p-3 bg-blue-50/30 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[16px] font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              className="mt-1 block w-full border border-blue-200 rounded-xl p-3 bg-blue-50/30 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-[17px] font-medium text-gray-700">
              Assign to Room
            </label>
            <select
              value={roomId ?? "null"}
              onChange={(e) => setRoomId(e.target.value)}
              className="mt-1 block w-full border border-blue-200 rounded-xl p-3 bg-blue-50/30 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="null">General Stock</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#2363eb] text-white hover:bg-blue-600 shadow"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<
    "all" | "general" | "assigned"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(() => {
    setLoading(true);
    Promise.all([getInventory(), getRooms()])
      .then(([inv, rms]) => {
        setInventory(inv);
        setRooms(rms);
      })
      .catch(() => setError("Failed to load inventory data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleOpenModal = (item: InventoryItem | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (
    itemData: Omit<InventoryItem, "id"> | InventoryItem
  ) => {
    if ("id" in itemData) await updateInventoryItem(itemData.id, itemData);
    else await addInventoryItem(itemData);
    fetchInventory();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this item?")) {
      await deleteInventoryItem(id);
      fetchInventory();
    }
  };

  const getRoomNumber = (roomId: string | null) => {
    if (!roomId) return <span className="text-gray-500">General Stock</span>;
    return rooms.find((r) => r.id === roomId)?.roomNumber || "Unknown";
  };

  const filtered = inventory.filter((item) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(s);
    const matchesAssignment =
      assignmentFilter === "all" ||
      (assignmentFilter === "general" && item.roomId === null) ||
      (assignmentFilter === "assigned" && item.roomId !== null);
    return matchesSearch && matchesAssignment;
  });

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-lg flex justify-between items-center">
        <h2
          className="text-xl font-bold text-[#0f172a]
"
        >
          Hostel Inventory
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#0A8DFF]/80 text-white rounded-xl hover:bg-blue-600 shadow"
        >
          + Add Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white border border-blue-100 shadow">
        <input
          type="text"
          placeholder="Search item..."
          className="flex-grow p-3 border border-blue-200 rounded-xl bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value as any)}
          className="p-3 border border-blue-200 rounded-xl bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="all">All</option>
          <option value="general">General Stock</option>
          <option value="assigned">Assigned</option>
        </select>
      </div>

      <div className="rounded-2xl bg-white border border-blue-100 shadow overflow-hidden ">
        <table className="min-w-full bg-transparent ">
          <thead className="bg-[#0A8DFF]/80 text-white ">
            <tr className="p-[30px]">
              <th className="px-15 py-3 text-left">Item</th>
              <th className="px-15 py-3 text-left">Qty</th>
              <th className="px-15 py-3 text-left">Room</th>
              <th className="px-25 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-500 ">
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-b border-blue-50 hover:bg-blue-50/50 "
              >
                <td className="px-15 py-3 font-medium ">{item.name}</td>
                <td className="px-15 py-3">{item.quantity}</td>
                <td className="px-15 py-3">{getRoomNumber(item.roomId)}</td>
                <td className="px-19 py-3 space-x-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 space-x-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InventoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        item={editingItem}
        rooms={rooms}
      />
    </div>
  );
};

/* =========================================
   Clearance (Warden side)
========================================= */

const ClearanceManagement: React.FC = () => {
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [students, setStudents] = useState<Map<string, StudentProfile>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    Promise.all([getClearanceRequests(), getWardenStudents()])
      .then(([requestsData, studentList]) => {
        setRequests(requestsData);
        setStudents(new Map(studentList.map((s) => [s.id, s])));
      })
      .catch(() => setError("Failed to load clearance requests."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateInspection = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    let remarks = status === "approved" ? "Room inspection passed." : "";
    if (status === "rejected") {
      remarks =
        prompt("Reason for failing inspection:") || "Room inspection failed.";
    }
    await updateRoomInspectionStatus(id, status, remarks);
    fetchRequests();
  };

  const getStepChip = (steps: ClearanceStep[], stepName: string) => {
    const step = steps.find((s) => s.name === stepName);
    if (!step) return <span className="text-gray-400">N/A</span>;
    const s = step.status;
    return (
      <span
        className={`px-2 py-1 rounded text-sm font-semibold ${
          s === "approved"
            ? "bg-blue-50 text-blue-400"
            : s === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  };

  if (loading) return <div>Loading clearance requests...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white border border-blue-100 rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <h2
        className="text-2xl font-bold text-[#0f172a]
 mb-4"
      >
        Student Clearance Requests
      </h2>

      <div className="overflow-x-auto rounded-2xl bg-white border border-blue-100 shadow">
        <table className="min-w-full bg-transparent">
          <thead className="bg-[#0A8DFF]/80 text-white text-[17px]">
            <tr>
              <th className="px-5 py-3 text-left">Student</th>
              <th className="px-5 py-3 text-left">Room</th>
              <th className="px-5 py-3 text-left">Fee Dues</th>
              <th className="px-5 py-3 text-left">Inspection</th>
              <th className="px-9 py-3 text-left">Overall</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-800 text-sm">
            {requests.map((req) => {
              const student = students.get(req.studentId);
              const inspectionStep = req.steps.find(
                (s) => s.name === "Room Inspection"
              );

              return (
                <tr
                  key={req.id}
                  className="border-b border-blue-50 hover:bg-blue-50/20 transition text-gray-600"
                >
                  <td className="px-5 py-3 font-medium text-[17px]">
                    {req.studentName}
                  </td>
                  <td className="px-5 py-3">{student?.roomNumber || "N/A"}</td>
                  <td className="px-5 py-3">
                    {getStepChip(req.steps, "Hostel Fee Dues")}
                  </td>
                  <td className="px-5 py-3">
                    {getStepChip(req.steps, "Room Inspection")}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-bold ${
                        req.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {inspectionStep?.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateInspection(req.id, "approved")
                          }
                          className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 shadow"
                        >
                          Pass
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateInspection(req.id, "rejected")
                          }
                          className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 shadow"
                        >
                          Fail
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================
   Announcements (Warden)
========================================= */

const AnnouncementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<Announcement, "id" | "date" | "author" | "audience">
  ) => void;
  announcement: Announcement | null;
}> = ({ isOpen, onClose, onSave, announcement }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, content });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-blue-100 shadow-[0_10px_35px_rgba(0,0,0,0.15)] p-8">
        <h2 className="text-2xl font-bold text-[#2363eb] mb-6">
          {announcement ? "Edit Announcement" : "Create Announcement"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[18px] font-semibold text-gray-700 mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="
              w-full px-4 py-3 rounded-xl
              bg-blue-50/40 border border-blue-200
              text-[18px] shadow-sm
              focus:ring-2 focus:ring-[#2363eb] outline-none
            "
            />
          </div>

          <div>
            <label className="block text-[18px] font-semibold text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
              className="
              w-full px-4 py-3 rounded-xl
              bg-blue-50/40 border border-blue-200
              text-[18px] shadow-sm
              focus:ring-2 focus:ring-[#2363eb] outline-none
            "
            />
          </div>

          <div>
            <label className="block text-[18px] font-semibold text-gray-700 mb-1">
              Audience
            </label>
            <p className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-500 text-[16px]">
              Students & Wardens
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 text-[16px] font-medium hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#2363eb] text-white text-[16px] font-semibold shadow hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const authContext = useContext(AuthContext);

  const fetchAnnouncements = useCallback(() => {
    setIsLoading(true);
    getWardenAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError("Failed to load announcements."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenModal = (a: Announcement | null = null) => {
    setEditingAnnouncement(a);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSave = async (
    data: Omit<Announcement, "id" | "date" | "author" | "audience">
  ) => {
    if (!authContext?.user) return;
    const payload = { ...data, audience: [UserRole.Student, UserRole.Warden] };

    if (editingAnnouncement)
      await updateAnnouncement(editingAnnouncement.id, payload);
    else await postWardenAnnouncement(payload, authContext.user.name);

    fetchAnnouncements();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this announcement?")) {
      await deleteAnnouncement(id);
      fetchAnnouncements();
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div>Loading announcements...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded-2xl border border-white/30 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-[25px] font-bold text-[#0f172a]
"
        >
          Manage Announcements
        </h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#0A8DFF]/80 text-white rounded-lg hover:bg-opacity-90 shadow"
        >
          Create New
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search announcements..."
          className="w-full p-3 border rounded-lg bg-white/70"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="relative backdrop-blur-xl bg-white/80 shadow-md border border-white/40 rounded-2xl p-6"
          >
            {/* author + date top right */}
            <div className="absolute top-3 right-4 text-[12px] text-gray-500 font-medium text-right">
              <div>{a.author}</div>
              <div>{new Date(a.date).toLocaleDateString()}</div>
            </div>

            {/* title + content */}
            <h3
              className="font-bold text-xl text-[#0A8DFF]/80
 mb-2 pr-24"
            >
              {a.title}
            </h3>
            <p className="text-gray-700 text-[16px] leading-relaxed pr-6">
              {a.content}
            </p>

            {/* buttons bottom right */}
            {a.author === authContext?.user?.name && (
              <div className="flex gap-2 mt-4 justify-end">
                <button
                  onClick={() => handleOpenModal(a)}
                  className="px-3 py-1 text-[18px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="px-3 py-1 text-[18px] bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        announcement={editingAnnouncement}
      />
    </div>
  );
};

/* =========================================
   Staff & Tasks
========================================= */

/* ================= STAFF MODAL ================== */
const StaffModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  staffMember: StaffMember | null;
}> = ({ isOpen, onClose, onSave, staffMember }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: StaffRole.Maintenance,
    contact: "",
  });

  useEffect(() => {
    if (staffMember)
      setFormData({
        name: staffMember.name,
        role: staffMember.role,
        contact: staffMember.contact,
      });
    else setFormData({ name: "", role: StaffRole.Maintenance, contact: "" });
  }, [staffMember, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-30 ">
        <h2 className="text-[25px] font-bold mb-[5px] my-30 text-blue-[#2363eb]">
          {staffMember ? "Edit" : "Add"} Staff Member
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[16px] font-medium text-gray-700">
              Full Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-xl p-2 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[16px] font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-xl p-2 bg-gray-50"
            >
              {Object.values(StaffRole).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[16px] font-medium text-gray-700">
              Contact (Phone/Email)
            </label>
            <input
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-xl p-2 bg-gray-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[18px] bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[18px] bg-[#14654d] text-white rounded-xl"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= TASK MODAL ================== */
const TaskModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  task: StaffTask | null;
  staffList: StaffMember[];
}> = ({ isOpen, onClose, onSave, task, staffList }) => {
  const [formData, setFormData] = useState({
    description: "",
    staffMemberId: "",
  });

  useEffect(() => {
    if (task)
      setFormData({
        description: task.description,
        staffMemberId: task.staffMemberId,
      });
    else
      setFormData({ description: "", staffMemberId: staffList[0]?.id || "" });
  }, [task, isOpen, staffList]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-2 text-blue-[#2363eb]">
          {task ? "Edit" : "Assign"} Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[16px] font-medium text-gray-700">
              Task Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full border rounded-xl p-2 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-[16px] font-medium text-gray-700">
              Assign To
            </label>
            <select
              name="staffMemberId"
              value={formData.staffMemberId}
              onChange={handleChange}
              required
              className="mt-1 block w-full border rounded-xl p-2 bg-gray-50"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[18px] bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[18px] bg-blue-100 text-blue rounded-xl"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= STAFF MANAGEMENT MAIN ================== */
/* ================= STAFF MANAGEMENT MAIN ================== */
const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"roster" | "tasks">("roster");
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StaffTask | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffData, tasksData] = await Promise.all([
        getStaffMembers(),
        getStaffTasks(),
      ]);
      setStaff(staffData);
      setTasks(tasksData);
    } catch {
      setError("Failed to load staff & tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveStaff = async (
    data: Omit<StaffMember, "id" | "wardenId">
  ) => {
    try {
      if (editingStaff) await updateStaffMember(editingStaff.id, data);
      else await addStaffMember(data);
      fetchData();
      setIsStaffModalOpen(false);
    } catch (e) {
      alert(`Failed to save staff member: ${e}`);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm("Delete staff?")) {
      try {
        await deleteStaffMember(id);
        fetchData();
      } catch (e) {
        alert(`Failed to delete staff member: ${e}`);
      }
    }
  };

  const handleSaveTask = async (
    data: Omit<StaffTask, "id" | "assignedAt" | "status">
  ) => {
    try {
      if (editingTask)
        await updateTask(editingTask.id, {
          description: data.description,
          staffMemberId: data.staffMemberId,
        });
      else await assignTask(data);
      fetchData();
      setIsTaskModalOpen(false);
    } catch (e) {
      alert(`Failed to save task: ${e}`);
    }
  };

  const handleUpdateTaskStatus = async (
    id: string,
    status: StaffTask["status"]
  ) => {
    try {
      await updateTask(id, { status });
      fetchData();
    } catch (e) {
      alert(`Failed to update task status: ${e}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Delete task?")) {
      try {
        await deleteTask(id);
        fetchData();
      } catch (e) {
        alert(`Failed to delete task: ${e}`);
      }
    }
  };

  if (loading) return <div>Loading staff...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const staffNameMap = new Map(staff.map((s) => [s.id, s.name]));

  return (
    <div className="p-6 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <h2
        className="text-[25px] font-bold text-[#0f172a]
 mb-4"
      >
        Staff Management
      </h2>

      {/* tabs + button layout */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveView("roster")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              activeView === "roster"
                ? "bg-[#0A8DFF]/80 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Staff Roster
          </button>

          <button
            onClick={() => setActiveView("tasks")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              activeView === "tasks"
                ? "bg-[#0A8DFF]/80 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Task Board
          </button>
        </div>

        {/* ADD staff button RIGHT SIDE */}
        {activeView === "roster" && (
          <button
            onClick={() => {
              setEditingStaff(null);
              setIsStaffModalOpen(true);
            }}
            className="px-4 py-2 bg-[#0A8DFF]/80 text-white rounded-xl hover:bg-blue-300"
          >
            + Add Staff Member
          </button>
        )}

        {activeView === "tasks" && (
          <button
            onClick={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
            className="px-4 py-2 bg-[#0A8DFF]/80 text-white rounded-xl hover:bg-blue-800"
          >
            + Assign Task
          </button>
        )}
      </div>

      {activeView === "roster" && (
        <div>
          <div className="overflow-x-auto rounded-2xl bg-white/60 border border-white/40">
            <table className="min-w-full bg-transparent">
              <thead className="bg-[#0A8DFF]/80 text-white text-[18px]">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-10 py-2 text-left">Contact</th>
                  <th className="px-10 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-500">
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{s.role}</td>
                    <td className="px-8 py-3">{s.contact}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingStaff(s);
                          setIsStaffModalOpen(true);
                        }}
                        className="px-3 py-1 text-[18px] rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(s.id)}
                        className="px-3 py-1 text-[18px] rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isStaffModalOpen && (
            <StaffModal
              isOpen={isStaffModalOpen}
              onClose={() => setIsStaffModalOpen(false)}
              onSave={handleSaveStaff}
              staffMember={editingStaff}
            />
          )}
        </div>
      )}

      {activeView === "tasks" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["Pending", "In Progress", "Completed"] as const).map(
              (status) => (
                <div
                  key={status}
                  className="backdrop-blur-xl bg-white/80 border border-white/30 shadow-xl rounded-2xl p-4"
                >
                  <h3 className="font-bold text-black-700 text-xl mb-4">
                    {status}
                  </h3>
                  <div className="space-y-3">
                    {tasks
                      .filter((t) => t.status === status)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-white shadow rounded-xl p-4 border border-gray-100"
                        >
                          <p className="text-xl text-gray-600">
                            {task.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            → {staffNameMap.get(task.staffMemberId)}
                          </p>

                          <div className="flex justify-between items-center mt-3">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleUpdateTaskStatus(
                                  task.id,
                                  e.target.value as StaffTask["status"]
                                )
                              }
                              className="text-[15px] border rounded px-2 py-1"
                            >
                              <option>Pending</option>
                              <option>In Progress</option>
                              <option>Completed</option>
                            </select>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setIsTaskModalOpen(true);
                                }}
                                className="px-3 py-1 text-[18px] rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-3 py-1 text-[18px] rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            )}
          </div>

          {isTaskModalOpen && (
            <TaskModal
              isOpen={isTaskModalOpen}
              onClose={() => setIsTaskModalOpen(false)}
              onSave={handleSaveTask}
              task={editingTask}
              staffList={staff}
            />
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================
   Router Wrapper
========================================= */

const WardenDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<WardenHome />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="approvals" element={<StudentApprovals />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="clearance" element={<ClearanceManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="announcements" element={<Announcements />} />
      </Routes>
    </DashboardLayout>
  );
};

export default WardenDashboard;
