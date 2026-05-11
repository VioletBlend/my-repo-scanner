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

    const file = (e.currentTarget.file as any).files?.[0];
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

      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json());
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function saveAsJson() {
    if (!result) return;

    const blob = new Blob(
      [JSON.stringify(result, null, 2)],
      { type: "application/json;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scan-result.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit} className="form">
        <label className="filePicker">
          <span>ZIP ファイルを選択</span>
          <input type="file" name="file" accept=".zip" />
        </label>

        <button className="primary" disabled={loading}>
          {loading ? "解析中…" : "解析する"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h2>解析結果</h2>
          <p className="count">ファイル数: {result.fileCount}</p>

          <div className="actions">
            <button className="secondary" onClick={saveAsJson}>
              JSON で保存
            </button>
          </div>

          <pre className="preview">
            {JSON.stringify(result.tree.slice(0, 50), null, 2)}
          </pre>
        </div>
      )}

      <style jsx>{`
        .wrapper {
          margin-top: 24px;
        }

        .form {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filePicker {
          background: #f5f5f5;
          padding: 10px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          border: 1px solid #ddd;
          transition: background 0.2s;
        }

        .filePicker:hover {
          background: #e9e9e9;
        }

        .filePicker input {
          display: none;
        }

        .primary {
          padding: 10px 18px;
          background: #0066d6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .primary:hover {
          background: #0052ad;
        }

        .error {
          color: #d33;
          margin-top: 12px;
        }

        .result {
          margin-top: 32px;
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .count {
          margin-bottom: 16px;
          color: #444;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .secondary {
          padding: 8px 14px;
          background: #444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: opacity 0.2s;
        }

        .secondary:hover {
          opacity: 0.85;
        }

        .preview {
          max-height: 400px;
          overflow: auto;
          background: #111;
          color: #eee;
          padding: 14px;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
