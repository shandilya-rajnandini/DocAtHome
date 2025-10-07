import React, { useState, useEffect } from "react";
import { getMyAppointments, updateAppointmentStatus } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useApi } from "../hooks";
import IconCalendarCheck from "../components/icons/IconCalendarCheck";
import IconHistory from "../components/icons/IconHistory";
import IconStethoscope from "../components/icons/IconStethoscope";
import EmptyState from "../components/EmptyState";
import {
  Calendar,
  MessageCircle,
  CalendarPlus,
  ChevronDown,
} from "lucide-react";
import {
  generateGoogleCalendarUrl,
  downloadICSFile,
} from "../utils/calendarUtils";

// Cancellation Policy Modal Component
const CancellationModal = ({
  isOpen,
  onClose,
  onConfirm,
  appointment,
  isLoading,
}) => {
  if (!isOpen) return null;

  const appointmentDate = new Date(
    appointment.appointmentDate
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-primary-dark p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Cancel Appointment
        </h3>

        {/* Appointment Details */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Appointment Details:
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Doctor:</strong> {appointment.doctor?.name}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Date & Time:</strong> {appointmentDate} at{" "}
            {appointment.appointmentTime}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Type:</strong> {appointment.bookingType}
          </p>
          {appointment.fee && (
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Fee:</strong> ₹{appointment.fee}
            </p>
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            📋 Cancellation Policy
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>
              • Appointments must be cancelled at least 24 hours in advance
            </li>
            <li>
              • Cancellations within 24 hours of the appointment time are not
              permitted
            </li>
            {appointment.paymentMethod === "careFund" && (
              <li>
                • Your care fund balance will be refunded upon successful
                cancellation
              </li>
            )}
            <li>• This action cannot be undone once confirmed</li>
          </ul>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to cancel this appointment? Please confirm that
          you understand the cancellation policy.
        </p>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Keep Appointment
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // Calendar handlers
  const handleAddToGoogleCalendar = () => {
    const calendarUrl = generateGoogleCalendarUrl(appointment);
    window.open(calendarUrl, "_blank");
  };

  const handleDownloadICS = () => {
    downloadICSFile(appointment);
    toast.success("Calendar file downloaded successfully!");
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCalendarDropdown &&
        !event.target.closest(".calendar-dropdown-container")
      ) {
        setShowCalendarDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendarDropdown]);
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

  // Check if appointment can be cancelled (within 24 hours policy)
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

    return hoursUntilAppointment >= 24;
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
      const errorMessage =
        error.response?.data?.msg || "Failed to cancel appointment";

      // Show specific error toast based on the error message
      if (errorMessage.includes("24 hours")) {
        toast.error(
          "❌ Cancellation not allowed - Appointments must be cancelled at least 24 hours in advance",
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }

      setShowCancelModal(false); // Close modal even on error
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-accent-cream dark:bg-primary-dark p-5 rounded-lg shadow-lg border border-gray-700 hover:border-accent transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <IconStethoscope className="w-8 h-8 text-accent mr-4" />
          <div>
            <h3 className="text-xl font-bold text-white">
              {appointment.doctor?.name || "N/A"}
            </h3>
            <p className="text-secondary-text">
              {appointment.doctor?.specialty || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-full h-fit ${
              appointment.status === "Completed"
                ? "bg-green-900 text-green-300"
                : appointment.status === "Confirmed"
                ? "bg-blue-900 text-blue-300"
                : appointment.status === "Cancelled"
                ? "bg-red-900 text-red-300"
                : "bg-yellow-900 text-yellow-300"
            }`}
          >
            {appointment.status}
          </div>
          {["Pending", "Confirmed"].includes(appointment.status) && (
            <>
              {canCancel() ? (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? "Cancelling..." : "Cancel Appointment"}
                </button>
              ) : (
                <div
                  className="px-3 py-1 text-xs bg-gray-600 text-gray-300 rounded-lg cursor-not-allowed"
                  title="Cannot cancel within 24 hours of appointment"
                >
                  Cannot Cancel
                </div>
              )}
            </>
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

          {/* Add to Calendar button for confirmed appointments */}
          {appointment.status === "Confirmed" && (
            <div className="relative mt-2 calendar-dropdown-container">
              <button
                onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                title="Add to Calendar"
              >
                <CalendarPlus className="w-4 h-4 mr-1" />
                <span>Add to Calendar</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </button>

              {/* Calendar dropdown */}
              {showCalendarDropdown && (
                <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                  <button
                    onClick={() => {
                      handleAddToGoogleCalendar();
                      setShowCalendarDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4 inline mr-2" />
                    Google Calendar
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadICS();
                      setShowCalendarDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Download (.ics)
                  </button>
                </div>
              )}
            </div>
          )}
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
      {/* Show voice note if present */}
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
          {appointment.fee && (
            <>
              <p className="font-semibold text-white mt-2">Fee</p>
              <p>₹{appointment.fee}</p>
            </>
          )}
          {appointment.paymentMethod && (
            <>
              <p className="font-semibold text-white mt-2">Payment</p>
              <p
                className={
                  appointment.paymentMethod === "careFund"
                    ? "text-blue-400"
                    : "text-green-400"
                }
              >
                {appointment.paymentMethod === "careFund"
                  ? "Care Fund"
                  : "External Payment"}
              </p>
            </>
          )}
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

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelAppointment}
        appointment={appointment}
        isLoading={cancelling}
      />
    </div>
  );
};

const MyAppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const { user } = useAuth();

  // Use the useApi hook for handling appointments
  const {
    data: appointmentsResponse,
    loading,
    request: fetchAppointments,
  } = useApi(getMyAppointments, {
    defaultErrorMessage: "Could not fetch your appointments.",
  });

  // Extract appointments from the API response
  const appointments = appointmentsResponse?.data || [];

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  const filteredAppointments = appointments.filter((appt) => {
    const appointmentDate = new Date(appt.appointmentDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (activeTab === "Upcoming") {
      return (
        (appointmentDate >= now ||
          ["Pending", "Confirmed"].includes(appt.status)) &&
        appt.status !== "Cancelled" &&
        appt.status !== "Completed"
      );
    } else if (activeTab === "Cancelled") {
      return appt.status === "Cancelled";
    } else {
      // 'Past' - completed appointments and past dates
      return (
        appt.status === "Completed" ||
        (appointmentDate < now && appt.status !== "Cancelled")
      );
    }
  });

  if (loading) {
    return (
      <div className="text-center p-10 text-white">
        Loading your appointments...
      </div>
    );
  }

  return (
    <div className=" dark:bg-background-dark min-h-screen">
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
                  ? "text-black  dark:text-gray-400 border-b-2 border-accent"
                  : "  text-gray-500 hover:text-gray-600 dark:hover:text-white"
              }`}
            >
              <IconCalendarCheck className="w-5 h-5 mr-2" />
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("Cancelled")}
              className={`flex items-center py-3 px-6 font-semibold text-lg transition-all duration-300 ${
                activeTab === "Cancelled"
                  ? "text-black  dark:text-gray-400 border-b-2 border-accent"
                  : "text-gray-500 hover:text-gray-600 dark:hover:text-white"
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Cancelled
            </button>
            <button
              onClick={() => setActiveTab("Past")}
              className={`flex items-center py-3 px-6 font-semibold text-lg transition-all duration-300 ${
                activeTab === "Past"
                  ? "text-black  dark:text-gray-400 border-b-2 border-accent"
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
                <AppointmentCard
                  key={appt._id}
                  appointment={appt}
                  onAppointmentUpdate={() => fetchAppointments()}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title={`No ${activeTab} Appointments`}
              message="It looks like you don't have any appointments here."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointmentsPage;
