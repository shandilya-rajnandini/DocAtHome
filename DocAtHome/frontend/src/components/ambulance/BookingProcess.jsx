import React from 'react';
// We'll use text placeholders for icons

const steps = [
    { icon: "📞", title: "Step 1", text: "Call +919700001298 to book an ambulance." },
    { icon: "📍", title: "Step 2", text: "Share details about the Patient and Location." },
    { icon: " dispatcher", title: "Step 3", text: "Dispatching of Ambulance in 5 mins." },
    { icon: "🚑", title: "Step 4", text: "Pick up a Patient from the Location." }
];

const BookingProcess = () => {
    return (
        <section className="py-20 px-4 bg-gray-900 text-white">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-12">PROCESS TO BOOK <span className="text-red-500">AN AMBULANCE</span></h2>
                <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.title}>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center text-4xl mb-4">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-red-500">{step.title}</h3>
                                <p className="mt-2 text-gray-400 max-w-xs">{step.text}</p>
                            </div>
                            {index < steps.length - 1 && <div className="text-green-500 text-4xl hidden md:block">→</div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BookingProcess;