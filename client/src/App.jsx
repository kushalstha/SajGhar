import { useState } from "react";

const API = "http://localhost:8000";

const checker = {
  background:
    "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50% / 20px 20px",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [time, setTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch(`${API}/upload`, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }
      setTime(res.headers.get("X-Process-Time"));
      setResult(URL.createObjectURL(await res.blob()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>SajGhar: Garment Upload (v0.1)</h1>
      <input type="file" accept="image/*" onChange={onSelect} />
      <button
        onClick={onUpload}
        disabled={!file || loading}
        style={{ marginLeft: 12 }}
      >
        {loading ? "Processing..." : "Remove background"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {time && <p>Processing time: {time}s</p>}

      <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
        {preview && (
          <div>
            <h3>Original</h3>
            <img src={preview} alt="original" style={{ maxWidth: 400 }} />
          </div>
        )}
        {result && (
          <div>
            <h3>Result</h3>
            <img
              src={result}
              alt="result"
              style={{ maxWidth: 400, ...checker }}
            />
          </div>
        )}
      </div>
    </div>
  );
}