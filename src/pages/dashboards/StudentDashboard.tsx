import React, { useState, useEffect, useContext, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.tsx";
import { AuthContext } from "../../context/AuthContext.tsx";
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentPayments,
  makeStudentPayment,
  getStudentMaintenanceRequests,
  submitMaintenanceRequest,
  getStudentAnnouncements,
  getStudentClearanceStatus,
  applyForClearance,
} from "../../services/api.ts";
import {
  StudentProfile,
  Payment,
  MaintenanceRequest,
  Announcement,
  ClearanceRequest,
  ClearanceStep,
} from "../../types.ts";
import ChatbotPage from "./ChatbotPage.tsx";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import { UserCircleIcon as ProfileIcon } from "@heroicons/react/24/outline";

/* ---------------------------------------------------
   Global font loader (Inter)
   --------------------------------------------------- */
const UseInterFont: React.FC = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch {
        /* ignore if already removed */
      }
    };
  }, []);
  return null;
};

/* -------------------- THEME -------------------- */
const THEME = {
  primary: "#354b7bff",
  accent: "#14B8A6",
  surface1: "#F3F4F6",
  surface2: "#E5E7EB",
};

/* Small helpers for consistent card + headings */
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div
    className={`rounded-xl bg-white shadow-[0_10px_25px_rgba(16,24,40,0.06)] border`}
    style={{ borderColor: THEME.surface2 }}
  >
    <div className={className}>{children}</div>
  </div>
);

const SectionTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h2
    className={`text-[17px] font-semibold tracking-wide ${className}`}
    style={{ color: THEME.primary }}
  >
    {children}
  </h2>
);

/* -------------------- Announcements -------------------- */
const AnnouncementsList: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudentAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError("Could not load announcements."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="mt-6 p-5">
      <SectionTitle className="mb-3 text-[20px] font-bold">
        Announcements
      </SectionTitle>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {loading && (
          <p className="text-[13px]" style={{ color: `${THEME.primary}B3` }}>
            Loading announcements...
          </p>
        )}
        {error && (
          <p className="text-[13px]" style={{ color: THEME.primary }}>
            {error}
          </p>
        )}

        {!loading && !error && announcements.length > 0
          ? announcements.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-lg transition-colors"
                style={{
                  backgroundColor: THEME.surface1,
                  border: `1px solid ${THEME.surface2}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="text-[17px] font-bold truncate"
                    style={{ color: THEME.primary }}
                  >
                    {a.title}
                  </h3>
                  <span
                    className="text-[12px] shrink-0 ml-3 text-gray-500"
                    style={{ color: `${THEME.primary}99` }}
                  >
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                </div>
                <p
                  className="text-[12px] mt-1"
                  style={{ color: `${THEME.primary}99` }}
                >
                  By {a.author}
                </p>
                <p
                  className="text-[15px] mt-2 leading-6"
                  style={{ color: `${THEME.primary}CC` }}
                >
                  {a.content}
                </p>
              </div>
            ))
          : !loading &&
            !error && (
              <p
                className="text-[13px]"
                style={{ color: `${THEME.primary}99` }}
              >
                No announcements found.
              </p>
            )}
      </div>
    </Card>
  );
};

/* -------------------- Student Home -------------------- */
const StatTile: React.FC<{
  label: string;
  value: React.ReactNode;
  tone: "primary" | "success" | "warn";
}> = ({ label, value, tone }) => {
  const tones = {
    primary: {
      bg: `${THEME.surface1}`,
      border: `${THEME.surface2}`,
      text: THEME.primary,
    },
    success: {
      bg: "#ECFEFF00", // not used; just keep structure
      border: THEME.surface2,
      text: THEME.accent,
    },
    warn: {
      bg: THEME.surface1,
      border: THEME.surface2,
      text: THEME.primary,
    },
  } as const;

  return (
    <div
      className="p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
      style={{
        backgroundColor: tones[tone].bg,
        borderColor: tones[tone].border,
      }}
    >
      <div
        className="text-[13px] font-medium opacity-80"
        style={{ color: tones[tone].text }}
      >
        {label}
      </div>
      <div
        className="mt-2 text-[28px] leading-tight font-semibold tracking-tight"
        style={{ color: tones[tone].text }}
      >
        {value}
      </div>
    </div>
  );
};

const StudentHome = () => {
  const authContext = useContext(AuthContext);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [activeRequestsCount, setActiveRequestsCount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">(
    "Paid"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authContext?.user) {
      Promise.all([
        getStudentProfile(authContext.user.id),
        getStudentMaintenanceRequests(authContext.user.id),
        getStudentPayments(authContext.user.id),
      ])
        .then(([profileData, requestsData, paymentsData]) => {
          if (profileData) setProfile(profileData);

          const activeCount = requestsData.filter(
            (r) => r.status === "Pending" || r.status === "In Progress"
          ).length;
          setActiveRequestsCount(activeCount);

          const pendingPayment = paymentsData.find(
            (p) => p.status === "Pending"
          );
          setPaymentStatus(pendingPayment ? "Pending" : "Paid");
        })
        .catch(() => setError("Failed to load dashboard data."))
        .finally(() => setLoading(false));
    }
  }, [authContext]);

  if (loading) return <div className="text-sm text-slate-600">Loading...</div>;

  if (error) return <div className="text-sm text-blue-700">{error}</div>;

  if (!profile)
    return <div className="text-sm text-slate-600">Profile not found.</div>;

  return (
    <div>
      {/* Top card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            Welcome, {profile.name}!
          </h1>
          <p className="text-xs text-slate-500">
            Here’s your current hostel status
          </p>
        </div>

        {/* Stat tiles */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Room Number */}
          <div className="rounded-xl border border-slate-200 bg-sky-50 p-4">
            <p className="text-[15px] font-bold text-sky-700">Room Number</p>
            <p className="mt-2 text-2xl font-medium text-sky-900">
              {profile.roomNumber || "Not Assigned"}
            </p>
          </div>

          {/* Payment Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[15px] font-bold text-slate-600">
              Payment Status
            </p>
            <div className="mt-2">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                  paymentStatus === "Paid"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-1.5 w-1.5 rounded-full",
                    paymentStatus === "Paid"
                      ? "bg-emerald-600"
                      : "bg-amber-600",
                  ].join(" ")}
                />
                {paymentStatus}
              </span>
            </div>
          </div>

          {/* Active Requests */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[15px] font-bold text-slate-600">
              Active Requests
            </p>
            <p className="mt-2 text-2xl font-medium text-slate-900">
              {activeRequestsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Announcements remain as-is */}
      <AnnouncementsList />
    </div>
  );
};

// ---------------- PROFILE — NEUMORPHISM (BLUE — DARKER) ----------------
// const themeProfile = {
//   base: "#E6EFF7", // darker base than before
//   primary: "#3B74B0", // deeper blue
//   textDark: "#08141F",
// };

const themeProfile = {
  base: "#ecf3faff",
  primary: "#558dcaff",
  textDark: "#818385ff",
};

const MyProfile = () => {
  const authContext = useContext(AuthContext);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editableProfile, setEditableProfile] = useState<StudentProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authContext?.user) {
      setError("Not logged in.");
      setLoading(false);
      return;
    }

    getStudentProfile(authContext.user.id)
      .then((data) => {
        setProfile(data);
        setEditableProfile(data);
      })
      .catch(() => setError("Could not load student profile."))
      .finally(() => setLoading(false));
  }, [authContext]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableProfile) return;
    setEditableProfile({ ...editableProfile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editableProfile || !authContext?.user) return;
    const updated = await updateStudentProfile(authContext.user.id, {
      phone: editableProfile.phone,
      guardianContact: editableProfile.guardianContact,
      emergencyContact: editableProfile.emergencyContact,
    });
    setProfile(updated);
    setEditableProfile(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableProfile(profile);
    setIsEditing(false);
  };

  if (loading)
    return (
      <div style={{ color: themeProfile.primary }}>Loading profile...</div>
    );
  if (error) return <div style={{ color: themeProfile.primary }}>{error}</div>;
  if (!profile || !editableProfile) return <div>Profile not found.</div>;

  const neumoCard = {
    background: themeProfile.base,
    borderRadius: "24px",
    boxShadow: `12px 12px 28px rgba(0,0,0,0.10), -12px -12px 28px rgba(255,255,255,1)`,
  };

  const neumoInput = {
    background: themeProfile.base,
    borderRadius: "9999px",
    boxShadow: `inset 4px 4px 8px rgba(0,0,0,0.10), inset -4px -4px 8px rgba(255,255,255,0.9)`,
    border: "none",
    color: themeProfile.textDark,
  };

  const DetailItem = ({ label, value, editable, name }: any) => (
    <div>
      <p
        className="text-[12px] mb-1 font-medium"
        style={{ color: `${themeProfile.primary}99` }}
      >
        {label}
      </p>

      {editable ? (
        <input
          type="text"
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 text-[14px]"
          style={neumoInput}
        />
      ) : (
        <p
          className="w-full px-4 py-2.5 text-[14px] font-semibold"
          style={{ ...neumoInput, opacity: 0.9 }}
        >
          {value || "N/A"}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ ...neumoCard, padding: "32px" }}>
      <h2
        className="text-[22px] font-bold mb-6"
        style={{ color: themeProfile.primary }}
      >
        My Profile
      </h2>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* LEFT PROFILE CARD */}
        <div style={{ ...neumoCard, padding: "32px", textAlign: "center" }}>
          {/* SIMPLE LETTER AVATAR */}
          <div
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full text-[34px] font-bold"
            style={{
              background: `${themeProfile.primary}22`,
              color: themeProfile.primary,
            }}
          >
            {profile.name?.charAt(0).toUpperCase()}
          </div>

          <h3
            className="mt-4 text-[17px] font-semibold"
            style={{ color: themeProfile.textDark }}
          >
            {profile.name}
          </h3>

          <p
            className="text-[13px]"
            style={{ color: `${themeProfile.primary}99` }}
          >
            {profile.studentId}
          </p>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 w-full px-4 py-2 text-white rounded-full text-[14px]"
              style={{
                background: themeProfile.primary,
                boxShadow: `0 6px 14px rgba(59,116,176,0.45)`,
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-2 space-y-10">
          <div style={{ ...neumoCard, padding: "24px" }}>
            <h3
              className="text-[17px] font-bold mb-4"
              style={{ color: themeProfile.primary }}
            >
              Personal & Hostel Information
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <DetailItem label="Email" value={profile.email} />
              <DetailItem
                label="Phone"
                value={editableProfile.phone}
                editable={isEditing}
                name="phone"
              />
              <DetailItem label="Room Number" value={profile.roomNumber} />
            </div>
          </div>

          <div style={{ ...neumoCard, padding: "24px" }}>
            <h3
              className="text-[17px] font-bold mb-4"
              style={{ color: themeProfile.primary }}
            >
              Emergency Contacts
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <DetailItem
                label="Guardian Contact"
                value={editableProfile.guardianContact}
                editable={isEditing}
                name="guardianContact"
              />
              <DetailItem
                label="Emergency Contact"
                value={editableProfile.emergencyContact}
                editable={isEditing}
                name="emergencyContact"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-5 py-2 text-[14px] rounded-full"
                style={{ ...neumoInput }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-[14px] text-white rounded-full"
                style={{
                  background: themeProfile.primary,
                  boxShadow: `0 6px 14px rgba(59,116,176,0.45)`,
                }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= THEME (kept lightweight, no logic dependency) ================= */
const themePay = {
  base: "#edf3fbff",
  primary: "#2881e1ff",
  textDark: "#5b7998ff",
};

/* ================= PAYMENT MODAL ================= */
const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  payment: Payment | null;
  isLoading: boolean;
}> = ({ isOpen, onClose, onSubmit, payment, isLoading }) => {
  if (!isOpen || !payment) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "#0B122099" }}
    >
      <div
        className="bg-white rounded-xl shadow-[0_20px_50px_rgba(16,24,40,0.18)] w-full max-w-md p-5"
        style={{ border: `1px solid ${themePay.base}` }}
      >
        <div
          className="flex justify-between items-center border-b pb-3"
          style={{ borderColor: themePay.base }}
        >
          <h2
            className="text-[16px] font-semibold"
            style={{ color: themePay.primary }}
          >
            Complete Your Payment
          </h2>
          <button
            onClick={onClose}
            className="text-[30px] leading-none"
            style={{ color: `${themePay.primary}99` }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-3">
          <p
            className="text-center text-[18px]"
            style={{ color: themePay.primary }}
          >
            Amount Due:&nbsp;
            <span className="font-semibold" style={{ color: themePay.primary }}>
              LKR {payment.amount.toFixed(2)}
            </span>
          </p>
          <p
            className="text-center text-[12px] mt-1"
            style={{ color: `${themePay.primary}99` }}
          >
            This is a simulated payment gateway for demonstration.
          </p>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div>
            <label
              htmlFor="card-number"
              className="block text-[14px] font-medium"
              style={{ color: `${themePay.primary}B3` }}
            >
              Card Number
            </label>
            <input
              id="card-number"
              type="text"
              placeholder="**** **** **** 1234"
              className="mt-1 block w-full rounded-md shadow-sm p-2 text-[13px]"
              style={{ border: `1px solid ${themePay.base}` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="expiry"
                className="block text-[14px] font-medium"
                style={{ color: `${themePay.primary}B3` }}
              >
                Expiry Date
              </label>
              <input
                id="expiry"
                type="text"
                placeholder="MM / YY"
                className="mt-1 block w-full rounded-md shadow-sm p-2 text-[13px]"
                style={{ border: `1px solid ${themePay.base}` }}
              />
            </div>
            <div>
              <label
                htmlFor="cvc"
                className="block text-[14px] font-medium"
                style={{ color: `${themePay.primary}B3` }}
              >
                CVC
              </label>
              <input
                id="cvc"
                type="text"
                placeholder="123"
                className="mt-1 block w-full rounded-md shadow-sm p-2 text-[13px]"
                style={{ border: `1px solid ${themePay.base}` }}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2.5 text-[15px] font-medium text-white rounded-md hover:opacity-95 disabled:opacity-60"
              style={{ backgroundColor: themePay.primary }}
            >
              {isLoading
                ? "Processing..."
                : `Pay LKR ${payment.amount.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================= PAYMENTS (NEUMORPHIC TABLE) ================= */
const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const authContext = useContext(AuthContext);

  const fetchPaymentData = useCallback(() => {
    if (!authContext?.user) return;
    setLoading(true);
    Promise.all([
      getStudentPayments(authContext.user.id),
      getStudentProfile(authContext.user.id),
    ])
      .then(([p, prof]) => {
        setPayments(p);
        setProfile(prof);
      })
      .catch(() => setError("Failed to load payment data."))
      .finally(() => setLoading(false));
  }, [authContext]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const handlePayClick = (p: Payment) => {
    setSelectedPayment(p);
    setIsModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment || !authContext?.user) return;
    setIsPaying(true);
    try {
      await makeStudentPayment(authContext.user.id, selectedPayment.id);
      setIsModalOpen(false);
      fetchPaymentData();
    } catch {
      alert("Payment processing failed.");
    } finally {
      setIsPaying(false);
    }
  };

  /* ========== ORIGINAL INVOICE DOWNLOAD (UNCHANGED LOGIC) ========== */
  const handleDownloadInvoice = (payment: Payment) => {
    if (!profile) return;

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${payment.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 2rem; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; padding: 2rem; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
            .header img { width: 80px; height: 80px; }
            .header .title { text-align: right; }
            .title h1 { color: #14654d; margin: 0; font-size: 2.5rem; }
            .title p { margin: 0; color: #555; font-size: 0.9rem; }
            .student-details { margin-bottom: 2rem; }
            .student-details p { margin: 0.25rem 0; }
            .invoice-table { width: 100%; text-align: left; border-collapse: collapse; }
            .invoice-table thead tr { background-color: #14654d; color: #fff; }
            .invoice-table th, .invoice-table td { padding: 0.75rem; }
            .invoice-table tbody tr { border-bottom: 1px solid #eee; }
            .total-section { text-align: right; margin-top: 2rem; }
            .total-section p { font-size: 1.2rem; font-weight: bold; margin: 0.5rem 0; }
            .status { font-size: 1.5rem; font-weight: bold; margin-top: -1rem; margin-bottom: 1rem; }
            .status.paid { color: #22c55e; }
            .status.pending { color: #ef4444; }
            .footer { margin-top: 3rem; text-align: center; font-size: 0.8rem; color: #777; }
            @media print {
              .invoice-box { box-shadow: none; border: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Rajarata_logo.png/250px-Rajarata_logo.png" alt="Rajarata University Logo" />
                <p><strong>Rajarata University of Sri Lanka</strong></p>
                <p>Faculty of Technology</p>
              </div>
              <div class="title">
                <h1>INVOICE</h1>
                <p>Invoice #: ${payment.id}</p>
                <p>Issued: ${new Date(payment.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div class="student-details">
              <p><strong>Bill To:</strong></p>
              <p>${profile.name}</p>
              <p>${profile.studentId}</p>
              <p>${profile.email}</p>
              <p>Room: ${profile.roomNumber || "N/A"}</p>
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hostel Fee - Academic Year ${payment.academicYear}</td>
                  <td>${payment.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <p class="status ${payment.status.toLowerCase()}">Status: ${
      payment.status
    }</p>
              <p>Total: LKR ${payment.amount.toFixed(2)}</p>
            </div>

            <div class="footer">
              <p>Thank you for your payment.</p>
              <p>If you have any questions, please contact the hostel administration.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(invoiceHtml);
    printWindow?.document.close();
    printWindow?.focus();
    setTimeout(() => {
      printWindow?.print();
      printWindow?.close();
    }, 250);
  };
  /* ================= END ORIGINAL INVOICE ================= */

  if (loading) return <div style={{ color: themePay.primary }}>Loading...</div>;
  if (error) return <div style={{ color: themePay.primary }}>{error}</div>;

  return (
    <>
      <div
        style={{
          background: themePay.base,
          borderRadius: "26px",
          padding: "32px",
          boxShadow: `
            10px 10px 22px rgba(86,136,177,0.15),
            -10px -10px 22px rgba(255,255,255,0.8)
          `,
        }}
      >
        <h2
          className="text-[22px] font-semibold mb-5"
          style={{ color: themePay.primary }}
        >
          Payment History
        </h2>

        <div className="overflow-x-auto">
          <table
            className="min-w-full rounded-xl overflow-hidden"
            style={{
              background: themePay.base,
              borderRadius: "20px",
              boxShadow: `
                inset 3px 3px 8px rgba(0,0,0,0.09),
                inset -3px -3px 8px rgba(255,255,255,0.9)
              `,
            }}
          >
            <thead>
              <tr
                style={{
                  background: themePay.primary,
                  color: "#fff",
                  fontSize: "13px",
                }}
              >
                <th className="px-4 py-3 text-left font-medium">
                  Academic Year
                </th>
                <th className="px-4 py-3 text-left font-medium">Date Issued</th>
                <th className="px-4 py-3 text-left font-medium">
                  Amount (LKR)
                </th>
                <th className="px-[85px] py-3 text-left font-medium">Status</th>
                <th className="px-[80px] py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="text-[14px]"
                  style={{ color: themePay.textDark }}
                >
                  <td className="px-4 py-3 font-semibold">
                    Year {p.academicYear}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{p.amount.toFixed(2)}</td>

                  <td className="px-20 py-3">
                    <span
                      className="px-[10px] py-1 text-[14px] rounded-full font-medium"
                      style={{
                        background:
                          p.status === "Pending"
                            ? `${themePay.primary}26`
                            : "#54cf83aa",
                        color:
                          p.status === "Pending" ? themePay.primary : "#0e6f3b",
                      }}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.status === "Pending" ? (
                        <button
                          className="px-4 py-1.5 rounded-full text-white text-[12px]"
                          style={{ background: themePay.primary }}
                          onClick={() => handlePayClick(p)}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span style={{ color: `${themePay.primary}aa` }}>
                          Paid
                        </span>
                      )}

                      <button
                        onClick={() => handleDownloadInvoice(p)}
                        className="px-3 py-1.5 rounded-full text-[12px] border hover:opacity-90"
                        style={{
                          color: themePay.primary,
                          borderColor: themePay.primary,
                        }}
                        title="Download Invoice"
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[13px]">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        payment={selectedPayment}
        isLoading={isPaying}
      />
    </>
  );
};

/* -------------------- Maintenance — Neumorphism (Orange) -------------------- */
const themeMaintenance = {
  base: "#edf3fbff",
  primary: "#2881e1ff",
  textDark: "#5b7998ff",
};

const Maintenance = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authContext = useContext(AuthContext);

  const neumoCard = {
    background: themeMaintenance.base,
    borderRadius: "22px",
    boxShadow: `12px 12px 26px rgba(0,0,0,.08), -12px -12px 26px #ffffff`,
  };

  // initial load (unchanged behavior)
  useEffect(() => {
    if (!authContext?.user) return;
    setLoading(true);
    getStudentMaintenanceRequests(authContext.user.id)
      .then(setRequests)
      .catch(() => setError("Failed to load maintenance requests"))
      .finally(() => setLoading(false));
  }, [authContext]);

  // helper: refresh list
  const refresh = async () => {
    if (!authContext?.user) return;
    const fresh = await getStudentMaintenanceRequests(authContext.user.id);
    setRequests(fresh);
  };

  // submit with payload-compat shim + surfaced server error
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authContext?.user) return;

    const trimmedIssue = issue.trim();
    const trimmedDesc = description.trim();
    if (!trimmedIssue || !trimmedDesc) return;

    // ---- COMPAT PAYLOAD ----
    // Includes camelCase + snake_case + common aliases.
    // Backends ignore unknown fields, so this won’t break strict handlers.
    const payload: any = {
      studentId: authContext.user.id,
      student_id: authContext.user.id, // alias
      issue: trimmedIssue,
      title: trimmedIssue, // alias some APIs use
      description: trimmedDesc,
      details: trimmedDesc, // alias some APIs use
      submittedAt: new Date().toISOString(), // harmless if ignored
    };

    try {
      setIsSubmitting(true);
      await submitMaintenanceRequest(payload);
      setMessage("✅ Submitted Successfully!");
      setIssue("");
      setDescription("");
      await refresh();
    } catch (err: any) {
      // Try to surface server-side validation message (from 400)
      let serverMsg = "❌ Failed to submit. Check required fields.";
      try {
        if (err?.response) {
          // axios-style
          serverMsg =
            err.response.data?.message ||
            err.response.data?.error ||
            JSON.stringify(err.response.data);
        } else if (err?.message) {
          serverMsg = err.message;
        }
      } catch {}
      setMessage(serverMsg || "❌ Failed to submit.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* FORM */}
      <div style={{ ...neumoCard, padding: "28px" }}>
        <h2
          className="text-[20px] font-semibold"
          style={{ color: themeMaintenance.primary }}
        >
          Submit Maintenance Request
        </h2>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-[13px] mb-1"
              style={{ color: `${themeMaintenance.primary}B3` }}
            >
              Issue
            </label>
            <input
              type="text"
              required
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full px-4 py-2.5 text-[14px] rounded-full"
              placeholder="example: Fan not working"
              style={{
                background: themeMaintenance.base,
                border: "none",
                boxShadow:
                  "inset 4px 4px 8px rgba(0,0,0,0.07), inset -4px -4px 8px rgba(255,255,255,.85)",
                color: themeMaintenance.textDark,
              }}
            />
          </div>

          <div>
            <label
              className="block text-[13px] mb-1"
              style={{ color: `${themeMaintenance.primary}B3` }}
            >
              Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-[14px] rounded-2xl"
              placeholder="give more detail..."
              style={{
                background: themeMaintenance.base,
                border: "none",
                boxShadow:
                  "inset 4px 4px 8px rgba(0,0,0,0.07), inset -4px -4px 8px rgba(255,255,255,.85)",
                color: themeMaintenance.textDark,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-[14px] text-white rounded-full hover:opacity-95 disabled:opacity-60"
            style={{
              background: themeMaintenance.primary,
              boxShadow: "0 6px 14px rgba(230,126,34,.35)",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>

          {message && (
            <p
              className="text-[13px] mt-1 break-words"
              style={{ color: themeMaintenance.primary }}
            >
              {message}
            </p>
          )}
        </form>
      </div>

      {/* HISTORY */}
      <div style={{ ...neumoCard, padding: "28px" }}>
        <h2
          className="text-[20px] font-semibold mb-4"
          style={{ color: themeMaintenance.primary }}
        >
          Request History
        </h2>

        {loading && (
          <p
            className="text-[13px]"
            style={{ color: `${themeMaintenance.primary}99` }}
          >
            Loading...
          </p>
        )}
        {error && (
          <p
            className="text-[13px]"
            style={{ color: themeMaintenance.primary }}
          >
            {error}
          </p>
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {requests.length > 0
            ? requests.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl"
                  style={{
                    background: themeMaintenance.base,
                    borderRadius: "18px",
                    boxShadow:
                      "inset 3px 3px 8px rgba(0,0,0,0.06), inset -3px -3px 8px rgba(255,255,255,.85)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: themeMaintenance.textDark }}
                    >
                      {r.issue}
                    </p>
                    <span
                      className="text-[11px] px-3 py-1 rounded-full font-medium"
                      style={{
                        background:
                          r.status === "Completed"
                            ? "#EBFFF2"
                            : r.status === "In Progress"
                            ? "#FFF3D6"
                            : "#FFEDE6",
                        color:
                          r.status === "Completed"
                            ? "#1c816eff"
                            : r.status === "In Progress"
                            ? "#30d7daff"
                            : "#549fdbff",
                      }}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p
                    className="text-[12px] mt-1"
                    style={{ color: `${themeMaintenance.primary}99` }}
                  >
                    {new Date(r.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            : !loading && (
                <p
                  className="text-[13px]"
                  style={{ color: `${themeMaintenance.primary}99` }}
                >
                  No requests available
                </p>
              )}
        </div>
      </div>
    </div>
  );
};

/* -------------------- THEME (green-ish clearance) -------------------- */
const themeClr = {
  base: "#edf3fbff",
  primary: "#2881e1ff",
  textDark: "#5b7998ff",
};

/* -------------------- CLEARANCE (NEUMORPHIC, FULLY FUNCTIONAL) -------------------- */
const Clearance: React.FC = () => {
  const [clearance, setClearance] = useState<ClearanceRequest | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  const neumoCard: React.CSSProperties = {
    background: themeClr.base,
    borderRadius: "26px",
    boxShadow: `
      10px 10px 22px rgba(0,0,0,0.13),
      -10px -10px 22px rgba(255,255,255,0.9)
    `,
  };

  const fetchData = useCallback(() => {
    if (!authContext?.user) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getStudentClearanceStatus(authContext.user.id),
      getStudentProfile(authContext.user.id),
    ])
      .then(([clr, p]) => {
        setClearance(clr);
        setProfile(p);
      })
      .catch(() => setError("Failed to load clearance data."))
      .finally(() => setLoading(false));
  }, [authContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApply = async () => {
    if (!authContext?.user) return;
    await applyForClearance(authContext.user.id);
    fetchData();
  };

  // EXACT download behavior kept (opens printable window with styled HTML)
  const handleDownloadClearance = () => {
    if (!profile || !clearance) return;

    const formHtml = `
      <html>
        <head>
          <title>Hostel Clearance Form - ${profile.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 2rem; color: #333; }
            .header { text-align: center; border-bottom: 2px solid ${
              themeClr.primary
            }; padding-bottom: 1rem; }
            .header img { width: 80px; height: 80px; }
            h1 { color: ${
              themeClr.primary
            }; font-size: 1.6rem; margin-top: 0.5rem; }
            h2 { color: ${
              themeClr.primary
            }; font-size: 1.2rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-top: 1.6rem; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
            .details-grid p { margin: 0.25rem 0; font-size: 0.95rem; }
            .steps { margin-top: 1.2rem; }
            .step { background-color: #f9fdfb; border: 1px solid #dfeee7; border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 0.8rem; }
            .step-header { display: flex; justify-content: space-between; align-items: center; }
            .step-name { font-weight: 600; font-size: 1rem; }
            .status { font-weight: 700; }
            .approved { color: #16a34a; } .rejected { color: #ef4444; } .pending { color: #f59e0b; }
            .remarks { font-size: 0.9rem; color: #555; margin-top: 0.35rem; }
            .footer { margin-top: 2.5rem; text-align: center; font-size: 0.85rem; color: #777; }
            .sig { margin-top: 2rem; }
            @media print { body { margin: 1rem; } }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Rajarata_logo.png/250px-Rajarata_logo.png" alt="Rajarata University Logo" />
            <h1>Hostel Clearance Form</h1>
            <p>Faculty of Technology, Rajarata University of Sri Lanka</p>
          </div>

          <h2>Student Details</h2>
          <div class="details-grid">
            <div>
              <p><strong>Name:</strong> ${profile.name}</p>
              <p><strong>Student ID:</strong> ${profile.studentId}</p>
              <p><strong>Email:</strong> ${profile.email}</p>
            </div>
            <div>
              <p><strong>Room Number:</strong> ${
                profile.roomNumber || "N/A"
              }</p>
              <p><strong>Academic Year:</strong> ${profile.year}</p>
              <p><strong>Date Issued:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <h2>Clearance Status</h2>
          <div class="steps">
            ${clearance.steps
              .map(
                (step) => `
                <div class="step">
                  <div class="step-header">
                    <span class="step-name">${step.name}</span>
                    <span class="status ${step.status
                      .replace(" ", "-")
                      .toLowerCase()} ${step.status.toLowerCase()}">
                      ${
                        step.status.charAt(0).toUpperCase() +
                        step.status.slice(1)
                      }
                    </span>
                  </div>
                  <p class="remarks"><em>${step.remarks || ""}</em></p>
                </div>`
              )
              .join("")}
          </div>

          <div class="sig">
            <p>This document confirms that the student has been cleared of all hostel responsibilities as of the date issued above.</p>
            <br/><br/><br/>
            <p>______________________________</p>
            <p><strong>Warden's Signature</strong></p>
          </div>

          <div class="footer">
            This is a system-generated document. &copy; ${new Date().getFullYear()} Rajarata University Hostel Management System.
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win?.document.write(formHtml);
    win?.document.close();
    win?.focus();
    setTimeout(() => {
      win?.print();
      win?.close();
    }, 250);
  };

  if (loading) return <div style={{ color: themeClr.primary }}>Loading...</div>;
  if (error) return <div style={{ color: themeClr.primary }}>{error}</div>;
  if (!clearance)
    return <div style={{ color: themeClr.primary }}>Not available</div>;

  return (
    <div style={{ ...neumoCard, padding: "32px" }}>
      <h2
        className="text-[22px] font-semibold mb-3"
        style={{ color: themeClr.primary }}
      >
        Hostel Clearance
      </h2>

      <p
        className="text-[13px] mb-8"
        style={{ color: `${themeClr.primary}AA` }}
      >
        Track your clearance progress step-by-step
      </p>

      {/* NOT STARTED */}
      {clearance.status === "Not Started" && (
        <div style={{ ...neumoCard, padding: "48px", textAlign: "center" }}>
          <h3
            className="text-[17px] font-semibold"
            style={{ color: themeClr.textDark }}
          >
            You haven’t applied for clearance yet
          </h3>
          <p
            className="text-[13px] mt-1 mb-4"
            style={{ color: `${themeClr.primary}99` }}
          >
            Click below to begin the clearance process
          </p>

          <button
            onClick={handleApply}
            className="px-6 py-2.5 text-[14px] rounded-full text-white"
            style={{
              background: themeClr.primary,
              boxShadow: `0 6px 14px rgba(61,158,108,.4)`,
            }}
          >
            Apply for Clearance
          </button>
        </div>
      )}

      {/* STARTED */}
      {clearance.status !== "Not Started" && (
        <div className="space-y-8">
          {/* STATUS CARD */}
          <div style={{ ...neumoCard, padding: "22px", textAlign: "center" }}>
            <p
              className="text-[13px] mb-1"
              style={{ color: `${themeClr.primary}99` }}
            >
              Current Status
            </p>
            <span
              className="text-[20px] font-semibold"
              style={{ color: themeClr.primary }}
            >
              {clearance.status}
            </span>

            {clearance.status === "Approved" && (
              <div className="mt-4">
                <button
                  onClick={handleDownloadClearance}
                  className="px-5 py-2 text-[13px] rounded-full text-white"
                  style={{
                    background: themeClr.primary,
                    boxShadow: `0 6px 14px rgba(61,158,108,.35)`,
                  }}
                >
                  Download Clearance Form
                </button>
              </div>
            )}
          </div>

          {/* STEPS */}
          <div className="space-y-4">
            {clearance.steps.map((step, i) => (
              <div key={i} style={{ ...neumoCard, padding: "22px" }}>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: themeClr.textDark }}
                  >
                    {step.name}
                  </span>
                  <span
                    className="text-[13px] font-semibold capitalize"
                    style={{ color: themeClr.primary }}
                  >
                    {step.status}
                  </span>
                </div>
                <p
                  className="text-[12px] mt-2"
                  style={{ color: `${themeClr.primary}AA` }}
                >
                  {step.remarks}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------- Router Container -------------------- */
const StudentDashboard: React.FC = () => {
  return (
    <>
      <UseInterFont />
      {/* apply smooth font to all children */}
      <div
        style={{
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}
      >
        <DashboardLayout>
          <Routes>
            <Route index element={<StudentHome />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="payments" element={<Payments />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="clearance" element={<Clearance />} />
            <Route path="chatbot" element={<ChatbotPage />} />
          </Routes>
        </DashboardLayout>
      </div>
    </>
  );
};

export default StudentDashboard;
