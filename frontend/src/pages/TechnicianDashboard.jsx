import { useState } from "react";
import axios from "axios";

const TechnicianDashboard = ({ labTests, fetchLabTests }) => {
  const [loadingId, setLoadingId] = useState(null);

  const updateStatus = async (id, newStatus) => {
    try {
      setLoadingId(id);
      const token = localStorage.getItem("token"); // adjust if using context
      await axios.put(
        `/api/lab-tests/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLabTests(); // re-fetch list after update
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2>Technician Dashboard</h2>
      {labTests.map((test) => (
        <div key={test._id} className="card">
          <p>
            <strong>{test.testName}</strong>
          </p>
          <p>Status: {test.status}</p>
          <div>
            <button
              onClick={() => updateStatus(test._id, "Sample Collected")}
              disabled={loadingId === test._id}
            >
              Sample Collected
            </button>
            <button
              onClick={() => updateStatus(test._id, "Report Ready")}
              disabled={loadingId === test._id}
            >
              Report Ready
            </button>
            <button
              onClick={() => updateStatus(test._id, "Completed")}
              disabled={loadingId === test._id}
            >
              Completed
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechnicianDashboard;
