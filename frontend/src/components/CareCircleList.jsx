import { useEffect, useState } from "react";
import axios from "axios";

export default function CareCirclePage() {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Family");

  useEffect(() => {
    axios
      .get("/api/profile/my-care-circle")
      .then((res) => setMembers(res.data?.members || []))
      .catch((err) => console.error(err));
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/profile/my-care-circle/invite", {
        email,
        role,
      });
      const updatedMembers = res.data.members;
      setMembers(updatedMembers);
      setEmail("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>My Care Circle</h2>
      <ul>
        {members.map((m, i) => (
          <li key={i}>
            {m.email || m.user?.email} — {m.role} ({m.status})
          </li>
        ))}
      </ul>

      <form onSubmit={handleInvite}>
        <h3>Invite New Member</h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Family">Family</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
        </select>
        <button type="submit">Invite</button>
      </form>
    </div>
  );
}
