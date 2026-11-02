import { useState } from "react";
import AuthScreen from "./AuthScreen.jsx";
import Dashboard from "./Dashboard.jsx";
import Landing from "./Landing.jsx";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [screen, setScreen] = useState(() =>
    localStorage.getItem("token") ? "dashboard" : "landing"
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || ""
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername("");
    setScreen("landing");
  };

  const onAuthed = (newToken, name) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", name);
    setToken(newToken);
    setUsername(name);
    setScreen("dashboard");
  };

  if (screen === "dashboard") {
    return (
      <Dashboard token={token} username={username} onLogout={logout} />
    );
  }

  return (
    <>
      <Landing onStart={() => setScreen(token ? "dashboard" : "auth")} />
      {screen === "auth" && (
        <AuthScreen
          onAuthed={onAuthed}
          onBack={() => setScreen("landing")}
        />
      )}
    </>
  );
}
