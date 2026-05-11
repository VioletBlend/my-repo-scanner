import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";

type FileNode = {
  type: "file";
  name: string;
  path: string;
  content: string;
};

type DirNode = {
  type: "directory";
  name: string;
  path: string;
  children: NodeType[];
};

type NodeType = FileNode | DirNode;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "file がありません" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "repo-zip-"));
    const zip = new AdmZip(buffer);
    zip.extractAllTo(tempDir, true);

    const tree: NodeType[] = [];

    function walk(currentPath: string, basePath: string): NodeType[] {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      const nodes: NodeType[] = [];

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relPath = path.relative(basePath, fullPath);

        if (entry.isDirectory() && entry.name === ".git") {
          continue;
        }

        if (entry.isDirectory()) {
          const children = walk(fullPath, basePath);
          nodes.push({
            type: "directory",
            name: entry.name,
            path: relPath,
            children
          });
        } else {
          let content = "";
          try {
            content = fs.readFileSync(fullPath, "utf8");
          } catch {
            content = "";
          }

          nodes.push({
            type: "file",
            name: entry.name,
            path: relPath,
            content
          });
        }
      }

      return nodes;
    }

    const rootEntries = fs.readdirSync(tempDir, { withFileTypes: true });
    for (const entry of rootEntries) {
      const fullPath = path.join(tempDir, entry.name);
      const relPath = path.relative(tempDir, fullPath);

      if (entry.isDirectory()) {
        tree.push({
          type: "directory",
          name: entry.name,
          path: relPath,
          children: walk(fullPath, tempDir)
        });
      } else {
        let content = "";
        try {
          content = fs.readFileSync(fullPath, "utf8");
        } catch {
          content = "";
        }

        tree.push({
          type: "file",
          name: entry.name,
          path: relPath,
          content
        });
      }
    }

    const fileCount = countFiles(tree);

    return NextResponse.json({
      fileCount,
      tree
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "internal error" },
      { status: 500 }
    );
  }
}

function countFiles(nodes: NodeType[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file") {
      count += 1;
    } else {
      count += countFiles(node.children);
    }
  }
  return count;
}
