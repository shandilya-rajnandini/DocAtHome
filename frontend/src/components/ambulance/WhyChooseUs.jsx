import React from "react";

const reasons = [
  {
    icon: "💼",
    title: "Experience",
    text: "Asia's Largest Ambulance Operator with experience in managing large fleets of Ambulances. 15 years of experience in Emergency Response & Patient Transfer in India and UAE.",
  },
  {
    icon: "🌐",
    title: "Network",
    text: "Access to 5,000 Ambulances in 65 cities in India. Best Team including Trained Drivers and Paramedics on Board.",
  },
  {
    icon: "🎧",
    title: "24/7 Support 365 Days",
    text: "24/7 helpdesk for Understanding of your requirement an Assuring timely availability of Ambulance 365 days.",
  },
  {
    icon: "✅",
    title: "Quality Control",
    text: "Feedback calls and post-consultation rating. Mechanism for continuous quality assessment.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-900 text-white">
      <div className="container mx-auto text-center max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold mb-16">
          WHY <span className="text-red-500">CHOOSE US</span>?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {reasons.map((reason, index) => {
            // Define common class names for maintainability
            const cardClasses = [
              "group bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl",
              "hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-2",
              "transition-all duration-300 ease-in-out",
              "animate-fade-in-up",
            ].join(" ");

            const iconContainerClasses = [
              "w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full",
              "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
              "group-hover:from-blue-500/30 group-hover:to-purple-500/30",
              "transition-all duration-300",
            ].join(" ");

            return (
              <div
                key={reason.title}
                className={cardClasses}
                style={{
                  animationDelay: `${(index + 1) * 0.1}s`,
                  animationFillMode: "both",
                }}
              >
                {/* Icon Container */}
                <div className={iconContainerClasses}>
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {reason.icon}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-xl md:text-2xl font-bold mb-4 text-white group-hover:text-blue-300 
                               transition-colors duration-300"
                >
                  {reason.title}
                </h3>

                {/* Description */}
                <p
                  className="text-gray-300 leading-relaxed text-sm md:text-base 
                               group-hover:text-gray-200 transition-colors duration-300"
                >
                  {reason.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Add external CSS for animations - should be moved to your main CSS file */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </div>
    </section>
  );
};

export default WhyChooseUs;
