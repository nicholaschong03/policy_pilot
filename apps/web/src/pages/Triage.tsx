import { useState } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function Triage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [res, setRes] = useState<any>(null);
  const run = async () => {
    const { data } = await axios.post(`${API}/tickets/triage`, { subject, body });
    setRes(data);
  };
  return (
    <div>
      <h2>Ticket Triage</h2>
      <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" style={{ width: "100%", padding: 8 }} />
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Body" style={{ width: "100%", height: 120, padding: 8, marginTop: 8 }} />
      <button onClick={run} style={{ marginTop: 8 }}>Triage</button>
      {res && (
        <div style={{ marginTop: 16 }}> 
          <div><b>Category:</b> {res.category}</div>
          <div><b>Priority:</b> {res.priority}</div>
          <div><b>Action:</b> {res.action}</div>
          <div><b>SLA:</b> {res.sla?.first_response_minutes}m / {res.sla?.resolution_hours}h</div>
          <pre style={{ whiteSpace: "pre-wrap" }}>{res.suggested_reply}</pre>
        </div>
      )}
    </div>
  );
}


