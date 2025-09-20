import React from 'react';
import { Link } from 'react-router-dom';
import { FaHospital } from 'react-icons/fa';

const servicesData = [
  {
    img: '/service-emergency.jpg',
    title: 'Emergency Medical Support',
    desc: 'Quick access to certified professionals for urgent medical needs at home.',
  },
  {
    img: '/service-elderly.jpg',
    title: 'Elderly Care Services',
    desc: 'Holistic solutions focusing on elder care, ensuring compassionate and attentive support.',
  },
  {
    img: '/service-in-home.jpg',
    title: 'In-Home Medical Consultations',
    desc: 'Professional consultations directly at your residence for added comfort and convenience.',
  },
  {
    img: '/service-discharge.jpg',
    title: 'Discharge Concierge',
    desc: 'Critical 72-hour support after hospital discharge with medication reconciliation and home safety assessment.',
    featured: true,
    icon: <FaHospital className="text-2xl text-accent-blue" />,
    link: '/discharge-concierge'
  },
];

const Services = () => {
  return (
    <section className="bg-amber-100 dark:bg-secondary-dark text-black dark:text-primary-text py-20 px-4 ">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">SERVICES</h2>
        <div className="w-20 h-1 bg-slate-800 dark:bg-accent-cream my-4 mx-auto"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 ">
          {servicesData.map((service, index) => (
            <div key={index} className={`bg-white dark:bg-primary-dark p-8 rounded-lg text-center shadow-lg hover:shadow-md shadow-gray-300 transform hover:scale-105 transition-transform duration-300 hover:cursor-pointer relative ${service.featured ? 'ring-2 ring-accent-blue' : ''}`}>
              {service.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-blue text-white px-3 py-1 rounded-full text-xs font-semibold">
                  FEATURED
                </div>
              )}
              {service.icon ? (
                <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-accent-blue/10 flex items-center justify-center">
                  {service.icon}
                </div>
              ) : (
                <img src={service.img} alt={service.title} className="w-32 h-32 rounded-full mx-auto mb-6 object-cover" />
              )}
              <h3 className="text-xl md:text-2xl font-semibold mb-3 leading-tight">{service.title}</h3>
              <p className="text-slate-700 dark:text-secondary-text leading-relaxed mb-4">{service.desc}</p>
              {service.link && (
                <Link
                  to={service.link}
                  className="inline-block bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue-hover transition-colors text-sm font-medium"
                >
                  Learn More
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;