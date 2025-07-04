import React, { useState } from 'react';
import jsPDF from 'jspdf';

// --- Mock Data for Prescriptions ---
const mockPrescriptions = [
  {
    _id: 'p1',
    date: '2024-09-10',
    doctor: { name: 'Dr. Aisha Khan', specialty: 'Dermatologist' },
    diagnosis: 'Mild Eczema',
    medicines: [
      { name: 'Hydrocortisone Cream 1%', dosage: 'Apply twice daily', duration: '7 days' },
      { name: 'Cetirizine 10mg', dosage: '1 tablet at night if needed', duration: '5 days' },
    ],
  },
  {
    _id: 'p2',
    date: '2024-08-15',
    doctor: { name: 'Dr. Ben Carter', specialty: 'Pediatrician' },
    diagnosis: 'Viral Pharyngitis (Sore Throat)',
    medicines: [
      { name: 'Ibuprofen Syrup', dosage: '5ml every 6-8 hours', duration: '3 days' },
      { name: 'Lozenges', dosage: '1 lozenge every 3-4 hours', duration: 'As needed' },
    ],
  },
];

// --- Reusable Prescription Card ---
const PrescriptionCard = ({ prescription }) => {
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const { date, doctor, diagnosis, medicines } = prescription;

    doc.setFontSize(22);
    doc.text("Doc@Home Official Prescription", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(date).toDateString()}`, 20, 40);
    doc.text(`Prescribing Doctor: ${doctor.name} (${doctor.specialty})`, 20, 50);
    doc.text(`Diagnosis: ${diagnosis}`, 20, 60);

    doc.line(20, 70, 190, 70);

    // Using jspdf-autotable is better for complex tables, but this is a manual way
    let y = 80;
    doc.setFont("helvetica", "bold");
    doc.text("Medicine", 20, y);
    doc.text("Dosage", 95, y);
    doc.text("Duration", 160, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    medicines.forEach(med => {
        doc.text(med.name, 20, y);
        doc.text(med.dosage, 95, y);
        doc.text(med.duration, 160, y);
        y += 7;
    });

    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(10);
    doc.text("This is a digitally generated prescription and does not require a signature.", 105, y + 15, { align: "center" });
    doc.text("Get well soon!", 105, y + 20, { align: "center" });

    doc.save(`Prescription-${doctor.name.replace(/\s/g, '')}-${date}.pdf`);
  };

  return (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-gray-700 pb-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{prescription.doctor.name}</h3>
          <p className="text-accent-blue">{prescription.doctor.specialty}</p>
          <p className="text-sm text-secondary-text mt-1">Prescribed on: {new Date(prescription.date).toDateString()}</p>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <p className="text-secondary-text">Diagnosis</p>
          <p className="text-white font-semibold">{prescription.diagnosis}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-secondary-text border-b border-gray-700">
              <th className="p-2 font-semibold">Medicine</th>
              <th className="p-2 font-semibold">Dosage</th>
              <th className="p-2 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((med, index) => (
              <tr key={index} className="text-white">
                <td className="p-2 border-t border-gray-800">{med.name}</td>
                <td className="p-2 border-t border-gray-800">{med.dosage}</td>
                <td className="p-2 border-t border-gray-800">{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <button onClick={handleDownloadPdf} className="bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-2 px-6 rounded transition-colors">Download PDF</button>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">Order Medicines</button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const MyPrescriptionsPage = () => {
    const [prescriptions] = useState(mockPrescriptions);
    const [loading, setLoading] = useState(false); // Add a loading state for future API calls

    if (loading) return <div className="text-center p-10 text-white text-xl">Loading prescriptions...</div>;

    return (
        <div>
            <div className="relative bg-[url('/my-prescriptions-bg.jpg')] bg-cover bg-center h-60">
                <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center">
                    <h1 className="text-5xl font-bold text-white">My Prescriptions</h1>
                </div>
            </div>

            <div className="container mx-auto p-8">
                {prescriptions.length > 0 ? (
                    <div className="space-y-8 max-w-4xl mx-auto">
                        {prescriptions.map(p => <PrescriptionCard key={p._id} prescription={p} />)}
                    </div>
                ) : (
                    <div className="text-center text-secondary-text bg-secondary-dark p-10 rounded-lg">
                        <p className="text-xl">You do not have any prescriptions yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPrescriptionsPage;