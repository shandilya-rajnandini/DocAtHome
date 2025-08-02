import React from 'react';

const testimonialsData = [
    {
        quote: "The service was quick and very professional. I felt cared for and truly appreciated the personalized attention.",
        img: "/testimonial-1.jpg",
        name: "Sophia M.",
        role: "Satisfied patient"
    },
    {
        quote: "Having a doctor visit my father at home was a blessing. The convenience and quality of care were exceptional.",
        img: "/testimonial-2.jpg",
        name: "Rajesh K.",
        role: "Son of an elder patient"
    },
    {
        quote: "The nurse provided excellent care and was a delight to have around, making recovery easier.",
        img: "/testimonial-3.jpg",
        name: "Amara T.",
        role: "Young woman who received treatment at home"
    }
];

const Testimonials = () => {
  return (
    <section className="bg-amber-200 dark:bg-primary-dark text-black dark:text-primary-text py-20 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold">TESTIMONIALS</h2>
        <div className="w-20 h-1 bg-slate-800 dark:bg-accent-cream my-4 mx-auto"></div>
        <div className="grid md:grid-cols-3 gap-10 mt-12">
          {testimonialsData.map((testimonial, index) => (
            <div key={index} className="bg-accent-cream dark:bg-secondary-dark p-8  dark:!text-slate-200 rounded-lg shadow-lg text-xl">
                <p className=" text-slate-700 dark:text-slate-200 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                    <img src={testimonial.img} alt={testimonial.name} className="w-16 h-16 rounded-full mr-4 object-cover" />
                    <div>
                        <h4 className="font-bold text-lg">{testimonial.name}</h4>
                        <p className="text-slate-600 dark:text-accent-cream text-sm">{testimonial.role}</p>
                    </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;