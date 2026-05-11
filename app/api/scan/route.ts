import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import os from "os";

type FileNode = {
  type: "file" | "directory";
  name: string;
  path: string;
  role?: string;
  children?: FileNode[];
};

// 最低限の安全な役割判定
function detectRole(fileName: string): string {
  if (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) return "TypeScript Source";
  if (fileName.endsWith(".js")) return "JavaScript Source";
  if (fileName.endsWith(".json")) return "JSON Data";
  if (fileName.endsWith(".md")) return "Markdown Document";
  if (fileName.endsWith(".css")) return "CSS Stylesheet";
  return "File";
}

function walkDirectory(dirPath: string, basePath: string): FileNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  return entries.map((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      return {
        type: "directory",
        name: entry.name,
        path: relativePath,
        children: walkDirectory(fullPath, basePath)
      };
    }

    return {
      type: "file",
      name: entry.name,
      path: relativePath,
      role: detectRole(entry.name)
    };
  });
}

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
