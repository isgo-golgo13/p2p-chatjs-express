import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import https from "https";
import { PeerSocket } from "./peersocket.mjs";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.HTTP_PORT || 8080;
const TLS_PORT = process.env.HTTPS_PORT || 8443;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// For ES module support: Get the filename and directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load TLS certificates for HTTPS
const serverOptions = {
  cert: fs.readFileSync(path.join(__dirname, "../certs/server-cert.pem")),
  key: fs.readFileSync(path.join(__dirname, "../certs/server-key.pem")),
  ca: fs.readFileSync(path.join(__dirname, "../certs/ca-cert.pem")),
  requestCert: false,
  rejectUnauthorized: false, // Reject unauthorized connections
};

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

// Serve environment variables for the client
app.get("/env", (req, res) => {
  res.json({ wsPort: PORT });
});

// Non-TLS HTTP Server
const httpServer = http.createServer(app);
const peerSocket = new PeerSocket(httpServer, REDIS_URL);
httpServer.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

// TLS HTTPS Server
const httpsServer = https.createServer(serverOptions, app);
const peerSocketTls = new PeerSocket(httpsServer, REDIS_URL);
httpsServer.listen(TLS_PORT, () => {
  console.log(`HTTPS server running on port ${TLS_PORT}`);
});
