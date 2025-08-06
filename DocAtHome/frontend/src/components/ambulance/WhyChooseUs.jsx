import React from 'react';
// We'll use text placeholders for icons for now
// In a real app, you'd use <IconComponent /> here

const reasons = [
    { icon: "💼", title: "Experience", text: "Asia's Largest Ambulance Operator with experience in managing large fleets of Ambulances. 15 years of experience in Emergency Response & Patient Transfer in India and UAE." },
    { icon: "🌐", title: "Network", text: "Access to 5,000 Ambulances in 65 cities in India. Best Team including Trained Drivers and Paramedics on Board." },
    { icon: "🎧", title: "24/7 Support 365 Days", text: "24/7 helpdesk for Understanding of your requirement an Assuring timely availability of Ambulance 365 days." },
    { icon: "✅", title: "Quality Control", text: "Feedback calls and post-consultation rating. Mechanism for continuous quality assessment." }
];

const WhyChooseUs = () => {
    return (
        <section className="py-20 px-4 bg-primary-dark text-white">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-12">WHY <span className="text-red-500">CHOOSE US ?</span></h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {reasons.map(reason => (
                        <div key={reason.title} className="bg-gray-900 p-8 rounded-lg">
                            <div className="text-5xl text-red-500 mb-4">{reason.icon}</div>
                            <h3 className="text-2xl font-bold mb-3">{reason.title}</h3>
                            <p className="text-gray-400">{reason.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;