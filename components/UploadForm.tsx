"use client";

import { useState } from "react";
import JSZip from "jszip";

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

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setResult(await res.json());
    } catch (err: any) {
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  function saveAsJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json"
    });
    triggerDownload(blob, "scan-result.json");
  }

  async function saveAsZip() {
    if (!result) return;
    const zip = new JSZip();
    zip.file("scan-result.json", JSON.stringify(result, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    triggerDownload(blob, "scan-result.zip");
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="upload-wrapper">
      <form onSubmit={handleSubmit} className="upload-form">
        <label className="file-label">
          <span>ZIP ファイルを選択</span>
          <input type="file" name="file" accept=".zip" />
        </label>

        <button className="primary-btn" disabled={loading}>
          {loading ? "解析中..." : "解析する"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <div className="result-box">
          <h2>解析結果</h2>
          <p className="file-count">ファイル数: {result.fileCount}</p>

          <div className="button-row">
            <button className="secondary-btn" onClick={saveAsJson}>
              JSON で保存
            </button>
            <button className="secondary-btn" onClick={saveAsZip}>
              ZIP で保存
            </button>
          </div>

          <pre className="result-preview">
            {JSON.stringify(result.tree.slice(0, 50), null, 2)}
          </pre>
        </div>
      )}

      <style jsx>{`
        .upload-wrapper {
          margin-top: 24px;
        }

        .upload-form {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #e9e9e9;
          border-radius: 6px;
          cursor: pointer;
        }

        .file-label input {
          display: none;
        }

        .primary-btn {
          padding: 8px 16px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .primary-btn:hover {
          background: #0059c9;
        }

        .error-text {
          color: #d33;
          margin-top: 12px;
        }

        .result-box {
          margin-top: 32px;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .file-count {
          margin-bottom: 16px;
          color: #444;
        }

        .button-row {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .secondary-btn {
          padding: 8px 14px;
          background: #444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .secondary-btn:hover {
          opacity: 0.85;
        }

        .result-preview {
          max-height: 400px;
          overflow: auto;
          background: #111;
          color: #eee;
          padding: 12px;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
