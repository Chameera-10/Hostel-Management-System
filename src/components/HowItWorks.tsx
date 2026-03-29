import React from "react";

const HowItWorks: React.FC = () => {
  return (
    <section className="w-full bg-blue-500 py-20 px-6">
      <h2 className="text-4xl font-extrabold text-center mb-16 text-white drop-shadow-md">
        How It Works
      </h2>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Step 1 */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-blue-400 rounded-full w-24 h-24 flex items-center justify-center mb-6 drop-shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12"
              viewBox="0 0 24 24"
            >
              <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-blue-900">
            1. Register Account
          </h3>
          <p className="text-gray-600 text-sm max-w-xs">
            Create your personal account to start managing your hostel details
            efficiently and securely.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-blue-400 rounded-full w-24 h-24 flex items-center justify-center mb-6 drop-shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-blue-900">
            2. Manage Information
          </h3>
          <p className="text-gray-600 text-sm max-w-xs">
            Update and maintain student details, room assignments, and track
            changes with ease.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl transition-shadow duration-300">
          <div className="bg-blue-400 rounded-full w-24 h-24 flex items-center justify-center mb-6 drop-shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12"
              viewBox="0 0 24 24"
            >
              <polyline points="4 17 10 11 13 14 21 6"></polyline>
              <circle cx="4" cy="17" r="3"></circle>
              <circle cx="10" cy="11" r="3"></circle>
              <circle cx="13" cy="14" r="3"></circle>
              <circle cx="21" cy="6" r="3"></circle>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3 text-blue-900">
            3. Track Occupancy
          </h3>
          <p className="text-gray-600 text-sm max-w-xs">
            Monitor hostel occupancy status and get timely updates to optimize
            resource usage.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
