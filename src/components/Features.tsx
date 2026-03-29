import React from "react";
import feature1 from "../assets/features/feature1.png";
import feature2 from "../assets/features/feature2.png";
import feature3 from "../assets/features/feature3.png";
import feature4 from "../assets/features/feature4.png";

interface FeatureCard {
  title: string;
  img: string;
  desc: string;
}

const Features: React.FC = () => {
  const cards: FeatureCard[] = [
    {
      title: "Student Records",
      img: feature1,
      desc: "Easily manage and update student information, including personal and contact details.",
    },
    {
      title: "Room Allocation",
      img: feature2,
      desc: "Assign and reassign rooms quickly. Track occupancy and allocation history.",
    },
    {
      title: "Billing & Payments",
      img: feature3,
      desc: "Generate invoices, track payments, and manage dues with simple workflows.",
    },
    {
      title: "Notifications",
      img: feature4,
      desc: "Send timely updates about payments, room changes, and important events.",
    },
  ];

  return (
    <section className="bg-gradient-to-tr from-[#FFFFFF] to-[#60B5FF] py-16 px-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-center text-blue-900">
        Features
      </h2>
      <div className="mt-10 mx-auto max-w-7xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <article
            key={c.title}
            className="rounded-xl bg-white p-5 text-center shadow-md transition hover:shadow-lg"
          >
            <div className="mx-auto mb-4 aspect-[4/3] w-full max-w-[180px] overflow-hidden">
              <img
                src={c.img}
                alt={c.title}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900">
              {c.title}
            </h3>
            <p className="mt-2 text-gray-700 text-sm md:text-base">{c.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Features;
