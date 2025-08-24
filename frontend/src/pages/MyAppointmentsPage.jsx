import React, { useState, useEffect } from "react";
import { getMyAppointments } from "../api";
import toast from "react-hot-toast";
import IconCalendarCheck from "../components/icons/IconCalendarCheck";
import IconHistory from "../components/icons/IconHistory";
import IconStethoscope from "../components/icons/IconStethoscope";
import EmptyState from "../components/EmptyState";
import { Calendar, MessageCircle } from "lucide-react";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-primary-dark p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
import useAuthStore from "../store/useAuthStore";

const AppointmentCard = ({ appointment, onAppointmentUpdate }) => {
  // Helper to generate WhatsApp share text
  const getShareText = () => {
    const doctorName = appointment.doctor?.name || "N/A";
    const specialty = appointment.doctor?.specialty || "";
    const date = new Date(appointment.appointmentDate).toLocaleDateString(
      "en-GB",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
    const time = appointment.appointmentTime;
    return `Hi! Just a reminder about my upcoming Doc@Home appointment with Dr. ${doctorName} (${specialty}) on ${date} at ${time}.`;
  };

  // Handler for WhatsApp share
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Combine date and time for accurate comparison
  const appointmentDateStr = appointment.appointmentDate; // e.g., "2025-07-02"
  const appointmentTimeStr = appointment.appointmentTime; // e.g., "01:00 PM"
  const [time, period] = appointmentTimeStr.split(" ");
  const [hours, minutes] = time.split(":");
  let hour24 = parseInt(hours);
  if (period === "PM" && hour24 !== 12) hour24 += 12;
  if (period === "AM" && hour24 === 12) hour24 = 0;
  const appointmentDateTime = new Date(appointmentDateStr);
  appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);
  const now = new Date();
  const isUpcoming =
    appointment.status === "Confirmed" && appointmentDateTime > now;

  // Check if appointment can be cancelled (within 2 hours policy)
  const canCancel = () => {
    if (!["Pending", "Confirmed"].includes(appointment.status)) {
      return false;
    }

    const appointmentDateStr = appointment.appointmentDate; // e.g., "2025-07-02"
    const appointmentTimeStr = appointment.appointmentTime; // e.g., "01:00 PM"

    // Convert 12-hour format to 24-hour format for proper parsing
    const [time, period] = appointmentTimeStr.split(" ");
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours);

    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    const appointmentDateTime = new Date(appointmentDateStr);
    appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);

    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);

    return hoursUntilAppointment >= 2;
  };

  const handleCancelAppointment = async () => {
    setCancelling(true);
    try {
      await updateAppointmentStatus(appointment._id, { status: "Cancelled" });

      // Show different success messages based on payment method
      if (appointment.paymentMethod === "careFund") {
        toast.success(
          `Appointment cancelled successfully! ₹${appointment.fee} has been refunded to your care fund.`
        );
      } else {
        toast.success("Appointment cancelled successfully");
      }

      setShowCancelModal(false);
      onAppointmentUpdate(); // Refresh the appointments list
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to cancel appointment");
    } finally {
      setCancelling(false);
    }
  };
const AppointmentCard = ({ appointment }) => {
  const appointmentDate = new Date(appointment.appointmentDate);

  return (
    <div className="bg-accent-cream dark:bg-primary-dark p-5 rounded-lg shadow-lg border border-gray-700 hover:border-accent transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <IconStethoscope className="w-8 h-8 text-accent mr-4" />
          <div>
            <h3 className="text-xl font-bold text-white">
              {appointment.doctor?.name || "N/A"}
              {appointment.doctor?.name || "N/A"}
            </h3>

            <p className="text-secondary-text">
              {appointment.doctor?.specialty || "N/A"}
              {appointment.doctor?.specialty || "N/A"}
            </p>
          </div>
        </div>
        <div
          className={`text-sm font-semibold px-3 py-1 rounded-full h-fit ${
            appointment.status === "Completed"
              ? "bg-green-900 text-green-300"
              : appointment.status === "Confirmed"
                ? "bg-blue-900 text-blue-300"
                : "bg-yellow-900 text-yellow-300"
            }`}
          >
            {appointment.status}
          </div>
          {canCancel() && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelling..." : "Cancel Appointment"}
            </button>
          )}
          {/* Share button for confirmed, upcoming appointments */}
          {isUpcoming && (
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors mt-2"
              title="Share via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>Share</span>
            </button>
          )}
          }`}
        >
          {appointment.status}
        </div>
      </div>

      {appointment.status === "Completed" && appointment.doctorNotes && (
        <>
          <div className="border-t border-gray-700 my-4"></div>
          <div>
            <h4 className="font-bold text-white mb-2">Doctor's Notes:</h4>
            <p className="text-secondary-text bg-primary-dark rounded">
              {appointment.doctorNotes}
            </p>
          </div>
        </>
      )}

      {appointment.voiceRecording && (
        <div className="mt-4">
          <h4 className="font-bold text-white mb-2">Voice Note:</h4>
          <audio controls src={appointment.voiceRecording} className="w-full" />
        </div>
      )}

      <div className="border-t border-gray-700 my-4"></div>
      <div className="flex justify-between items-center text-secondary-text">
        <div>
          <p className="font-semibold text-white">
            {appointmentDateStr.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p>{appointment.appointmentTime}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">Booking Type</p>
          <p>{appointment.bookingType}</p>
        </div>
      </div>
    </div>
  );
};

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await getMyAppointments();
        setAppointments(data.data || []);
      } catch (error) {
        toast.error("Could not fetch your appointments.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAppointments();
  }, [user]);

  const filteredAppointments = appointments.filter((appt) => {
    const appointmentDate = new Date(appt.appointmentDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return activeTab === "Upcoming"
      ? appointmentDate >= now
      : appointmentDate < now;
  });

  if (loading) {
    return (
      <div className="text-center p-10 text-white">
        Loading your appointments...
      </div>
    );
  }

  return (
    <div className="dark:bg-background-dark min-h-screen">
      <div className="relative bg-my-appointments-bg bg-cover bg-center h-60">
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center">
          <h1 className="text-5xl font-bold text-white tracking-wider">
            My Appointments
          </h1>
        </div>
      </div>
      <div className="container mx-auto p-4 sm:p-8">
        <div className="bg-accent-cream dark:bg-secondary-dark p-6 rounded-lg shadow-2xl">
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab("Upcoming")}
              className={`flex items-center py-3 px-6 font-semibold text-lg transition-all duration-300 ${
                activeTab === "Upcoming"
                  ? "text-black dark:text-gray-400 border-b-2 border-accent"
                  : "text-gray-500 hover:text-gray-600 dark:hover:text-white"
              }`}
            >
              <IconCalendarCheck className="w-5 h-5 mr-2" />
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("Past")}
              className={`flex items-center py-3 px-6 font-semibold text-lg transition-all duration-300 ${
                activeTab === "Past"
                  ? "text-black dark:text-gray-400 border-b-2 border-accent"
                  : "text-gray-500 hover:text-gray-600 dark:hover:text-white"
              }`}
            >
              <IconHistory className="w-5 h-5 mr-2" />
              Past
            </button>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAppointments.map((appt) => (
                <AppointmentCard key={appt._id} appointment={appt} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-800 dark:text-secondary-text py-20">
              <h2 className="text-2xl font-semibold mb-2">
                No {activeTab} Appointments
              </h2>
              <p>It looks like you don't have any appointments here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointmentsPage;