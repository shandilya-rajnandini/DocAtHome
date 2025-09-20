import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHospital, FaHome, FaHeartbeat, FaShieldAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

const DischargeConcierge = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  const serviceFeatures = [
    {
      icon: <FaHospital className="text-2xl text-accent-blue" />,
      title: "Hospital Pickup",
      description: "Our nurse meets you at the hospital discharge area"
    },
    {
      icon: <FaHeartbeat className="text-2xl text-accent-blue" />,
      title: "Medication Reconciliation",
      description: "Expert review of new medications with existing prescriptions"
    },
    {
      icon: <FaHome className="text-2xl text-accent-blue" />,
      title: "Home Safety Assessment",
      description: "Complete evaluation of your home environment for safety"
    },
    {
      icon: <FaShieldAlt className="text-2xl text-accent-blue" />,
      title: "Vital Signs Monitoring",
      description: "Comprehensive first post-discharge health assessment"
    }
  ];

  const benefits = [
    "Reduce hospital readmission risk by 60%",
    "Peace of mind for families during critical transition",
    "Expert medication management and safety checks",
    "24/7 support during the first 72 hours",
    "Seamless coordination with hospital discharge process"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white dark:from-primary-dark dark:to-secondary-dark">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-accent-blue/10 text-accent-blue px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
            <FaClock className="mr-2" />
            Critical Care Transition Service
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 leading-tight">
            Discharge <span className="text-accent-blue">Concierge</span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
            The first 72 hours after hospital discharge are critical. Our expert nurses ensure a safe,
            smooth transition home with comprehensive care and peace of mind.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 px-4">
            <button
              onClick={() => setShowBookingForm(true)}
              className="w-full sm:w-auto bg-accent-blue hover:bg-accent-blue-hover text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book Discharge Concierge
            </button>
            <Link
              to="/services"
              className="w-full sm:w-auto border-2 border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 text-center"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Service Overview - Mobile Optimized */}
      <section className="py-12 md:py-16 px-4 bg-white dark:bg-secondary-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              Comprehensive Discharge Support
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
              Every step of your journey home is carefully managed by our certified nurses
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {serviceFeatures.map((feature, index) => (
              <div key={index} className="text-center p-4 md:p-6 rounded-xl bg-amber-50 dark:bg-primary-dark border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-3 md:mb-4">
                  <div className="text-2xl md:text-3xl">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-accent-blue/5 to-accent-cream/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                Why Families Choose Our Discharge Concierge
              </h2>

              <div className="space-y-3 md:space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-sm md:text-base" />
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 md:mt-8 p-4 md:p-6 bg-white dark:bg-secondary-dark rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">
                  Hospital Partnership Program
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                  We work directly with hospitals to ensure seamless coordination and reduce readmission rates.
                </p>
                <div className="text-xs md:text-sm text-accent-blue font-medium">
                  Contact us for B2B partnerships →
                </div>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white dark:bg-secondary-dark p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-blue mb-2">$299</div>
                  <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6">One-time service fee</div>

                  <div className="space-y-2 md:space-y-3 text-left">
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Hospital pickup & transport</span>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Medication reconciliation</span>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Home safety assessment</span>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="text-xs md:text-sm">72-hour support hotline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 bg-white dark:bg-primary-dark">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12">
            Trusted by Families in Critical Moments
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-amber-50 dark:bg-secondary-dark rounded-lg">
              <div className="text-3xl font-bold text-accent-blue mb-2">98%</div>
              <div className="text-gray-600 dark:text-gray-300">Patient Satisfaction</div>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-secondary-dark rounded-lg">
              <div className="text-3xl font-bold text-accent-blue mb-2">60%</div>
              <div className="text-gray-600 dark:text-gray-300">Readmission Reduction</div>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-secondary-dark rounded-lg">
              <div className="text-3xl font-bold text-accent-blue mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="py-12 md:py-16 px-4 bg-accent-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Ready to Ensure a Safe Transition Home?
          </h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 opacity-90 px-4">
            Book your Discharge Concierge service today and give your family the peace of mind they deserve.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <button
              onClick={() => setShowBookingForm(true)}
              className="bg-white text-accent-blue px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-gray-100 transition-all duration-300"
            >
              Book Now - $299
            </button>
            <a
              href="tel:+1-800-DOCATHOME"
              className="border-2 border-white text-white hover:bg-white hover:text-accent-blue px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg transition-all duration-300 text-center"
            >
              Call: 1-800-DOCATHOME
            </a>
          </div>
        </div>
      </section>

      {/* Booking Form Modal - Mobile Optimized */}
      {showBookingForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <div className="bg-white dark:bg-secondary-dark p-4 md:p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3
              id="booking-modal-title"
              className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Book Discharge Concierge
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6">
              Our team will contact you within 1 hour to coordinate your discharge concierge service.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                console.log('Form submitted');
                setShowBookingForm(false);
              }}
              className="space-y-3 md:space-y-4"
            >
              <div>
                <label htmlFor="patient-name" className="sr-only">Patient Name</label>
                <input
                  id="patient-name"
                  type="text"
                  placeholder="Patient Name"
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white text-sm md:text-base focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                <input
                  id="phone-number"
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white text-sm md:text-base focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="hospital-name" className="sr-only">Hospital Name</label>
                <input
                  id="hospital-name"
                  type="text"
                  placeholder="Hospital Name"
                  required
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white text-sm md:text-base focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="discharge-date" className="sr-only">Discharge Date</label>
                <input
                  id="discharge-date"
                  type="date"
                  placeholder="Discharge Date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-primary-dark text-gray-900 dark:text-white text-sm md:text-base focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-accent-blue text-white py-3 rounded-lg font-semibold hover:bg-accent-blue-hover transition-colors text-sm md:text-base focus:ring-2 focus:ring-accent-blue focus:ring-offset-2"
              >
                Request Service
              </button>
            </form>
            <button
              onClick={() => setShowBookingForm(false)}
              className="mt-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 w-full text-center text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
              aria-label="Close booking form"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DischargeConcierge;