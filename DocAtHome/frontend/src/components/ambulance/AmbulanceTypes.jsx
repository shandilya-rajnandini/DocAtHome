import React from 'react';
// Import SVGs for icons, or use an icon library if it's working
// For now, we will use text placeholders

const types = [
    { name: "Advanced Life Support", desc: "Large size ambulance ideal for critically ill patients.", bg: "bg-[url('/ambulance-type-als.jpg')]" },
    { name: "Basic Life Support", desc: "For medical transportation and continuous medical supervision.", bg: "bg-[url('/ambulance-type-bls.jpg')]" },
    { name: "Boat Ambulance", desc: "For medical transportation and continuous medical supervision.", bg: "bg-[url('/ambulance-type-boat.jpg')]" },
    { name: "Air Ambulance", desc: "Ideal for critically ill patients and Emergency medical transfers.", bg: "bg-[url('/ambulance-type-air.jpg')]" }
];

const AmbulanceTypes = () => {
  return (
    <section className="py-20 px-4 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">TYPE OF <span className="text-red-500">AMBULANCE</span></h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {types.map(type => (
            <div key={type.name} className={`relative rounded-lg overflow-hidden h-64 ${type.bg} bg-cover bg-center group`}>
              <div className="absolute inset-0 bg-red-600 bg-opacity-70 flex flex-col justify-end p-6 transition-all duration-300 group-hover:bg-opacity-80">
                <h3 className="text-2xl font-bold">{type.name}</h3>
                <p className="mt-2">{type.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AmbulanceTypes;