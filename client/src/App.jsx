import { useCallback, useEffect, useRef, useState } from "react";
import AuthScreen from "./AuthScreen.jsx";
import { API } from "./config.js";
import Landing from "./Landing.jsx";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [screen, setScreen] = useState("landing");
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || ""
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername("");
    setScreen("landing");
  }, []);

  const onAuthed = (newToken, name) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", name);
    setToken(newToken);
    setUsername(name);
    setScreen("wardrobe");
  };

  if (screen === "wardrobe") {
    return <Wardrobe token={token} username={username} onLogout={logout} />;
  }

  return (
    <>
      <Landing onStart={() => setScreen(token ? "wardrobe" : "auth")} />
      {screen === "auth" && (
        <AuthScreen
          onAuthed={onAuthed}
          onBack={() => setScreen("landing")}
        />
      )}
    </>
  );
}

function Brand() {
  return (
    <header className="header">
      <img src="src/assets/logo.png" alt="SajGhar logo" className="logo" />
      <div>
        <h1 className="brand">SajGhar</h1>
        <p className="tagline">Your digital wardrobe</p>
      </div>
    </header>
  );
}

function Wardrobe({ token, username, onLogout }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const authHeader = { Authorization: `Bearer ${token}` };

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch(`${API}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return onLogout();
      if (!res.ok) throw new Error("Could not load wardrobe");
      setItems(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }, [token, onLogout]);

  // Initial load when the page opens
  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/items`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 401) {
          onLogout();
          return null;
        }
        if (!res.ok) throw new Error("Could not load wardrobe");
        return res.json();
      })
      .then((data) => {
        if (data && !cancelled) setItems(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [token, onLogout]);

  const onSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setTime(null);
    setError("");
  };

  const onUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: authHeader,
        body: form,
      });
      if (res.status === 401) return onLogout();
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }
      setTime(res.headers.get("X-Process-Time"));
      setResult(URL.createObjectURL(await res.blob()));
      await loadItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${API}/items/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      if (res.status === 401) return onLogout();
      if (!res.ok) throw new Error("Delete failed");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <div className="topbar">
        <Brand />
        <div className="user">
          <span>{username}</span>
          <button className="btn" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>

      <h2 className="section-title">Add garment</h2>
      <div className="upload-row">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelect}
          hidden
        />
        <button className="btn" onClick={() => inputRef.current.click()}>
          Choose photo
        </button>
        {file && <span className="file-name">{file.name}</span>}
        <button
          className="btn primary"
          onClick={onUpload}
          disabled={!file || loading}
        >
          {loading ? "Processing…" : "Remove background"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {time && <p className="meta">Processed in {time}s</p>}

      {(preview || result) && (
        <div className="compare">
          {preview && (
            <figure>
              <figcaption>Original</figcaption>
              <div className="frame">
                <img src={preview} alt="original" />
              </div>
            </figure>
          )}
          {result && (
            <figure>
              <figcaption>Result</figcaption>
              <div className="frame">
                <img src={result} alt="result" />
              </div>
            </figure>
          )}
        </div>
      )}

      <hr className="divider" />

      <h2 className="section-title">
        Wardrobe <span className="count">{items.length}</span>
      </h2>

      {items.length === 0 ? (
        <div className="empty">No items yet</div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div className="tile" key={item.id}>
              <div className="thumb">
                <img
                  src={`${API}${item.image_url}`}
                  alt={item.original_name}
                />
              </div>
              <div className="name">{item.original_name}</div>
              <button
                className="remove"
                onClick={() => onDelete(item.id)}
                aria-label="Delete item"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}