"use client";

import { useState } from "react";

type FileNode = {
  type: "file" | "directory";
  name: string;
  path: string;
  role?: string;
  children?: FileNode[];
};

type ScanResult = {
  fileCount: number;
  tree: FileNode[];
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

          <div className="tree">
            {result.tree.map((node) => (
              <div key={node.path} className="node">
                <span className="name">{node.name}</span>
                {node.role && <span className="role">{node.role}</span>}
              </div>
            ))}
          </div>
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
          background: #f3f3f3;
          padding: 10px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          border: 1px solid #ccc;
          transition: background 0.2s;
        }

        .filePicker:hover {
          background: #e7e7e7;
        }

        .filePicker input {
          display: none;
        }

        .primary {
          padding: 10px 18px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .primary:hover {
          background: #1d4ed8;
        }

        .error {
          color: #d33;
          margin-top: 12px;
        }

        .result {
          margin-top: 32px;
          background: white;
          padding: 24px;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: opacity 0.2s;
        }

        .secondary:hover {
          opacity