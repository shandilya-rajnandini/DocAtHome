import React from "react";

// Phone number constant for consistency
const EMERGENCY_PHONE = "+919700001298";
const EMERGENCY_PHONE_DISPLAY = "+91 9700 001298";

const steps = [
  {
    icon: "📞",
    title: "Step 1",
    text: `Call ${EMERGENCY_PHONE_DISPLAY} to book an ambulance.`,
  },
  {
    icon: "📍",
    title: "Step 2",
    text: "Share details about the Patient and Location.",
  },
  {
    icon: "🚑",
    title: "Step 3",
    text: "Dispatching of Ambulance in 5 mins.",
  },
  {
    icon: "🏥",
    title: "Step 4",
    text: "Pick up a Patient from the Location.",
  },
];

const BookingProcess = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-800 via-gray-900 to-slate-800 text-white">
      <div className="container mx-auto text-center max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-16">
          PROCESS TO BOOK <span className="text-red-500">AN AMBULANCE</span>
        </h2>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-center items-center gap-4 lg:gap-8">
          {steps.map((step, index) => {
            // Define common class names for maintainability
            const stepCircleClasses = [
              "relative w-28 h-28 rounded-full border-3 border-green-500",
              "flex items-center justify-center text-4xl mb-6",
              "bg-green-500/10 backdrop-blur-sm",
              "group-hover:border-green-400 group-hover:bg-green-500/20",
              "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/20",
              "transition-all duration-300 ease-in-out",
            ].join(" ");

            return (
              <React.Fragment key={step.title}>
                <div className="flex flex-col items-center group">
                  {/* Step Icon Circle */}
                  <div className={stepCircleClasses}>
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </span>

                    {/* Step Number Badge */}
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full 
                                  flex items-center justify-center text-white text-sm font-bold
                                  group-hover:bg-red-400 transition-colors duration-300"
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3
                    className="text-xl font-bold text-red-500 mb-3 
                               group-hover:text-red-400 transition-colors duration-300"
                  >
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p
                    className="text-gray-300 max-w-xs leading-relaxed text-sm
                               group-hover:text-gray-200 transition-colors duration-300"
                  >
                    {step.text}
                  </p>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center mx-2 lg:mx-4">
                    <div className="text-green-500 text-3xl lg:text-4xl animate-pulse">
                      →
                    </div>
                    <div className="w-12 lg:w-16 h-0.5 bg-gradient-to-r from-green-500 to-green-400 mt-2"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="flex items-start gap-6">
                {/* Step Icon Circle */}
                <div
                  className="relative flex-shrink-0 w-20 h-20 rounded-full border-2 border-green-500 
                                flex items-center justify-center text-3xl
                                bg-green-500/10 backdrop-blur-sm"
                >
                  <span>{step.icon}</span>

                  {/* Step Number Badge */}
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full 
                                  flex items-center justify-center text-white text-xs font-bold"
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-red-500 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {step.text}
                  </p>
                </div>
              </div>

              {/* Vertical connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-10 top-20 w-0.5 h-8 bg-gradient-to-b from-green-500 to-green-400"></div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div
          className="mt-16 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10
                        hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        >
          <h3 className="text-xl font-bold mb-3 text-green-400">
            Ready to Book?
          </h3>
          <p className="text-gray-300 mb-4">
            Emergency? Don't wait - call us now!
          </p>
          <a
            href={`tel:${EMERGENCY_PHONE}`}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 
                        text-white font-bold py-3 px-6 rounded-lg 
                        transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="text-xl">📞</span>
            Call {EMERGENCY_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
};

export default BookingProcess;
