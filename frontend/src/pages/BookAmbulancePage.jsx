import React from 'react';
import AmbulanceHero from '../components/ambulance/AmbulanceHero';
import ChooseCity from '../components/ambulance/ChooseCity';
import AmbulanceTypes from '../components/ambulance/AmbulanceTypes';
import WhyChooseUs from '../components/ambulance/WhyChooseUs';
import BookingProcess from '../components/ambulance/BookingProcess';

const BookAmbulancePage = () => {
  return (
    <div className="bg-primary-dark">
      <AmbulanceHero />
      <ChooseCity />
      <AmbulanceTypes />
      <WhyChooseUs />
      <BookingProcess />
    </div>
  );
};

export default BookAmbulancePage;