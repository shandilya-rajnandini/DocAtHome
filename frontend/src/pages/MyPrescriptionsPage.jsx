import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { toast, Toaster } from "react-hot-toast";

// --- Enhanced Mock Data with Smart Stock fields ---
const mockPrescriptions = [
  {
    _id: "p1",
    date: "2024-09-10",
    refillRequested: false, // NEW field for demo
    doctor: { name: "Dr. Aisha Khan", specialty: "Dermatologist" },
    diagnosis: "Mild Eczema",
    medicines: [
      {
        name: "Hydrocortisone Cream 1%",
        dosage: "Apply twice daily",
        duration: "7 days",
        pillCount: 14,
        initialCount: 14,
        threshold: 3,
        isSmartStockEnabled: false,
        lastTaken: null,
      },
      {
        name: "Cetirizine 10mg",
        dosage: "1 tablet at night if needed",
        duration: "5 days",
        pillCount: 5,
        initialCount: 5,
        threshold: 2,
        isSmartStockEnabled: true,
        lastTaken: "2024-02-20T08:30:00Z",
      },
    ],
  },
  {
    _id: "p2",
    date: "2024-08-15",
    refillRequested: true,
    doctor: { name: "Dr. Ben Carter", specialty: "Pediatrician" },
    diagnosis: "Viral Pharyngitis (Sore Throat)",
    medicines: [
      {
        name: "Ibuprofen Syrup",
        dosage: "5ml every 6-8 hours",
        duration: "3 days",
        pillCount: 30,
        initialCount: 30,
        threshold: 5,
        isSmartStockEnabled: true,
        lastTaken: "2024-02-21T12:45:00Z",
      },
      {
        name: "Lozenges",
        dosage: "1 lozenge every 3-4 hours",
        duration: "As needed",
        pillCount: 10,
        initialCount: 10,
        threshold: 2,
        isSmartStockEnabled: false,
        lastTaken: null,
      },
    ],
  },
];

// --- Reusable Prescription Card ---
const PrescriptionCard = ({
  prescription,
  onTakeDose,
  onToggleSmartStock,
  onRequestRefill,
}) => {
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
          <p className="text-blue-600 dark:text-blue-400">
            {prescription.doctor.specialty}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-400 mt-1">
            Prescribed on: {new Date(prescription.date).toDateString()}
          </p>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <p className="text-gray-700 dark:text-gray-400">Diagnosis</p>
          <p className="text-black dark:text-white font-semibold">
            {prescription.diagnosis}
          </p>
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
              <tr
                key={index}
                className="text-black dark:text-white"
              >
                <td className="p-2 border-t">{med.name}</td>
                <td className="p-2 border-t">{med.dosage}</td>
                <td className="p-2 border-t">{med.duration}</td>
                <td className="p-2 border-t">
                  <button
                    onClick={() =>
                      onToggleSmartStock(
                        prescription._id,
                        index,
                        !med.isSmartStockEnabled
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      med.isSmartStockEnabled
                        ? "bg-green-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        med.isSmartStockEnabled
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="p-2 border-t">
                  {med.isSmartStockEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {med.pillCount} left
                      </span>
                      <button
                        onClick={() =>
                          onTakeDose(prescription._id, index)
                        }
                        disabled={med.pillCount <= 0}
                        className={`px-3 py-1 rounded text-sm ${
                          med.pillCount <= 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
        >
          Download PDF
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded">
          Order Medicines
        </button>
        {/* NEW Request Refill Button */}
        {prescription.refillRequested ? (
          <span className="bg-yellow-500 text-white py-2 px-4 rounded font-semibold">
            Refill Requested
          </span>
        ) : (
          <button
            onClick={() => onRequestRefill(prescription._id)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded"
          >
            Request Refill
          </button>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const MyPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const alertedMeds = new Set();
    prescriptions.forEach((prescription) => {
      prescription.medicines.forEach((med) => {
        if (
          med.isSmartStockEnabled &&
          med.pillCount <= med.threshold &&
          !alertedMeds.has(`${prescription._id}-${med.name}`)
        ) {
          alertedMeds.add(`${prescription._id}-${med.name}`);
          setTimeout(() => showRefillAlert(med.name, med.threshold), 500);
        }
      });
    });
  }, []);

  const handleTakeDose = (prescriptionId, medIndex) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p._id === prescriptionId) {
          const updatedMeds = [...p.medicines];
          const medicine = updatedMeds[medIndex];
          if (medicine.pillCount > 0) {
            const newCount = medicine.pillCount - 1;
            updatedMeds[medIndex] = {
              ...medicine,
              pillCount: newCount,
              lastTaken: new Date().toISOString(),
            };
            if (newCount === medicine.threshold) {
              setTimeout(
                () => showRefillAlert(medicine.name, medicine.threshold),
                300
              );
            }
          }
          return { ...p, medicines: updatedMeds };
        }
        return p;
      })
    );
  };

  const toggleSmartStock = (prescriptionId, medIndex, enable) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p._id === prescriptionId) {
          const updatedMeds = [...p.medicines];
          updatedMeds[medIndex] = {
            ...updatedMeds[medIndex],
            isSmartStockEnabled: enable,
          };
          return { ...p, medicines: updatedMeds };
        }
        return p;
      })
    );
  };

  const handleRequestRefill = async (prescriptionId) => {
  try {
    const response = await fetch('/api/refills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include Authorization header if you use JWT
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ originalPrescriptionId: prescriptionId })
    });

    if (response.ok) {
      toast.success('Refill request sent!');
      setPrescriptions(prev =>
        prev.map(p =>
          p._id === prescriptionId ? { ...p, refillRequested: true } : p
        )
      );
    } else {
      const err = await response.json();
      toast.error(err.message || 'Error requesting refill');
    }
  } catch (err) {
    console.error(err);
    toast.error('Something went wrong while requesting refill');
  }
};


  const showRefillAlert = (medName, threshold) => {
    toast.info(
      <div>
        <p>⚠️ Low Stock: {medName}</p>
        <p>Only {threshold} doses left</p>
      </div>,
      { position: "bottom-center" }
    );
  };

  if (loading)
    return (
      <div className="text-center p-10 text-xl">
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
        {prescriptions.length > 0 ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            {prescriptions.map((p) => (
              <PrescriptionCard
                key={p._id}
                prescription={p}
                onTakeDose={handleTakeDose}
                onToggleSmartStock={toggleSmartStock}
                onRequestRefill={handleRequestRefill}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 rounded-lg">
            <p className="text-xl">You do not have any prescriptions yet.</p>
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
};

export default MyPrescriptionsPage;
