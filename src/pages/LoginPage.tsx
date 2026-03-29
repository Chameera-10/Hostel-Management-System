import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserRole } from "../types";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (authContext) {
      try {
        const { user } = await authContext.login(email, password);
        if (user) {
          if (user.accountStatus === "pending") {
            setError(
              "Your account is pending approval. Please wait for activation."
            );
            authContext.logout(); // Log out immediately, they can't proceed
          } else if (user.accountStatus === "disabled") {
            setError(
              "Your account has been disabled. Please contact an administrator."
            );
            authContext.logout();
          } else if (user.accountStatus === "approved") {
            switch (user.role) {
              case UserRole.Admin:
                navigate("/admin");
                break;
              case UserRole.Warden:
                navigate("/warden");
                break;
              case UserRole.Student:
                navigate("/student");
                break;
              default:
                navigate("/");
            }
          } else {
            setError("Invalid account status.");
            authContext.logout();
          }
        }
      } catch (err: any) {
        setError(err.message || "Invalid credentials. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#e5f3e1]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Rajarata_logo.png/250px-Rajarata_logo.png"
            alt="Rajarata University Logo"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            Hostel Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">Faculty of Technology</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-[#14654d] focus:border-[#14654d] focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-[#14654d] focus:border-[#14654d] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#14654d] border border-transparent rounded-md group hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#14654d] disabled:bg-[#14654d]/50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-500">
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-[#14654d] hover:text-[#0f4a38]"
            >
              Register here
            </Link>
          </p>
          <p className="mt-2">
            <Link
              to="/welcome"
              className="font-medium text-[#14654d] hover:text-[#0f4a38]"
            >
              &larr; Back to Welcome
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
