import React from 'react';

const cities = [
    { name: "Mumbai", img: "/city-mumbai.jpg" },
    { name: "Delhi", img: "/city-delhi.jpg" },
    { name: "Bangalore", img: "/city-bangalore.jpg" },
    { name: "Pune", img: "/city-pune.jpg" },
    { name: "Hyderabad", img: "/city-hyderabad.jpg" },
    { name: "Chennai", img: "/city-chennai.jpg" }
];

const ChooseCity = () => {
    return (
        <section className="py-20 px-4 bg-primary-dark text-white">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold">CHOOSE A CITY TO <span className="text-red-500">BOOK AN AMBULANCE</span></h2>
                <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {cities.map(city => (
                        <div key={city.name} className="group cursor-pointer">
                            <img src={city.img} alt={city.name} className="rounded-lg grayscale group-hover:grayscale-0 transition-all duration-300" />
                            <p className="mt-2 font-semibold">{city.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ChooseCity;