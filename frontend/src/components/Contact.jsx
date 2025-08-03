import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="bg-amber-100 dark:bg-secondary-dark text-black dark:text-primary-text py-20 px-4">
      <div className="container mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black dark:text-white">CONTACT</h2>
            <div className="w-20 h-1 bg-slate-800 dark:bg-accent-cream my-4 mx-auto"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">

            {/* Column 1: Contact Information */}
            <div className="flex flex-col justify-center space-y-6">
                <div>
                    <h3 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-accent-cream">Address</h3>
                    <p className="text-slate-600 dark:text-secondary-text text-xl">BIHTA, IIT PATNA</p>
                </div>
                <div>
                    <h3 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-accent-cream">Phone</h3>
                    <p className="text-slate-600 dark:text-secondary-text text-xl">📞 +91 9608196520</p>
                </div>
                <div>
                    <h3 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-accent-cream">Email</h3>
                    <p className="text-slate-600 dark:text-secondary-text text-xl">📧 singhrajnandini65@gmail.com</p>
                </div>
                <div>
                    {/* This section is now cleaned up and corrected */}
                    <h3 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-accent-cream">Operating Hours</h3>
                    <p className="text-slate-600 dark:text-secondary-text text-xl">🕒 Mon-Fri - 08:00 AM - 7:00 PM</p>
                </div>
            </div>

            {/* Column 2: Contact Form */}
            <form className="bg-white dark:bg-primary-dark p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      className="p-3 bg-gray-200 dark:bg-secondary-dark text-black dark:text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue" 
                    />
                    <input 
                      type="text" 
                      placeholder="Phone" 
                      className="p-3 bg-gray-200 dark:bg-secondary-dark text-black dark:text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue" 
                    />
                </div>
                <div className="mb-4">
                    <input 
                      type="email" 
                      placeholder="Email address" 
                      className="w-full p-3 bg-gray-200 dark:bg-secondary-dark text-black dark:text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue" 
                    />
                </div>
                <div className="mb-4">
                    <textarea 
                      placeholder="Message" 
                      rows="5" 
                      className="w-full p-3 bg-gray-200 dark:bg-secondary-dark text-black dark:text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-slate-800 dark:bg-accent-cream text-white dark:text-primary-dark font-bold py-3 rounded-md hover:bg-slate-700 dark:hover:bg-yellow-100 transition duration-300"
                >
                  CONTACT US
                </button>
            </form>
        </div>
        
        {/* Google Map Section */}
        <div className="mt-20">
            <iframe 
                title="Google Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.316816745949!2d84.86999707553837!3d25.53647187748542!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f2a9e5c1f0e4b7%3A0x8a1e8a3b1e1f1c1a!2sIndian%20Institute%20of%20Technology%2C%20Patna!5e0!3m2!1sen!2sin!4v1710243350294!5m2!1sen!2sin" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-lg">
            </iframe>
        </div>

      </div>
    </section>
  );
};

export default Contact;