import React, { useState } from "react";
import { Link } from "react-router-dom";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { apiRegisterStudent, apiRegisterWarden } from "../services/api";
import { UserRole } from "../types";

const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [emailValid, setEmailValid] = useState(true);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") validatePassword(e.target.value);
    if (e.target.name === "email") validateEmail(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "image/png", "image/jpeg"];
      if (!validTypes.includes(file.type)) {
        alert("Only PDF, PNG, or JPEG files are allowed.");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, [e.target.name]: file });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  };

  const validatePassword = (password: string) => {
    const strongRegex =
      /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?#&])[A-Za-z\d@$!%?#&]{8,}$/;
    if (strongRegex.test(password)) {
      setPasswordStrength("Strong password ✅");
    } else {
      setPasswordStrength(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!emailValid) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      if (role === UserRole.Student) {
        await apiRegisterStudent(formData);
      } else {
        await apiRegisterWarden(formData);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e5f3e1]">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-green-600">
            Registration Successful!
          </h2>
          <p className="mt-4 text-gray-600">
            Your account has been created. It is pending approval from a{" "}
            {role === UserRole.Student ? "warden" : "system administrator"}.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 mt-6 text-sm font-medium text-white bg-[#14654d] rounded-md hover:bg-opacity-90"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const commonFields = (
    <>
      <input
        name="name"
        type="text"
        required
        placeholder="Full Name"
        onChange={handleInputChange}
        className="input-field"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email Address"
        onChange={handleInputChange}
        className="input-field"
      />
      {!emailValid && (
        <p className="text-red-500 text-xs">Please enter a valid email.</p>
      )}
      <input
        name="phone"
        type="tel"
        required
        placeholder="Phone Number"
        onChange={handleInputChange}
        className="input-field"
      />
      <select
        name="gender"
        required
        onChange={handleInputChange}
        className="input-field"
        defaultValue=""
      >
        <option value="" disabled>
          Select your Gender
        </option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </>
  );

  const passwordFields = (
    <>
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="Password"
          onChange={handleInputChange}
          className="input-field pr-10"
        />
        <span
          className="absolute right-3 top-3 cursor-pointer text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          {/* {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />} */}
        </span>
      </div>
      {passwordStrength && (
        <p
          className={`text-xs ${
            passwordStrength.includes("✅") ? "text-green-600" : "text-red-500"
          }`}
        >
          {passwordStrength}
        </p>
      )}
      <input
        name="confirmPassword"
        type="password"
        required
        placeholder="Confirm Password"
        onChange={handleInputChange}
        className="input-field"
      />
    </>
  );

  const studentFields = (
    <>
      <input
        name="studentId"
        type="text"
        required
        placeholder="Student ID / Registration No"
        onChange={handleInputChange}
        className="input-field"
      />
      {commonFields}
      <input
        name="course"
        type="text"
        required
        placeholder="Course / Department"
        onChange={handleInputChange}
        className="input-field"
      />
      <input
        name="guardianContact"
        type="tel"
        required
        placeholder="Guardian Contact"
        onChange={handleInputChange}
        className="input-field"
      />
      <input
        name="emergencyContact"
        type="tel"
        required
        placeholder="Emergency Contact"
        onChange={handleInputChange}
        className="input-field"
      />
      {passwordFields}
    </>
  );

  const wardenFields = (
    <>
      <input
        name="wardenId"
        type="text"
        required
        placeholder="Warden ID"
        onChange={handleInputChange}
        className="input-field"
      />
      {commonFields}
      <input
        name="username"
        type="text"
        required
        placeholder="Username"
        onChange={handleInputChange}
        className="input-field"
      />
      {passwordFields}
      <div>
        <label className="text-sm text-gray-700">
          Attach your Warden ID image (PDF/PNG/JPEG)
        </label>
        <input
          name="wardenIdImage"
          type="file"
          accept=".pdf,.png,.jpeg,.jpg"
          onChange={handleFileChange}
          className="input-field"
        />
      </div>
      <div>
        <label className="text-sm text-gray-700">
          Attach your Profile Photo (PDF/PNG/JPEG)
        </label>
        <input
          name="profileImage"
          type="file"
          accept=".pdf,.png,.jpeg,.jpg"
          onChange={handleFileChange}
          className="input-field"
        />
      </div>
    </>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1350&q=80')",
      }}
    >
      <div className="w-full max-w-md p-8 space-y-6 rounded-2xl shadow-lg bg-white/30 backdrop-blur-md border border-white/40">
        <style>{`
          .input-field {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #D1D5DB;
            border-radius: 0.5rem;
            background-color: rgba(255, 255, 255, 0.8);
            color: #000;
            font-size: 14px;
          }
          .input-field::placeholder {
            color: #555;
          }
        `}</style>

        <div className="text-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Rajarata_logo.png/250px-Rajarata_logo.png"
            alt="Rajarata University Logo"
            className="w-20 h-20 mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-900">
            Create an Account
          </h2>
        </div>

        <div className="flex justify-center p-1 bg-[#cbe6c2] rounded-md">
          <button
            type="button"
            onClick={() => setRole(UserRole.Student)}
            className={`w-1/2 px-4 py-2 text-sm font-medium rounded-md ${
              role === UserRole.Student ? "bg-white shadow" : ""
            }`}
          >
            I am a Student
          </button>
          <button
            type="button"
            onClick={() => setRole(UserRole.Warden)}
            className={`w-1/2 px-4 py-2 text-sm font-medium rounded-md ${
              role === UserRole.Warden ? "bg-white shadow" : ""
            }`}
          >
            I am a Warden
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {role === UserRole.Student ? studentFields : wardenFields}
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-medium text-white bg-[#14654d] rounded-md hover:bg-opacity-90 disabled:bg-[#14654d]/50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="text-sm text-center text-gray-700">
          <p>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#14654d] hover:text-[#0f4a38]"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-2">
            <Link
              to="/welcome"
              className="font-medium text-[#14654d] hover:text-[#0f4a38]"
            >
              ← Back to Welcome
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
