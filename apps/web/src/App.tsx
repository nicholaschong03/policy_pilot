import { Routes, Route, Link, NavLink } from "react-router-dom";
import Chat from "./pages/Chat";
import Triage from "./pages/Triage";
import KB from "./pages/KB";

export default function App() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <NavLink to="/chat">Chat</NavLink>
        <NavLink to="/triage">Triage</NavLink>
        <NavLink to="/kb">KB Manager</NavLink>
      </header>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/triage" element={<Triage />} />
        <Route path="/kb" element={<KB />} />
      </Routes>
    </div>
  );
}


