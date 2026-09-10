import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const PUBLIC_DIR = __dirname;

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("Method Not Allowed");
  }

  try {
    const cleanUrl = decodeURIComponent(req.url.split("?")[0]);
    const requestedFile = (cleanUrl === "/" || cleanUrl === "/home") ? "/index.html" : cleanUrl;


    const normalizedPath = requestedFile.replace(/\\/g, "/");
    const filePath = path.join(PUBLIC_DIR, normalizedPath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      return res.end("Forbidden");
    }

    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
      res.end("<h1>404 - Archivo no encontrado</h1>");
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Servidor activo en: http://localhost:${PORT}`);
});