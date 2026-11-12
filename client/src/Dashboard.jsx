import { useCallback, useEffect, useRef, useState } from "react";
import { API } from "./config.js";
import TodayPage from "./pages/TodayPage.jsx";
import WardrobePage from "./pages/WardrobePage.jsx";
import OutfitStudioPage from "./pages/OutfitStudioPage.jsx";
import ArMirrorPage from "./pages/ArMirrorPage.jsx";
import PlannerPage from "./pages/PlannerPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import logo from "./assets/logo.png";
import "./Dashboard.css";

export default function Dashboard({ token, username, onLogout, onUsernameChange }) {
  const inputRef = useRef(null);
  const wardrobeRef = useRef(null);
  const [activePage, setActivePage] = useState("today");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [processTime, setProcessTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const loadItems = useCallback(async () => {
    try {
      const response = await fetch(`${API}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        onLogout();
        return;
      }
      if (!response.ok) throw new Error("Could not load your wardrobe.");
      setItems(await response.json());
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [onLogout, token]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/items`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.status === 401) {
          onLogout();
          return null;
        }
        if (!response.ok) throw new Error("Could not load your wardrobe.");
        return response.json();
      })
      .then((data) => {
        if (data && !cancelled) setItems(data);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [onLogout, token]);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
      if (result) URL.revokeObjectURL(result);
    },
    [preview, result]
  );

  const choosePhoto = () => inputRef.current?.click();

  const scrollToWardrobe = () => {
    wardrobeRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onSelect = (event) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    if (!selectedFile) return;

    if (preview) URL.revokeObjectURL(preview);
    if (result) URL.revokeObjectURL(result);
    setFile(selectedFile);
    setFileName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setProcessTime(null);
    setError("");
    setActivePage("wardrobe");
    setTimeout(() => scrollToWardrobe(), 20);
  };

  const onUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("name", fileName);
      const response = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (response.status === 401) {
        onLogout();
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || "Could not process this photo.");
      }

      setProcessTime(response.headers.get("X-Process-Time"));
      setResult(URL.createObjectURL(await response.blob()));
      await loadItems();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (item) => {
    if (!window.confirm(`Delete ${item.original_name || "this garment"}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/items/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        onLogout();
        return;
      }
      if (!response.ok) throw new Error("Could not delete this garment.");
      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem.id !== item.id)
      );
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : "there";
  const initials = username.slice(0, 2).toUpperCase() || "SG";

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="#today" aria-label="SajGhar home">
          <img src={logo} alt="" />
          <span>SAJGHAR</span>
        </a>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <button
            className={`dashboard-nav-link ${activePage === "today" ? "active" : ""}`}
            onClick={() => setActivePage("today")}
            aria-current={activePage === "today" ? "page" : undefined}
          >
            <span>01</span> Today
          </button>
          <button
            className={`dashboard-nav-link ${activePage === "wardrobe" ? "active" : ""}`}
            onClick={() => {
              setActivePage("wardrobe");
              setTimeout(() => scrollToWardrobe(), 20);
            }}
            aria-current={activePage === "wardrobe" ? "page" : undefined}
          >
            <span>02</span> My wardrobe
          </button>
          <button
            className={`dashboard-nav-link ${activePage === "studio" ? "active" : ""}`}
            onClick={() => setActivePage("studio")}
            aria-current={activePage === "studio" ? "page" : undefined}
          >
            <span>03</span> Outfit studio
          </button>
          <button
            className={`dashboard-nav-link ${activePage === "mirror" ? "active" : ""}`}
            onClick={() => setActivePage("mirror")}
            aria-current={activePage === "mirror" ? "page" : undefined}
          >
            <span>04</span> AR mirror
          </button>
          <button
            className={`dashboard-nav-link ${activePage === "planner" ? "active" : ""}`}
            onClick={() => setActivePage("planner")}
            aria-current={activePage === "planner" ? "page" : undefined}
          >
            <span>05</span> Planner
          </button>
          <button
            className={`dashboard-nav-link ${activePage === "settings" ? "active" : ""}`}
            onClick={() => setActivePage("settings")}
            aria-current={activePage === "settings" ? "page" : undefined}
          >
            <span>06</span> Settings
          </button>
        </nav>

        <div className="dashboard-profile">
          <button
            className="dashboard-profile-link"
            onClick={() => setActivePage("settings")}
            aria-label="Open settings"
          >
            <span className="dashboard-avatar">{initials}</span>
            <span className="dashboard-profile-name">
              <strong>{displayName}</strong>
              <span>View profile</span>
            </span>
          </button>
          <button className="dashboard-signout" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>

      {activePage === "today" && (
        <TodayPage
          items={items}
          username={username}
          choosePhoto={choosePhoto}
          openWardrobe={() => {
            setActivePage("wardrobe");
            setTimeout(() => scrollToWardrobe(), 20);
          }}
        />
      )}

      {activePage === "wardrobe" && (
        <WardrobePage
          items={items}
          file={file}
          fileName={fileName}
          preview={preview}
          result={result}
          processTime={processTime}
          loading={loading}
          error={error}
          choosePhoto={choosePhoto}
          onDelete={onDelete}
          onUpload={onUpload}
          wardrobeRef={wardrobeRef}
          setFileName={setFileName}
          setFile={setFile}
          setPreview={setPreview}
          setResult={setResult}
          setProcessTime={setProcessTime}
          setError={setError}
        />
      )}

      {activePage === "studio" && (
        <OutfitStudioPage
          items={items}
          openWardrobe={() => setActivePage("wardrobe")}
          openMirror={() => setActivePage("mirror")}
        />
      )}
      {activePage === "mirror" && (
        <ArMirrorPage
          items={items}
          openWardrobe={() => setActivePage("wardrobe")}
        />
      )}
      {activePage === "planner" && <PlannerPage items={items} />}
      {activePage === "settings" && (
        <SettingsPage username={username} onUsernameChange={onUsernameChange} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelect}
        hidden
      />
    </div>
  );
}
