import React from "react";
import aboutImage from "../assets/about.jpg";
import photo1 from "../assets/team/member1.png";
import photo2 from "../assets/team/member2.png";
import photo3 from "../assets/team/member3.png";
import photo4 from "../assets/team/member4.png";
import photo5 from "../assets/team/member5.png";
import photo6 from "../assets/team/member6.png";

type IconProps = React.SVGProps<SVGSVGElement>;
const GoalIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 7v5l3 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const GearIcon: React.FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 8a4 4 0 100 8 4 4 0 000-8z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M4 12h2M18 12h2M12 4v2M12 18v2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

interface TeamMember {
  name: string;
  image: string;
}

const AboutUs: React.FC = () => {
  const team: TeamMember[] = [
    { name: "Chameera", image: photo1 },
    { name: "M.R.R.Banu", image: photo2 },
    { name: "Nadun", image: photo3 },
    { name: "Ashfak", image: photo4 },
    { name: "Jawahare", image: photo5 },
    { name: "Saubhagya", image: photo6 },
  ];

  return (
    <section className="bg-blue-200">
      {/* Hero row */}
      <div className="grid content-center gap-8 px-4 sm:px-16 md:px-20 md:grid-cols-2 py-16">
        <div className="max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-blue-900">
            About Us
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-7 text-slate-800">
            We are a dedicated team building a modern, efficient, and
            user-friendly platform for hostel administration.
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src={aboutImage}
            alt="Our team working"
            className="w-full max-w-xl max-h-[50vh] rounded-2xl object-cover shadow-lg"
          />
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="py-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h3 className="text-3xl font-extrabold text-center">
            Our Vision & Mission
          </h3>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-8 text-slate-800 shadow-xl transition hover:shadow-2xl">
              <div className="mb-5 grid place-items-center">
                <GoalIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h4 className="text-2xl font-semibold text-blue-900 text-center">
                Vision
              </h4>
              <p className="mt-3 text-lg">
                To revolutionize hostel management with a user-friendly,
                efficient, modern system that simplifies tasks and enhances
                experiences.
              </p>
            </div>
            <div className="rounded-xl bg-white p-8 text-slate-800 shadow-xl transition hover:shadow-2xl">
              <div className="mb-5 grid place-items-center">
                <GearIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h4 className="text-2xl font-semibold text-blue-900 text-center">
                Mission
              </h4>
              <p className="mt-3 text-lg">
                To build a comprehensive platform that streamlines hostel
                management, improves communication, and empowers students and
                staff.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-blue-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-900">
            Meet Our Team
          </h3>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {team.map((m) => (
              <article
                key={m.name}
                className="group rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
              >
                <div className="mx-auto aspect-square w-32 overflow-hidden rounded-full ring-4 ring-blue-200">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  {m.name}
                </h4>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
