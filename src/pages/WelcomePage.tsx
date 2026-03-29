import React from "react";
import { motion } from "framer-motion";
import { HashLink as Link } from "react-router-hash-link";
import {
  Home,
  CreditCard,
  Bell,
  Wrench,
  Users,
  CheckCircle2,
  ArrowDownCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import aboutImage from "../assets/about.jpg";
import photo1 from "../assets/team/member1.png";
import photo2 from "../assets/team/member2.png";
import photo3 from "../assets/team/member3.png";
import photo4 from "../assets/team/member4.png";
import photo5 from "../assets/team/member5.png";
import photo6 from "../assets/team/member6.png";

const HEADER_H = 64;

const team = [
  { name: "Chameera", image: photo1 },
  { name: "M.R.R.Banu", image: photo2 },
  { name: "Nadun", image: photo3 },
  { name: "Ashfak", image: photo4 },
  { name: "Jawahare", image: photo5 },
  { name: "Saubhagya", image: photo6 },
];

export default function WelcomePage() {
  return (
    <div className="bg-gray-50 text-gray-900 overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white flex justify-between items-center px-8 py-4 shadow-xl z-50 h-16">
        <h1 className="font-extrabold text-xl tracking-wide">
          Hostel Management System
        </h1>
        <nav className="flex gap-8 text-sm font-medium">
          <Link smooth to="/#" className="hover:text-yellow-300 transition">
            Home
          </Link>
          <Link
            smooth
            to="/#how-it-works"
            className="hover:text-yellow-300 transition"
          >
            How it Works
          </Link>
          <Link
            smooth
            to="/#features"
            className="hover:text-yellow-300 transition"
          >
            Features
          </Link>
          <Link
            smooth
            to="/#about-us"
            className="hover:text-yellow-300 transition"
          >
            About Us
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center relative overflow-hidden">
        {/* Scrolling Hostel Image */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="flex w-[200%] h-full"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          >
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1950&q=80"
              alt="Hostel"
              className="w-1/2 h-full object-cover opacity-70"
            />
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1950&q=80"
              alt="Hostel"
              className="w-1/2 h-full object-cover opacity-70"
            />
          </motion.div>
        </div>

        {/* Black Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 mix-blend-multiply"></div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-3xl px-4 mt-16"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/Rajarata_logo.png/250px-Rajarata_logo.png"
            alt="Rajarata University Logo"
            className="w-28 h-28 mb-6 mx-auto object-contain"
          />

          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Hostel Management System
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            Faculty of Technology, Rajarata University of Sri Lanka
          </p>
          <p className="mt-6 text-gray-300 max-w-xl mx-auto">
            A complete platform to manage hostel rooms, students, payments, and
            maintenance tasks seamlessly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3 text-lg font-semibold text-white bg-[#06B6D4] rounded-xl shadow-md hover:bg-[#0891B2] transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 text-lg font-semibold text-[#4F46E5] bg-white rounded-xl shadow-md hover:bg-gray-100 transition"
            >
              Register
            </Link>
          </div>
        </motion.div>

        {/* Scroll Down Arrow */}
        <motion.div
          className="absolute bottom-10 text-white"
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ArrowDownCircle className="w-10 h-10 mx-auto text-white/90" />
          <p className="text-sm mt-1 text-white/70">Scroll Down</p>
        </motion.div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-white text-gray-900 scroll-mt-24"
        style={{ scrollMarginTop: HEADER_H + 16 }}
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-[#4F46E5]">
          How It Works
        </h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6">
          {[
            {
              step: "1",
              title: "Register Account",
              text: "Create your account to get access to hostel management tools.",
            },
            {
              step: "2",
              title: "Manage Information",
              text: "Update student details, assign rooms, and handle requests easily.",
            },
            {
              step: "3",
              title: "Track Occupancy",
              text: "Monitor hostel occupancy and resources efficiently.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition"
            >
              <div className="bg-[#06B6D4] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto text-xl font-bold mb-5">
                {s.step}
              </div>
              <h3 className="text-xl font-semibold text-[#4F46E5] mb-3">
                {s.title}
              </h3>
              <p className="text-gray-600">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-[#E0F2FE] to-[#F0F9FF] scroll-mt-24"
        style={{ scrollMarginTop: HEADER_H + 16 }}
      >
        <h2 className="text-3xl font-bold text-center mb-10 text-[#4F46E5]">
          Key Features
        </h2>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
          {[
            { icon: Home, text: "Room Allocation & Booking" },
            { icon: CreditCard, text: "Online Payments" },
            { icon: Wrench, text: "Maintenance Requests" },
            { icon: Bell, text: "Notifications & Announcements" },
            { icon: Users, text: "Role-Based Dashboards" },
            { icon: CheckCircle2, text: "Secure and Reliable System" },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center hover:shadow-2xl transition"
            >
              <f.icon className="w-10 h-10 text-[#06B6D4] mb-4" />
              <p className="text-gray-800 font-medium text-center">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section
        id="about-us"
        className="bg-white py-20 text-gray-900 scroll-mt-24"
      >
        <div className="grid md:grid-cols-2 gap-10 px-8 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-[#4F46E5] mb-4">
              About Us
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              We are a dedicated team from Rajarata University, focused on
              building a smart, efficient, and user-friendly Hostel Management
              System to enhance student and warden experiences.
            </p>
          </motion.div>
          <motion.img
            src={aboutImage}
            alt="About Us"
            className="rounded-2xl shadow-lg object-cover"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="bg-gradient-to-r from-[#4F46E5]/10 to-[#06B6D4]/10 mt-16 py-12"
        >
          <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-[#4F46E5]">
            Meet Our Team
          </h3>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto px-6">
            {team.map((m, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-xl transition"
              >
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover ring-4 ring-[#06B6D4]/20"
                />
                <h4 className="text-lg font-semibold text-gray-800">
                  {m.name}
                </h4>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </section>

      {/* Professional Footer */}
      <footer className="bg-[#1E1E2F] text-gray-300 py-16">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h4 className="text-xl font-bold text-white mb-4">
              Hostel Management
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Streamlining hostel management for students and staff at Rajarata
              University.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Contact Us</h4>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#06B6D4]" />
              <a
                href="mailto:hostel.support@rusl.ac.lk"
                className="hover:underline text-[#06B6D4]"
              >
                hostel.support@rusl.ac.lk
              </a>
            </p>
            <p className="flex items-center gap-2 mt-2">
              <Phone className="w-4 h-4 text-[#06B6D4]" /> +94 25 222 1234
            </p>
            <p className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-[#06B6D4]" /> Faculty of
              Technology, Rajarata University, Mihintale
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/#how-it-works" className="hover:text-[#06B6D4]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-[#06B6D4]">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#about-us" className="hover:text-[#06B6D4]">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#06B6D4]">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-blue-600 hover:text-blue-500">
                <Facebook />
              </a>
              <a href="#" className="text-sky-400 hover:text-sky-300">
                <Twitter />
              </a>
              <a href="#" className="text-blue-700 hover:text-blue-500">
                <Linkedin />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Rajarata University of Sri Lanka. All
          Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
