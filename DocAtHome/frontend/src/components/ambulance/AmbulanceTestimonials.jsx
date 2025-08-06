import React from 'react';

const AmbulanceTestimonials = () => {
  return (
    <section className="py-20 px-4 bg-primary-dark text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold">OUR <span className="text-red-500">TESTIMONIALS</span></h2>
        <div className="max-w-3xl mx-auto mt-12 bg-gray-900 p-8 rounded-lg relative">
          <span className="absolute top-4 left-4 text-8xl text-red-500 opacity-20">“</span>
          <p className="text-lg italic text-gray-300">
            My neighbor's mother slipped in the bathroom and hurt her back badly and was barely able to move. It was risky transferring her on our personal vehicle as we would have added to her pain. I called for an ambulance it was taking time so I called Ziqitza and ambulance came within no time and safely transfer her to the hospital were proper first aid was given to her till we reach hospital.
          </p>
          <p className="text-right mt-4 font-bold text-red-500">- Mumbai</p>
          <span className="absolute bottom-4 right-4 text-8xl text-red-500 opacity-20">”</span>
        </div>
      </div>
    </section>
  );
};

export default AmbulanceTestimonials;