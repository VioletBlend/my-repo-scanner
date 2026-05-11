"use client";

import { useState } from "react";

type ScanResult = {
  fileCount: number;
  tree: any[];
};

export default function UploadForm() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const formEl = e.currentTarget;
    const fileInput = formEl.file as any;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("ZIP ファイルを選択してください。");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API error");
      }

      const json = await res.json();
      setResult(json);
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function saveResult() {
    if (!result) return;

    const text = JSON.stringify(result, null, 2);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "scan-result.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ marginTop: 20 }}>
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" accept=".zip" />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginLeft: 8,
            padding: "8px 12px",
            background: "#0070f3",
            color: "white",
            borderRadius: 4,
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "スキャン中..." : "スキャンする"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>解析結果</h2>
          <p>ファイル数: {result.fileCount}</p>

          <button
            onClick={saveResult}
            style={{
              padding: "8px 12px",
              marginBottom: 16,
              background: "#28a745",
              color: "white",
              borderRadius: 4,
              border: "none",
              cursor: "pointer"
            }}
          >
            解析結果を保存
          </button>

          <pre
            style={{
              maxHeight: 400,
              overflow: "auto",
              background: "#111",
              color: "#eee",
              padding: 12,
              borderRadius: 4,
              fontSize: 12
            }}
          >
            {JSON.stringify(result.tree.slice(0, 50), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
