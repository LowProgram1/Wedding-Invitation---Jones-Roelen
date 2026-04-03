# Jones & Roelen Wedding Website

A wedding invitation website for **Jones & Roelen**, celebrating their union on **June 27, 2026**. Built with plain HTML/CSS/JavaScript on the frontend and a lightweight Node.js/Express backend. Includes an RSVP system with file-based persistence and a password-protected admin panel.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [Setup and Installation](#5-setup-and-installation)
6. [Running the Server](#6-running-the-server)
7. [Pages and Features](#7-pages-and-features)
8. [API Reference](#8-api-reference)
9. [RSVP Data Persistence](#9-rsvp-data-persistence)
10. [Image Uploads](#10-image-uploads)
11. [Security](#11-security)
12. [Deploying to Hostinger Business Plan](#12-deploying-to-hostinger-business-plan)
13. [General Deployment Notes](#13-general-deployment-notes)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Project Overview

The site serves as a digital wedding invitation with the following sections:

- **Hero** — couple's names, wedding date, and countdown timer
- **Event Details** — ceremony/reception time, dress code, venue with map link
- **Wedding Program** — order of events for the day
- **RSVP** — guest submission form (name, attendance, optional message)
- **Gift Guide** — GCash and Landbank QR codes for monetary gifts
- **Footer** — closing message

An **admin panel** (accessed via a hidden URL) lets the couple view, manage, and delete submitted RSVPs.

---

## 2. Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | HTML5, CSS3, vanilla JavaScript              |
| Animations | [GSAP](https://cdn.jsdelivr.net/npm/gsap)    |
| Backend    | Node.js + Express 5                          |
| Persistence| JSON file (`data/rsvps.json`)                |
| Images     | Served statically from `uploads/`            |

No build step is required. The frontend is plain static files served by Express.

---

## 3. Project Structure

```
jones-roelen-wedInvitation/
├── server.js               # Express server — API, security middleware, static serving
├── package.json
├── data/
│   └── rsvps.json          # Persisted RSVP records (auto-created on first submit)
├── uploads/                # Uploaded images (served read-only at /uploads/)
│   ├── hero-Bg/
│   ├── gallery/
│   ├── venues/
│   ├── dressCode/
│   └── qr/
└── public/                 # Static frontend files
    ├── index.html          # Main landing/invitation page
    ├── main.js             # Frontend JS (RSVP form, GSAP animations, modals)
    ├── styles.css          # All styles
    └── 9vy5no94r1/
        └── gh18iuor8a/
            └── index.html  # Admin panel (hidden URL)
```

---

## 4. Prerequisites

- **Node.js** v18 or later (v20 LTS recommended)
- **npm** (bundled with Node.js)
- **Git** (to clone the repository)

Verify your environment:

```bash
node -v
npm -v
```

---

## 5. Setup and Installation

### Clone the repository

```bash
git clone https://github.com/LowProgram1/jones-Roelen-wedding.git
cd jones-Roelen-wedding
```

### Install dependencies

```bash
npm install
```

This installs only `express`. No build step is needed.

### Prepare the data directory

The `data/rsvps.json` file is created automatically when the first RSVP is submitted. If you want to initialize it manually:

```bash
mkdir -p data
echo '{"guestIdCounter":0,"records":[]}' > data/rsvps.json
```

---

## 6. Running the Server

```bash
npm start
```

The server starts on port **3000** by default. Open the site at:

```
http://localhost:3000
```

To use a different port, set the `PORT` environment variable:

```bash
PORT=8080 npm start
```

---

## 7. Pages and Features

### Landing Page — `http://localhost:3000`

| Feature | Description |
|---|---|
| Countdown Timer | Live countdown to June 27, 2026 |
| Floating Hearts | GSAP-animated hearts throughout all sections |
| RSVP Form | Guests enter name(s), attendance (yes/no), optional message |
| Duplicate Guard | Re-submission with an existing name is blocked (409 response) |
| Confirmation Modal | Custom modal confirms successful RSVP submission |

### Admin Panel

The admin panel is accessible at a non-guessable URL. The URL is shared privately with the couple.

| Feature | Description |
|---|---|
| RSVP Table | Lists all submitted guests with attendance, message, and timestamp |
| Delete Guest | Removes a single guest; deletes the whole record if they were the only guest |
| View Message | Opens a modal showing the full message for a guest |
| Unknown URL Guard | Any guess at the admin path redirects to the landing page |

---

## 8. API Reference

### `POST /api/rsvp`

Submit a new RSVP.

**Request body (JSON or form-encoded):**

| Field | Type | Constraints |
|---|---|---|
| `numberOfGuests` | number | 1–20 |
| `guestNames` | string[] | Array of names, length must match `numberOfGuests`; max 50 chars each |
| `attendance` | string | `"yes"` or `"no"` |
| `message` | string | Optional; max 100 words |

**Responses:**

| Status | Meaning |
|---|---|
| `201` | RSVP created successfully |
| `400` | Validation error (see `message` field) |
| `409` | Duplicate — a name in the submission already has an RSVP |

---

### `GET /api/rsvp`

Retrieve all RSVP records.

**Response:**

```json
{
  "total": 3,
  "records": [
    {
      "id": 1,
      "numberOfGuests": 2,
      "guestNames": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
      ],
      "attendance": "yes",
      "message": "So excited!",
      "createdAt": "2026-04-01T10:00:00.000Z"
    }
  ]
}
```

---

### `DELETE /api/rsvp/guest/:guestId`

Delete a single guest by their unique guest ID. If this was the last guest in a record, the entire record is removed.

**Response:**

| Status | Meaning |
|---|---|
| `200` | Guest deleted |
| `404` | Guest ID not found |

---

### `DELETE /api/rsvp/:id`

Delete an entire RSVP record by record ID.

**Response:**

| Status | Meaning |
|---|---|
| `200` | Record deleted |
| `404` | Record ID not found |

---

## 9. RSVP Data Persistence

RSVP data is saved to `data/rsvps.json` after every submission or deletion. The file stores:

```json
{
  "guestIdCounter": 5,
  "records": [ ... ]
}
```

- `guestIdCounter` — a monotonically increasing counter so guest IDs are never reused, even after server restarts.
- `records` — the full array of RSVP entries.

The file is read once on server startup and written synchronously on every mutating request. **Data survives server restarts.**

---

## 10. Image Uploads

Images are stored in the `uploads/` directory and served read-only at `/uploads/`. The subfolders are:

| Folder | Purpose |
|---|---|
| `hero-Bg/` | Hero section background image |
| `gallery/` | Wedding gallery photos |
| `venues/` | Venue photos |
| `dressCode/` | Dress code reference images |
| `qr/` | GCash and Landbank QR codes |

To replace an image, copy your file directly into the appropriate subfolder on the server and rename it to match the existing filename. The server does not expose an upload API.

---

## 11. Security

The following security measures are in place:

### HTTP Security Headers (all responses)

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, microphone, geolocation blocked |
| `Content-Security-Policy` | Restricts scripts/styles/fonts to self + trusted CDNs; blocks `object-src` |

### Admin Panel URL Protection

Any request that starts with the admin segment but does not exactly match the known admin path is redirected to `/`. This prevents URL enumeration or guessing sub-paths.

### Upload Protection

- All non-`GET`/`HEAD` requests to `/uploads/` return `403 Forbidden`.
- Path traversal attempts (`../`) are detected and blocked.
- Dotfiles (e.g., `.htaccess`) are denied.

### Input Validation and XSS Prevention

- Guest names and messages are validated for length, word count, and injection patterns (SQL, HTML tags, JavaScript keywords).
- The admin panel HTML-escapes all user-supplied content before rendering it in the DOM.
- `onclick` handlers use safe numeric indices into an in-memory array rather than embedding raw strings in HTML attributes.

### Catch-All API Handler

All unmatched `/api/` paths return `404 JSON` instead of redirecting. This prevents a `fetch()` call from silently following a redirect to a `200 OK` response and treating a failed request as a success.

---

## 12. Deploying to Hostinger Business Plan

Hostinger's Business shared hosting plan includes Node.js support, SSH access, and a free SSL certificate. Follow the steps below to deploy this project.

---

### Step 1 — Log in to hPanel

Go to [hpanel.hostinger.com](https://hpanel.hostinger.com) and open the dashboard for your domain.

---

### Step 2 — Enable Node.js

1. In hPanel, navigate to **Websites → your domain → Node.js**.
2. Click **Enable**.
3. Set:
   - **Node.js version**: `20.x` (or the latest LTS available)
   - **Application root**: the subfolder where your project will live (e.g., `jones-wedding` — avoid the `public_html` root if you have other sites)
   - **Application startup file**: `server.js`
4. Note the **application URL** and the **port** Hostinger assigns — you will need the port number.

---

### Step 3 — Upload project files via SFTP

Use an SFTP client such as [FileZilla](https://filezilla-project.org/) or your IDE's built-in SFTP:

1. In hPanel, go to **Hosting → SSH Access** and enable SSH.  
   Note your **SSH hostname**, **port**, **username**, and **password**.
2. Connect with SFTP (same credentials as SSH, port is usually `65002` or as shown in hPanel).
3. Navigate to the application root folder you set in Step 2.
4. Upload everything **except** `node_modules/`:

```
server.js
package.json
package-lock.json
public/         (entire folder)
uploads/        (entire folder with all images)
data/           (folder — see note below)
```

> **data/ folder**: Upload the folder itself. If `rsvps.json` already exists locally with real RSVP data you want to keep, upload it too. Otherwise, you can let the server create it on the first RSVP submission.

---

### Step 4 — Install dependencies via SSH

1. In hPanel, open **SSH Access → Launch SSH Terminal** (browser terminal), or connect via your local terminal:

```bash
ssh your_username@your_hostname -p 65002
```

2. Navigate to your application root:

```bash
cd ~/jones-wedding
```

3. Install dependencies:

```bash
npm install --omit=dev
```

---

### Step 5 — Set directory permissions

The server needs write access to the `data/` directory:

```bash
chmod 755 data
chmod 644 data/rsvps.json   # only if the file already exists
```

---

### Step 6 — Set environment variables (optional)

If you need to set `PORT` or any other variable:

1. In hPanel, go to **Node.js → Environment Variables**.
2. Add:

| Key | Value |
|---|---|
| `PORT` | The port number Hostinger assigned (shown in the Node.js panel) |
| `NODE_ENV` | `production` |

Hostinger typically sets `PORT` automatically — only add it manually if the app fails to bind.

---

### Step 7 — Start the application

1. In hPanel, go to **Node.js** and click **Restart** (or **Start** if not yet running).
2. Wait a few seconds, then open your domain in a browser:

```
https://yourdomain.com
```

You should see the wedding landing page.

---

### Step 8 — Enable SSL (HTTPS)

1. In hPanel, go to **SSL → Let's Encrypt**.
2. Select your domain and click **Install**.
3. Once issued (usually under 1 minute), HTTPS is active.

Hostinger's reverse proxy automatically forwards HTTPS traffic to your Node.js app — no changes to `server.js` are needed.

---

### Step 9 — Connect a custom domain (if not already)

1. In hPanel, go to **Domains → your domain → DNS / Nameservers**.
2. Point your domain's nameservers to Hostinger's (shown in hPanel), or add an `A` record pointing to your hosting IP.
3. DNS propagation can take up to 24 hours.

---

### Updating the site after changes

1. Edit files locally.
2. Upload changed files via SFTP (overwrite existing).
3. SSH in and run `npm install --omit=dev` if `package.json` changed.
4. Restart the Node.js app in hPanel → **Node.js → Restart**.

---

### Hostinger-specific notes

| Topic | Detail |
|---|---|
| Persistent storage | `data/rsvps.json` persists between restarts — Hostinger shared hosting does not wipe files on restart |
| Process management | Hostinger manages the Node.js process — you do not need PM2 on shared hosting |
| Port | Your app should listen on `process.env.PORT` — the server already does this |
| Logs | View Node.js logs in hPanel → **Node.js → Logs** |
| Inactivity | Shared hosting may suspend an idle Node.js app — the first request after inactivity may be slow |

---

## 13. General Deployment Notes

- Set the `PORT` environment variable to match your hosting provider's expected port.
- Ensure `data/` is a writable directory — the server writes `rsvps.json` there.
- Ensure `uploads/` is present and populated with your image assets before starting.
- The admin panel URL is security-sensitive — share it only privately. Do not print it in logs or public documentation.
- For production, consider running behind a reverse proxy (nginx/Caddy) with HTTPS.

---

## 14. Troubleshooting

### Server won't start

- Confirm Node.js 18+ is installed: `node -v`
- Run `npm install` to ensure `express` is installed.
- Check that port `3000` is not already in use:
  ```bash
  lsof -i :3000
  ```

### RSVP data is empty after restart

- Verify `data/rsvps.json` exists and is valid JSON.
- Confirm the process has write permission to the `data/` directory.

### Images not showing

- Ensure the image files are in the correct `uploads/` subfolder.
- Check that filenames match exactly what `index.html` references (case-sensitive on Linux).

### Admin panel redirect loop

- You are accessing a path that does not exactly match the admin URL. Use the exact URL shared privately.
