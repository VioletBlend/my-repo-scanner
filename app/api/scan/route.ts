import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import os from "os";

// -----------------------------
// ① ファイルの役割を推測
// -----------------------------
function analyzeFileRole(filePath: string, content: string) {
  const lower = content.toLowerCase();

  if (filePath.includes("api/") || lower.includes("nextresponse")) {
    return "API Route (Next.js)";
  }

  if (lower.includes("export default function page")) {
    return "Page Component (Next.js)";
  }

  if (lower.includes("use state") || lower.includes("useeffect")) {
    return "React Component";
  }

  if (lower.includes("class ") && lower.includes("service")) {
    return "Service Class";
  }

  if (filePath.endsWith(".config.js") || filePath.endsWith(".config.ts")) {
    return "Configuration File";
  }

  if (filePath.endsWith(".json")) {
    return "JSON Data File";
  }

  if (filePath.endsWith(".md")) {
    return "Documentation";
  }

  return "General Source File";
}

// -----------------------------
// ② ディレクトリの意味付け
// -----------------------------
function analyzeDirectoryPurpose(dir: string) {
  if (dir === "app") return "Next.js App Router のルート";
  if (dir === "components") return "UI コンポーネント";
  if (dir === "api") return "サーバー API";
  if (dir === "lib") return "共通ロジック";
  if (dir === "hooks") return "React Hooks";
  if (dir === "utils") return "ユーティリティ関数";
  if (dir === "public") return "静的ファイル";

  return "一般的なフォルダ";
}

// -----------------------------
// ZIP 展開 → 再帰解析
// -----------------------------
function walkDirectory(dirPath: string, basePath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries.map((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      return {
        type: "directory",
        name: entry.name,
        path: relativePath,
        purpose: analyzeDirectoryPurpose(entry.name),
        children: walkDirectory(fullPath, basePath)
      };
    }

    const content = fs.readFileSync(fullPath, "utf-8");

    return {
      type: "file",
      name: entry.name,
      path: relativePath,
      role: analyzeFileRole(relativePath, content),
      size: content.length
    };
  });
}

// -----------------------------
// API Route
// -----------------------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "repo-"));
    const zip = new AdmZip(buffer);
    zip.extractAllTo(tmpDir, true);

    const tree = walkDirectory(tmpDir, tmpDir);

    return NextResponse.json({
      fileCount: tree.length,
      tree
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
