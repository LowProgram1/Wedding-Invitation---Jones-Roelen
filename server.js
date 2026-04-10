const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const uploadsDir = path.join(__dirname, "uploads");
const DATA_FILE = path.join(__dirname, "data", "rsvps.json");

// Load persisted data on startup
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { guestIdCounter: 0, records: [] };
  }
}

// Save current state to disk
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ guestIdCounter, records: inMemoryRsvps }, null, 2), "utf8");
}

const stored = loadData();
const inMemoryRsvps = stored.records || [];
let guestIdCounter = stored.guestIdCounter || 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers for every response
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' https://cdn.jsdelivr.net https://cdn.tailwindcss.com 'unsafe-inline'",
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  next();
});

// Security: only allow the exact admin path under /9vy5no94r1
// Any other sub-path (including guessed folder names) redirects to landing page
const ADMIN_SEGMENT = "/9vy5no94r1";
const ADMIN_PATH = "/9vy5no94r1/gh18iuor8a";
const ADMIN_ALLOWED = new Set([
  ADMIN_PATH,
  ADMIN_PATH + "/",
  ADMIN_PATH + "/index.html",
]);

app.use((req, res, next) => {
  if (req.path.startsWith(ADMIN_SEGMENT) && !ADMIN_ALLOWED.has(req.path)) {
    return res.redirect("/");
  }
  next();
});

app.use(express.static(publicDir));

// Uploads: read-only — block any method other than GET/HEAD and reject path traversal
app.use("/uploads", (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(403).json({ message: "Forbidden." });
  }
  // Block path traversal attempts
  const safePath = path.normalize(req.path);
  if (safePath.includes("..")) {
    return res.status(403).json({ message: "Forbidden." });
  }
  next();
});
app.use("/uploads", express.static(uploadsDir, { dotfiles: "deny" }));

const injectionPattern = /(<[^>]+>|<\/?\w+|--|;|'|"|`|select\s|insert\s|update\s|delete\s|drop\s|alter\s|exec\s|script|onerror|onload|javascript:|union\s|from\s+\w|where\s+\w)/i;

function hasInjection(str) {
  return injectionPattern.test(str);
}

function wordCount(str) {
  return str.trim() === "" ? 0 : str.trim().split(/\s+/).length;
}

app.post("/api/rsvp", (req, res) => {
  const numberOfGuests = Number(req.body?.numberOfGuests || 0);
  const rawNames = Array.isArray(req.body?.guestNames)
    ? req.body.guestNames.map((name) => String(name || "").trim()).filter(Boolean)
    : [];
  const attendance = String(req.body?.attendance || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!numberOfGuests || numberOfGuests < 1 || numberOfGuests > 20) {
    return res.status(400).json({ message: "Number of guests must be between 1 and 20." });
  }

  if (rawNames.length !== numberOfGuests) {
    return res.status(400).json({ message: "Guest names must match the number of guests." });
  }

  const hasInvalidName = rawNames.some((name) => !name || name.length > 50);
  if (hasInvalidName) {
    return res.status(400).json({ message: "Each guest name is required and must be 50 characters or less." });
  }

  if (rawNames.some((name) => hasInjection(name))) {
    return res.status(400).json({ message: "Invalid characters detected in guest name." });
  }

  if (!["yes", "no"].includes(attendance.toLowerCase())) {
    return res.status(400).json({ message: "Attendance must be yes or no." });
  }

  if (wordCount(message) > 100) {
    return res.status(400).json({ message: "Message must not exceed 100 words." });
  }

  if (message && hasInjection(message)) {
    return res.status(400).json({ message: "Invalid characters detected in message." });
  }

  // Duplicate check against stored guest names (stored as { id, name } objects)
  const existingNames = inMemoryRsvps.flatMap((r) => r.guestNames.map((g) => g.name.toLowerCase().trim()));
  const duplicate = rawNames.find((name) => existingNames.includes(name.toLowerCase().trim()));
  if (duplicate) {
    return res.status(409).json({ message: `"${duplicate}" has already submitted an RSVP response.` });
  }

  // Assign a unique ID to each guest name
  const guestNames = rawNames.map((name) => ({ id: ++guestIdCounter, name }));

  const entry = {
    id: inMemoryRsvps.length + 1,
    numberOfGuests,
    guestNames,
    attendance: attendance.toLowerCase(),
    message,
    createdAt: new Date().toISOString(),
  };

  inMemoryRsvps.push(entry);
  saveData();
  return res.status(201).json({ message: "RSVP received successfully!", rsvp: entry });
});

app.get("/api/rsvp", (_req, res) => {
  res.json({ total: inMemoryRsvps.length, records: inMemoryRsvps });
});

// Delete a single guest by their unique guest ID
// Must be defined before /api/rsvp/:id so "guest" isn't treated as an :id
app.delete("/api/rsvp/guest/:guestId", (req, res) => {
  const guestId = Number(req.params.guestId);
  const record = inMemoryRsvps.find((r) => r.guestNames.some((g) => g.id === guestId));
  if (!record) {
    return res.status(404).json({ message: "Guest not found." });
  }

  record.guestNames = record.guestNames.filter((g) => g.id !== guestId);
  record.numberOfGuests = record.guestNames.length;

  // If no guests remain, remove the whole record
  if (record.guestNames.length === 0) {
    const idx = inMemoryRsvps.findIndex((r) => r.id === record.id);
    inMemoryRsvps.splice(idx, 1);
  }

  saveData();
  return res.status(200).json({ message: "Guest deleted." });
});

// Delete an entire RSVP record by record ID
app.delete("/api/rsvp/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = inMemoryRsvps.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Record not found." });
  }
  inMemoryRsvps.splice(index, 1);
  saveData();
  return res.status(200).json({ message: "Record deleted." });
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Endpoint not found." });
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});
