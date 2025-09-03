import React, { useState, useEffect, useRef } from "react";
import {
  getMyAppointments,
  updateAppointmentStatus,
  getAppointmentSummary,
  saveAppointmentVoiceNote,
  updateRelayNote,
  downloadIntakeForm,
} from "../api";
import toast from "react-hot-toast";
import DoctorNotesModal from "../components/DoctorNotesModal";
import RelayNote from "../components/RelayNote";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { Calendar } from "lucide-react";
import FollowUpModal from "../components/FollowUpModal";

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  // const { user } = useAuth(); // Removed unused import
  const [filter, setFilter] = useState("Pending"); // To filter by status
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [uploading, setUploading] = useState(false);
  const streamRef = useRef(null);
  const chunks = useRef([]);
  const [isRelayNoteOpen, setIsRelayNoteOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    recorder.start();
    setRecording(true);
    setAudioURL(null);

    recorder.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));
      chunks.current = [];
      // Stop all tracks to release the mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleReRecord = () => {
    setAudioURL(null);
  };

  // Example upload function

  const handleUpload = (id) => {
    if (audioURL) {
      setUploading(true);
      fetch(audioURL)
        .then((res) => res.blob())
        .then((blob) => {
          const formData = new FormData();
          formData.append("file", blob);
          formData.append("upload_preset", UPLOAD_PRESET);

          fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.secure_url) {
                toast.success("Upload successful!");
                saveAppointmentVoiceNote(id, data.secure_url)
                  .then(() => {
                    toast.success("Voice note saved to appointment!");
                    fetchAppointments();
                  })
                  .catch(() =>
                    toast.error("Failed to save voice note to appointment.")
                  );
              } else {
                toast.error("Upload failed. Please try again.");
              }
            })
            .catch(() => {
              toast.error("Upload failed. Please try again.");
            })
            .finally(() => setUploading(false));
        });
    }
  };
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await getMyAppointments();
      // The API returns an object like { success, count, data: [...] }
      // We need to set the inner 'data' array to the state.
      setAppointments(data.data || []);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Could not fetch appointments.");
      setAppointments([]); // Ensure state is an array even on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, newStatus, doctorNotes = "") => {
    const originalAppointments = [...appointments];

    // Optimistically update the UI
    const updatedAppointments = appointments.map((appt) =>
      appt._id === id ? { ...appt, status: newStatus, doctorNotes } : appt
    );
    setAppointments(updatedAppointments);

    try {
      await updateAppointmentStatus(id, { status: newStatus, doctorNotes });
      toast.success(`Appointment successfully ${newStatus.toLowerCase()}!`);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
      setAppointments(originalAppointments);
    }
  };

  const openNotesModal = (id) => {
    setSelectedApptId(id);
    setIsNotesModalOpen(true);
  };

  const handleNotesSubmit = (notes) => {
    if (selectedApptId) {
      handleStatusUpdate(selectedApptId, "Completed", notes);
    }
  };

  const handleViewSummary = async (id) => {
    setSummaryLoading(true);
    setIsSummaryModalOpen(true);
    try {
      const { data } = await getAppointmentSummary(id);
      setSummary(data.summary);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Could not fetch summary.");
      setSummary("Failed to load summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(
    (appt) => appt.status === filter
  );

  return (
    <div className="bg-primary-dark min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          Manage Your Appointments
        </h1>

        {/* --- Filter Tabs --- */}
        <div className="flex border-b border-gray-700 mb-6">
          {["Pending", "Confirmed", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`py-2 px-6 font-semibold ${
                filter === status
                  ? "border-b-2 border-accent-blue text-accent-blue"
                  : "text-secondary-text"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* --- Appointments List --- */}
        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-secondary-dark p-4 rounded-lg shadow-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
                    {/* Patient Details */}
                    <div className="lg:col-span-2">
                      <p className="font-bold text-lg text-white">
                        {appt.patient.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {appt.symptoms.substring(0, 50)}...
                      </p>
                    </div>
                    {/* Date & Time */}
                    <div>
                      <p className="font-semibold text-white">
                        {new Date(appt.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-secondary-text">
                        {appt.appointmentTime}
                      </p>
                    </div>
                    {/* Booking Type */}
                    <div className="text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          appt.bookingType === "In-Home Visit"
                            ? "bg-blue-900 text-blue-300"
                            : "bg-teal-900 text-teal-300"
                        }`}
                      >
                        {appt.bookingType}
                      </span>
                    </div>
                    {appt.sharedRelayNotes &&
                      appt.sharedRelayNotes.length > 0 && (
                        <div className="bg-yellow-100 text-black p-3 rounded mb-2 border border-yellow-400">
                          <strong>Relay Notes from previous visits:</strong>
                          <ul>
                            {appt.sharedRelayNotes.map((relay, idx) => (
                              <li key={idx} className="mb-2">
                                <span className="font-semibold">
                                  {relay.doctorName} ({relay.doctorDesignation}
                                  ):
                                </span>
                                <br />
                                {relay.note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {/* Actions */}
                    <div className="flex flex-col md:flex-row gap-2 justify-end">
                      {appt.status !== "Cancelled" && (
                        <button
                          onClick={() => handleViewSummary(appt._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-3 rounded"
                        >
                          View Summary
                        </button>
                      )}
                      {/* Download Intake Form available to confirmed or completed appointments */}
                      {(appt.status === "Confirmed" || appt.status === "Completed") && (
                        <button
                          onClick={async () => {
                            try {
                              const resp = await downloadIntakeForm(appt._id);
                              if (!resp.ok) throw new Error('Failed to fetch intake form');
                              const blob = await resp.blob();
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, '_blank');
                              // optional: revoke after some time
                              setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                            } catch (err) {
                              toast.error('Could not open intake form.');
                            }
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold py-2 px-3 rounded"
                        >
                          Open Intake Form
                        </button>
                      )}
                      {appt.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(appt._id, "Confirmed")
                            }
                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-3 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(appt._id, "Cancelled")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-3 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appt.status === "Confirmed" && (
                        <button
                          onClick={() => openNotesModal(appt._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-3 rounded"
                        >
                          Mark as Complete
                        </button>
                      )}
                      {appt.status === "Completed" && (
                        <button
                          onClick={() => {
                            setSelectedApptId(appt._id);
                            setIsFollowUpModalOpen(true);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-3 rounded"
                        >
                          Follow-up
                        </button>
                      )}
                    </div>
                  </div>
                  {/* --- Display Doctor's Notes for Completed Appointments --- */}
                  {appt.status === "Completed" && appt.doctorNotes && (
                    <div className="border-t border-gray-700 mt-4 pt-4">
                      <h4 className="font-bold text-white mb-2">Your Notes:</h4>
                      <p className="text-secondary-text bg-primary-dark p-3 rounded">
                        {appt.doctorNotes}
                      </p>
                    </div>
                  )}
                  {/* --- Voice Note Section --- */}
                  {appt.status === "Completed" && (
                    <div className="my-3 p-3 rounded bg-gray-800">
                      <h4 className="text-white font-semibold mb-2">
                        Voice Note
                      </h4>
                      <div className="flex flex-col md:flex-row gap-3 items-center">
                        {appt.voiceRecording ? (
                          // If voice note exists, show only the audio player
                          <audio
                            controls
                            src={appt.voiceRecording}
                            className="mx-2"
                          />
                        ) : (
                          // If not, show recording/upload UI
                          <>
                            {!recording && (
                              <button
                                onClick={() => {
                                  setSelectedApptId(appt._id);
                                  startRecording();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                              >
                                Start Recording
                              </button>
                            )}
                            {recording && (
                              <button
                                onClick={stopRecording}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                              >
                                Stop Recording
                              </button>
                            )}
                            {audioURL && !recording && (
                              <>
                                <audio
                                  controls
                                  src={audioURL}
                                  className="mx-2"
                                />
                                <button
                                  onClick={handleReRecord}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                                >
                                  Re-record
                                </button>
                                <button
                                  onClick={() => handleUpload(appt._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                  disabled={uploading}
                                >
                                  {uploading ? "Uploading..." : "Upload"}
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {/* --- Relay Note Section --- */}
                  {appt.status === "Completed" && (appt.relayNote ? (
                    <div className="bg-secondary-dark p-4 rounded-lg shadow-lg">
                      <strong>Relay Note:</strong>
                      <p>{appt.relayNote}</p>
                      <button
                        onClick={() => {
                          setSelectedAppt(appt);
                          setIsRelayNoteOpen(true);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded mt-2"
                      >
                        Edit Relay Note
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setIsRelayNoteOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mt-2"
                    >
                      Add Relay Note
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title={`No ${filter} Appointments`}
                message="When a patient books a visit, it will appear here."
              />
            )}
          </div>
        )}
      </div>

      <DoctorNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onSubmit={handleNotesSubmit}
      />

      <Modal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        title="AI-Generated Patient Summary"
      >
        {summaryLoading ? (
          <p>Loading summary...</p>
        ) : (
          <pre className="whitespace-pre-wrap font-sans">{summary}</pre>
        )}
      </Modal>
      <RelayNote
        isOpen={isRelayNoteOpen}
        onClose={() => setIsRelayNoteOpen(false)}
        appointmentId={selectedAppt?._id}
        initialValue={selectedAppt?.relayNote || ""}
        onSubmit={(relayNote) => {
          if (selectedAppt) {
            updateRelayNote(selectedAppt._id, relayNote)
              .then(() => {
                toast.success("Relay note saved successfully!");
                fetchAppointments();
              })
              .catch(() => toast.error("Failed to save relay note."));
          }
          setIsRelayNoteOpen(false);
        }}
        />
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        appointmentId={selectedApptId}
        onFollowUpScheduled={fetchAppointments}
      />
    </div>
  );
};

export default DoctorAppointmentsPage;
