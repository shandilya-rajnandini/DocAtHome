/**
 * Calendar utilities for generating calendar links
 */

/**
 * Converts 12-hour time format to 24-hour format
 * @param {string} time12h - Time in 12-hour format (e.g., "01:00 PM")
 * @returns {string} - Time in 24-hour format (e.g., "13:00")
 */
const convertTo24Hour = (time12h) => {
  const [time, period] = time12h.split(" ");
  const [hours, minutes] = time.split(":");
  let hour24 = parseInt(hours);

  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, "0")}:${minutes}`;
};

/**
 * Formats date and time for calendar APIs
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} timeString - Time in 12-hour format
 * @returns {object} - Object with formatted start and end datetime
 */
const formatDateTime = (dateString, timeString) => {
  const time24 = convertTo24Hour(timeString);
  const startDateTime = new Date(`${dateString}T${time24}:00`);

  // Assume 1-hour appointment duration
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

  return {
    start: startDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
    end: endDateTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
  };
};

/**
 * Generates Google Calendar URL for an appointment
 * @param {object} appointment - Appointment object
 * @returns {string} - Google Calendar URL
 */
export const generateGoogleCalendarUrl = (appointment) => {
  const { start, end } = formatDateTime(
    appointment.appointmentDate,
    appointment.appointmentTime
  );

  const title = `Doc@Home Appointment with Dr. ${
    appointment.doctor?.name || "N/A"
  }`;
  const description = `
Appointment Details:
- Doctor: Dr. ${appointment.doctor?.name || "N/A"}
- Specialty: ${appointment.doctor?.specialty || "N/A"}
- Type: ${appointment.bookingType}
- Symptoms: ${appointment.symptoms || "N/A"}
- Fee: ₹${appointment.fee}

This appointment was scheduled through the Doc@Home platform.
  `.trim();

  // Determine location based on booking type
  let location = "";
  if (appointment.bookingType === "In-Home Visit") {
    location = "In-Home Visit - Address will be shared separately";
  } else if (appointment.bookingType === "Video Consultation") {
    location = "Video Consultation - Link will be provided";
  } else if (appointment.bookingType === "Nurse Assignment") {
    location = "Nurse Assignment - Location will be confirmed";
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details: description,
    location: location,
    trp: "false", // Don't show in Google's "Trips" feature
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generates an ICS file content for downloading
 * @param {object} appointment - Appointment object
 * @returns {string} - ICS file content
 */
export const generateICSFile = (appointment) => {
  const { start, end } = formatDateTime(
    appointment.appointmentDate,
    appointment.appointmentTime
  );

  const title = `Doc@Home Appointment with Dr. ${
    appointment.doctor?.name || "N/A"
  }`;
  const description = `Appointment with Dr. ${
    appointment.doctor?.name || "N/A"
  } (${appointment.doctor?.specialty || "N/A"}) - ${appointment.bookingType}`;

  // Determine location based on booking type
  let location = "";
  if (appointment.bookingType === "In-Home Visit") {
    location = "In-Home Visit";
  } else if (appointment.bookingType === "Video Consultation") {
    location = "Video Consultation";
  } else if (appointment.bookingType === "Nurse Assignment") {
    location = "Nurse Assignment";
  }

  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Doc@Home//Appointment//EN
BEGIN:VEVENT
UID:${appointment._id}@docathome.com
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

/**
 * Downloads an ICS file
 * @param {object} appointment - Appointment object
 */
export const downloadICSFile = (appointment) => {
  const icsContent = generateICSFile(appointment);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `doc-at-home-appointment-${appointment._id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
