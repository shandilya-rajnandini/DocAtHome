import React from "react";

const servicesData = [
  {
    img: "/service-emergency.jpg",
    title: "Emergency Medical Support",
    desc: "Quick access to certified professionals for urgent medical needs at home.",
  },
  {
    img: "/service-elderly.jpg",
    title: "Elderly Care Services",
    desc: "Holistic solutions focusing on elder care, ensuring compassionate and attentive support.",
  },
  {
    img: "/service-in-home.jpg",
    title: "In-Home Medical Consultations",
    desc: "Professional consultations directly at your residence for added comfort and convenience.",
  },
];

const Services = () => {
  return (
    <section className="bg-amber-100 dark:bg-secondary-dark text-black dark:text-primary-text py-20 px-4 ">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold">SERVICES</h2>
        <div className="w-20 h-1 bg-slate-800 dark:bg-accent-cream my-4 mx-auto"></div>
        <div className="grid md:grid-cols-3 gap-10 mt-12 ">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className="bg-white dark:bg-primary-dark p-8 rounded-lg text-center shadow-lg hover:shadow-md shadow-gray-300 transform hover:scale-105 transition-transform duration-300 hover:cursor-pointer"
            >
              <img
                src={service.img}
                alt={service.title}
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
              <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
              <p className="text-slate-700 dark:text-secondary-text">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
