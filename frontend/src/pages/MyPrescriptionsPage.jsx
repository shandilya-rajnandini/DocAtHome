import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { toast, Toaster } from "react-hot-toast";
import { getMyPrescriptions, takeDose, logMedicationDose, getAdherenceData } from "../api";
// import { Slide, Zoom, Flip, Bounce, POSITION } from 'react-toastify';

// --- Enhanced Mock Data with Smart Stock fields ---
const mockPrescriptions = [
  {
    _id: "p1",
    date: "2024-09-10",
    doctor: { name: "Dr. Aisha Khan", specialty: "Dermatologist" },
    diagnosis: "Mild Eczema",
    medicines: [
      {
        name: "Hydrocortisone Cream 1%",
        dosage: "Apply twice daily",
        duration: "7 days",
        pillCount: 14, // Added for Smart Stock
        initialCount: 14, // Added for Smart Stock
        threshold: 3, // Added for Smart Stock
        isSmartStockEnabled: false, // Added for Smart Stock
        lastTaken: null, // Added for Smart Stock
      },
      {
        name: "Cetirizine 10mg",
        dosage: "1 tablet at night if needed",
        duration: "5 days",
        pillCount: 5, // Added for Smart Stock
        initialCount: 5, // Added for Smart Stock
        threshold: 2, // Added for Smart Stock
        isSmartStockEnabled: true, // Added for Smart Stock
        lastTaken: "2024-02-20T08:30:00Z", // Added for Smart Stock
      },
    ],
  },
  {
    _id: "p2",
    date: "2024-08-15",
    doctor: { name: "Dr. Ben Carter", specialty: "Pediatrician" },
    diagnosis: "Viral Pharyngitis (Sore Throat)",
    medicines: [
      {
        name: "Ibuprofen Syrup",
        dosage: "5ml every 6-8 hours",
        duration: "3 days",
        pillCount: 30, // Added for Smart Stock
        initialCount: 30, // Added for Smart Stock
        threshold: 5, // Added for Smart Stock
        isSmartStockEnabled: true, // Added for Smart Stock
        lastTaken: "2024-02-21T12:45:00Z", // Added for Smart Stock
      },
      {
        name: "Lozenges",
        dosage: "1 lozenge every 3-4 hours",
        duration: "As needed",
        pillCount: 10, // Added for Smart Stock
        initialCount: 10, // Added for Smart Stock
        threshold: 2, // Added for Smart Stock
        isSmartStockEnabled: false, // Added for Smart Stock
        lastTaken: null, // Added for Smart Stock
      },
    ],
  },
];

// --- Reusable Prescription Card with Smart Stock Features ---
const PrescriptionCard = ({ prescription, onTakeDose, onToggleSmartStock }) => {
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const { date, doctor, diagnosis, medicines } = prescription;

    doc.setFontSize(22);
    doc.text("Doc@Home Official Prescription", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(date).toDateString()}`, 20, 40);
    doc.text(
      `Prescribing Doctor: ${doctor.name} (${doctor.specialty})`,
      20,
      50
    );
    doc.text(`Diagnosis: ${diagnosis}`, 20, 60);

    doc.line(20, 70, 190, 70);

    let y = 80;
    doc.setFont("helvetica", "bold");
    doc.text("Medicine", 20, y);
    doc.text("Dosage", 95, y);
    doc.text("Duration", 160, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    medicines.forEach((med) => {
      doc.text(med.name, 20, y);
      doc.text(med.dosage, 95, y);
      doc.text(med.duration, 160, y);
      y += 7;
    });

    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(10);
    doc.text(
      "This is a digitally generated prescription and does not require a signature.",
      105,
      y + 15,
      { align: "center" }
    );
    doc.text("Get well soon!", 105, y + 20, { align: "center" });

    doc.save(`Prescription-${doctor.name.replace(/\s/g, "")}-${date}.pdf`);
  };

return (
    <div className="bg-amber-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8 transition-colors duration-300 border border-gray-300 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-gray-400 dark:border-gray-700 pb-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white">
            {prescription.doctor.name}
          </h3>
          <p className="text-blue-600 dark:text-blue-400">{prescription.doctor.specialty}</p>
          <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
            Prescribed on: {new Date(prescription.date).toDateString()}
          </p>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <p className="text-gray-700 dark:text-gray-400">Diagnosis</p>
          <p className="text-black dark:text-white font-semibold">{prescription.diagnosis}</p>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-700 dark:text-gray-400 border-b border-gray-400 dark:border-gray-700">
              <th className="p-2 font-semibold">Medicine</th>
              <th className="p-2 font-semibold">Dosage</th>
              <th className="p-2 font-semibold">Duration</th>
              <th className="p-2 font-semibold">Smart Stock</th>
              <th className="p-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((med, index) => (
              <tr key={index} className="text-black dark:text-white">
                <td className="p-2 border-t border-gray-300 dark:border-gray-700">{med.name}</td>
                <td className="p-2 border-t border-gray-300 dark:border-gray-700">{med.dosage}</td>
                <td className="p-2 border-t border-gray-300 dark:border-gray-700">{med.duration}</td>
                <td className="p-2 border-t border-gray-300 dark:border-gray-700">
                  <button
                    onClick={() => onToggleSmartStock(prescription._id, index, !med.isSmartStockEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      med.isSmartStockEnabled ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        med.isSmartStockEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="p-2 border-t border-gray-300 dark:border-gray-700">
                  {med.isSmartStockEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {med.pillCount} left
                      </span>
                      <button
                        onClick={() => onTakeDose(prescription._id, index)}
                        disabled={med.pillCount <= 0}
                        className={`px-3 py-1 rounded text-sm ${
                          med.pillCount <= 0
                            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        Take
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={handleDownloadPdf}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
        >
          Download PDF
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">
          Order Medicines
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component with Smart Stock and Adherence Features ---
const MyPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [adherenceData, setAdherenceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayLogs, setTodayLogs] = useState(new Set());

  useEffect(() => {
    fetchPrescriptions();
    fetchAdherenceData();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await getMyPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdherenceData = async () => {
    try {
      const { data } = await getAdherenceData(30);
      setAdherenceData(data);
    } catch (error) {
      console.error('Error fetching adherence data:', error);
    }
  };

  const handleTakeDose = async (prescriptionId, medIndex) => {
    try {
      await takeDose(prescriptionId, medIndex);
      await fetchPrescriptions(); // Refresh data
      toast.success('Dose logged successfully!');
    } catch (error) {
      console.error('Error taking dose:', error);
      toast.error('Failed to log dose');
    }
  };

  const handleLogAdherenceDose = async (prescriptionId, medIndex, medicine) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await logMedicationDose(prescriptionId, medIndex, today, '');
      setTodayLogs(prev => new Set([...prev, `${prescriptionId}-${medIndex}`]));
      await fetchAdherenceData(); // Refresh adherence data
      toast.success('Dose checked off!');
    } catch (error) {
      console.error('Error logging adherence dose:', error);
      toast.error('Failed to check off dose');
    }
  };

  const toggleSmartStock = (prescriptionId, medIndex, enable) => {
    // This would need a backend endpoint to update smart stock settings
    toast.info('Smart stock settings would be updated here');
  };

  const showRefillAlert = (medName, threshold) => {
    toast.dismiss(); // Dismiss any existing toast before showing a new one
    toast.info(
      <div className="p-4">
        <p className="font-bold text-lg text-white">⚠️ Low Stock Alert</p>
        <p className="mt-1 text-gray-200">
          You're running low on {medName}. Only {threshold} doses left.
        </p>
        <p className="mt-2 text-gray-300 text-sm">
          Would you like to book a follow-up with your doctor to get a new
          prescription?
        </p>
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => {
              toast.dismiss();
              window.location.href = "my-appointments";
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Book Follow-up
          </button>
          <button
            onClick={() => {
              toast.dismiss();
            }}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Remind Me Later
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        className:
          "!bg-gray-800 !text-white !rounded-lg !border !border-gray-700 !shadow-lg",
        position: "bottom-center",
      }
    );
  };

  if (loading)
    return (
      <div className="text-center p-10 text-white text-xl">
        Loading prescriptions...
      </div>
    );

  return (
    <div>
      <div className="relative bg-[url('/my-prescriptions-bg.jpg')] bg-cover bg-center h-60">
        <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <h1 className="text-5xl font-bold text-white">My Prescriptions</h1>
        </div>
      </div>

      <div className="container mx-auto p-8">
        {/* Adherence Score Display */}
        {adherenceData && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Medication Adherence</h2>
                <p className="text-blue-100">Your 30-day adherence score</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{adherenceData.adherenceScore}%</div>
                <div className="text-sm text-blue-100">
                  {adherenceData.streak > 0 && `🔥 ${adherenceData.streak} day streak!`}
                </div>
              </div>
            </div>
            <div className="mt-4 bg-white bg-opacity-20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${adherenceData.adherenceScore}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Today's Medication Checklist */}
        {prescriptions.length > 0 && (
          <div className="bg-white dark:bg-secondary-dark p-6 rounded-lg mb-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Today's Checklist</h2>
            <div className="space-y-4">
              {prescriptions.flatMap((prescription) =>
                prescription.medicines.map((medicine, index) => (
                  <div key={`${prescription._id}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-primary-dark rounded-lg">
                    <div>
                      <h3 className="font-semibold text-black dark:text-white">{medicine.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{medicine.dosage}</p>
                    </div>
                    <button
                      onClick={() => handleLogAdherenceDose(prescription._id, index, medicine)}
                      disabled={todayLogs.has(`${prescription._id}-${index}`)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        todayLogs.has(`${prescription._id}-${index}`)
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {todayLogs.has(`${prescription._id}-${index}`) ? '✓ Taken' : 'Mark as Taken'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Prescriptions List */}
        {prescriptions.length > 0 ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            {prescriptions.map((p) => (
              <PrescriptionCard
                key={p._id}
                prescription={p}
                onTakeDose={handleTakeDose}
                onToggleSmartStock={toggleSmartStock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-secondary-text bg-secondary-dark p-10 rounded-lg">
            <p className="text-xl">You do not have any prescriptions yet.</p>
          </div>
        )}
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "!bg-gray-800 !text-white !rounded-lg !border !border-gray-700 !shadow-lg",
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default MyPrescriptionsPage;
