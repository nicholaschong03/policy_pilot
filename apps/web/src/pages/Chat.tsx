import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export default function Chat() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<any>(null);
  const ask = async () => {
    const { data } = await axios.post(`${API}/chat`, { query: q });
    setRes(data);
  };
  return (
    <div>
      <h2>Chat with KB</h2>
      <input value={q} onChange={e => setQ(e.target.value)} style={{ width: "100%", padding: 8 }} placeholder="Ask a question..." />
      <button onClick={ask} style={{ marginTop: 8 }}>Ask</button>
      {res && (
        <div style={{ marginTop: 16 }}>
          <pre>{res.answer}</pre>
          <small>Confidence: {res.confidence}</small>
        </div>
      )}
    </div>
  );
}


