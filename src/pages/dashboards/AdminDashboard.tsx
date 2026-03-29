import React, { useState, useEffect, useCallback, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { AuthContext } from "../../context/AuthContext";
import {
  getSystemStats,
  getAllUsers,
  getAllAnnouncements,
  postGlobalAnnouncement,
  getPendingWardens,
  approveWarden,
  rejectWarden,
  toggleWardenStatus,
  updateAnnouncement,
  deleteAnnouncement,
  getSystemReportsData,
  getSystemSettings,
  updateSystemSettings,
  getHostelBlocks,
  addHostelBlock,
  updateHostelBlock,
  deleteHostelBlock,
} from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  User,
  Announcement,
  WardenProfile,
  UserRole,
  SystemSettings,
  HostelBlock,
} from "../../types";
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="p-4 bg-white rounded-lg shadow-md flex items-center">
    <div className="p-3 bg-[#14654d] rounded-full text-white">{icon}</div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const DashboardHome = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSystemStats();
        setStats(data);
      } catch (err) {
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return <div>No statistics available.</div>;

  const COLORS = ["#14654d", "#55a66a", "#cbe6c2"];

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<UserGroupIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Total Wardens"
          value={stats.totalWardens}
          icon={<UserGroupIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Room Occupancy"
          value={`${stats.roomOccupancy.toFixed(1)}%`}
          icon={<BuildingOfficeIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={<WrenchScrewdriverIcon className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 mt-8 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Financial Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.financialReport}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="paid" fill="#14654d" name="Paid (LKR)" />
              <Bar dataKey="pending" fill="#85c77c" name="Pending (LKR)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">
            Complaint Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.complaintStats}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#14654d"
                label
              >
                {stats.complaintStats.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleWardenStatus(id);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.accountStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Management</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4 p-2 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="flex-grow p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 border rounded-md bg-white"
        >
          <option value="all">All Roles</option>
          <option value={UserRole.Admin}>Admin</option>
          <option value={UserRole.Warden}>Warden</option>
          <option value={UserRole.Student}>Student</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-md bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-[#14654d] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.accountStatus === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : user.accountStatus === "approved"
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {user.accountStatus}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {user.role === "warden" &&
                    user.accountStatus !== "pending" && (
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-2 py-1 text-sm text-white rounded ${
                          user.accountStatus === "disabled"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {user.accountStatus === "disabled"
                          ? "Enable"
                          : "Disable"}
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

const WardenApprovals = () => {
  const [pending, setPending] = useState<WardenProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingWardens();
      setPending(data);
    } catch (err) {
      setError("Failed to fetch pending warden approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string) => {
    await approveWarden(id);
    fetchPending();
  };

  const handleReject = async (id: string) => {
    await rejectWarden(id);
    fetchPending();
  };

  if (loading) return <div>Loading approvals...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Pending Warden Approvals</h2>
      {pending.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-[#14654d] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Warden ID</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {pending.map((warden) => (
                <tr key={warden.id} className="border-b">
                  <td className="px-4 py-2">{warden.name}</td>
                  <td className="px-4 py-2">{warden.email}</td>
                  <td className="px-4 py-2">{warden.wardenId}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleApprove(warden.id)}
                      className="px-2 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(warden.id)}
                      className="ml-2 px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AnnouncementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Announcement, "id" | "date" | "author">) => void;
  announcement: Announcement | null;
}> = ({ isOpen, onClose, onSave, announcement }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<string>("all");

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setAudience(
        Array.isArray(announcement.audience)
          ? announcement.audience.join(",")
          : "all"
      );
    } else {
      setTitle("");
      setContent("");
      setAudience("all");
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let audienceValue: UserRole[] | "all" = "all";
    if (audience !== "all") {
      audienceValue = audience.split(",") as UserRole[];
    }
    onSave({ title, content, audience: audienceValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          {announcement ? "Edit" : "Create"} Announcement
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="audience"
              className="block text-sm font-medium text-gray-700"
            >
              Audience
            </label>
            <select
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Users</option>
              <option value={UserRole.Student}>Students Only</option>
              <option value={UserRole.Warden}>Wardens Only</option>
              <option value={`${UserRole.Student},${UserRole.Warden}`}>
                Students & Wardens
              </option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#14654d] text-white rounded-md hover:bg-opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const authContext = useContext(AuthContext);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError("Failed to load announcements.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleOpenModal = (announcement: Announcement | null = null) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSave = async (
    data: Omit<Announcement, "id" | "date" | "author">
  ) => {
    if (!authContext?.user) return;

    if (editingAnnouncement) {
      await updateAnnouncement(editingAnnouncement.id, data);
    } else {
      await postGlobalAnnouncement(data, authContext.user.name);
    }
    fetchAnnouncements();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await deleteAnnouncement(id);
      fetchAnnouncements();
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Global Announcements</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#14654d] text-white rounded-md hover:bg-opacity-90"
        >
          Create New
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search announcements by title or content..."
          className="w-full p-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isLoading && <p>Loading announcements...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <div className="mt-2 space-y-4 max-h-[60vh] overflow-y-auto">
          {filteredAnnouncements.map((a) => (
            <div key={a.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{a.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {a.author} on {new Date(a.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Audience:{" "}
                    <span className="font-medium capitalize">
                      {Array.isArray(a.audience)
                        ? a.audience.join(", ")
                        : a.audience}
                    </span>
                  </p>
                  <p className="mt-2">{a.content}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenModal(a)}
                    className="px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        announcement={editingAnnouncement}
      />
    </div>
  );
};

const SystemReports = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getSystemReportsData();
        setReportData(data);
      } catch (err) {
        setError("Failed to load system reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div>Loading reports...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!reportData) return <div>No report data available.</div>;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Occupancy Trends (Last 6 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={reportData.occupancyTrends}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="%" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="occupancy"
              stroke="#14654d"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Financial Summary
            </h3>
            <button className="text-sm px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Month
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Paid (LKR)
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Pending (LKR)
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.financialSummary.map((row: any) => (
                  <tr key={row.name} className="border-b">
                    <td className="px-4 py-2">{row.name}</td>
                    <td className="px-4 py-2 text-green-600">
                      {row.paid.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-red-600">
                      {row.pending.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Maintenance Request Analysis
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={reportData.maintenanceAnalysis}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#85c77c" name="No. of Requests" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Pending Registrations
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">
                  Role
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentRegistrations.map((user: any) => (
                <tr key={user.id} className="border-b">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.type}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800 capitalize">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [blocks, setBlocks] = useState<HostelBlock[]>([]);
  const [newBlockName, setNewBlockName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, blocksData] = await Promise.all([
        getSystemSettings(),
        getHostelBlocks(),
      ]);
      setSettings(settingsData);
      setBlocks(blocksData);
    } catch (err) {
      setError("Failed to load system settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === "checkbox" ? checked : value });
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      await updateSystemSettings(settings);
      alert("Settings saved successfully!");
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBlockName.trim()) {
      await addHostelBlock(newBlockName.trim());
      setNewBlockName("");
      getHostelBlocks().then(setBlocks); // Re-fetch only blocks
    }
  };

  const handleEditBlock = async (id: string, currentName: string) => {
    const newName = prompt("Enter new block name:", currentName);
    if (newName && newName.trim() && newName !== currentName) {
      await updateHostelBlock(id, newName.trim());
      getHostelBlocks().then(setBlocks);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this hostel block?")) {
      await deleteHostelBlock(id);
      getHostelBlocks().then(setBlocks);
    }
  };

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!settings) return <div>Could not load settings.</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          General Settings
        </h2>
        <form onSubmit={handleSettingsSave} className="space-y-4">
          <div>
            <label
              htmlFor="appName"
              className="block text-sm font-medium text-gray-700"
            >
              Application Name
            </label>
            <input
              type="text"
              id="appName"
              name="appName"
              value={settings.appName}
              onChange={handleSettingsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="defaultHostelFee"
              className="block text-sm font-medium text-gray-700"
            >
              Default Hostel Fee (LKR)
            </label>
            <input
              type="number"
              id="defaultHostelFee"
              name="defaultHostelFee"
              value={settings.defaultHostelFee}
              onChange={handleSettingsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#14654d] text-white rounded-md hover:bg-opacity-90"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Hostel Block Management
        </h2>
        <div className="space-y-3 mb-6">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-md border"
            >
              <span className="text-gray-700">{block.name}</span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditBlock(block.id, block.name)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddBlock} className="flex space-x-2">
          <input
            type="text"
            value={newBlockName}
            onChange={(e) => setNewBlockName(e.target.value)}
            placeholder="New block name"
            className="flex-grow border border-gray-300 rounded-md shadow-sm p-2"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#14654d] text-white rounded-md hover:bg-opacity-90"
          >
            Add Block
          </button>
        </form>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Notification Settings
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            Enable System-Wide Email Notifications
          </span>
          <label htmlFor="toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="toggle"
                className="sr-only"
                name="enableEmailNotifications"
                checked={settings.enableEmailNotifications}
                onChange={handleSettingsChange}
              />
              <div
                className={`block w-14 h-8 rounded-full ${
                  settings.enableEmailNotifications
                    ? "bg-[#14654d]"
                    : "bg-gray-400"
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                  settings.enableEmailNotifications ? "translate-x-6" : ""
                }`}
              ></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="approvals" element={<WardenApprovals />} />
        <Route path="reports" element={<SystemReports />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
