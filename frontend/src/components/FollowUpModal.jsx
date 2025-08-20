import React, { useState } from "react";
import Modal from "./Modal";
import toast from "react-hot-toast";
import { scheduleFollowUp } from "../api";

const FollowUpModal = ({
  isOpen,
  onClose,
  appointmentId,
  onFollowUpScheduled,
}) => {
  const [timeframe, setTimeframe] = useState("14");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + parseInt(timeframe));

    try {
      await scheduleFollowUp(appointmentId, {
        followUpDate: followUpDate.toISOString().split("T")[0],
        note,
      });
      toast.success("Follow-up scheduled successfully!");
      onFollowUpScheduled();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule follow-up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Follow-up">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-primary-dark p-6 rounded-xl shadow-lg"
      >
        <div>
          <label
            htmlFor="timeframe"
            className="block text-sm font-semibold text-accent-blue mb-2"
          >
            Remind in
          </label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full px-3 py-2 bg-secondary-dark text-white border border-accent-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="note"
            className="block text-sm font-semibold text-accent-blue mb-2"
          >
            Personal Note
          </label>
          <textarea
            id="note"
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 bg-secondary-dark text-white border border-accent-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="Let's check on your progress."
          ></textarea>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-blue to-indigo-600 text-white font-bold shadow hover:from-indigo-600 hover:to-accent-blue transition"
          >
            {loading ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FollowUpModal;
