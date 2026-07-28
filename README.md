# 🎵 DownloadMP3

### Local media downloader with a modern web interface, real-time progress, download queue and persistent history.

**DownloadMP3** is a local web application designed to provide a modern and controlled interface for downloading and processing audio and video using **yt-dlp** and **FFmpeg**.

Instead of relying on third-party download websites, the application runs locally on the user's machine, providing greater control over the download process and reducing exposure to potentially unsafe websites, intrusive advertisements and malicious redirects.

> ⚠️ **Use responsibly:** download only content that you are legally authorized to download. This project does not bypass DRM or access restrictions.

---

## ✨ Highlights

* 🎵 Download audio as **MP3 or M4A**
* 🎬 Download video as **MP4, MKV or WEBM**
* 🎚️ Select audio quality and MP3 bitrate
* 📋 Download queue with configurable concurrency
* 📊 Real-time download progress
* ⚡ Real-time communication with **Socket.IO**
* ⏸️ Pause and resume downloads on POSIX systems
* ❌ Cancel downloads
* 📚 Playlist support
* 📝 Subtitle download
* 🖼️ Thumbnail download
* 🏷️ Metadata preservation
* 🗂️ Configurable download directory
* 🕘 Persistent download history
* 🔎 Search and filter history
* 🗑️ Delete history entries
* 🌙 Light/dark theme
* ⚙️ Application settings
* 🧪 Unit tests with Vitest
* 🐳 Docker Compose support

---

## 🖥️ Architecture

The project follows a clear separation between frontend and backend responsibilities.

```text
┌─────────────────────────────┐
│          React UI           │
│ React 19 + TypeScript       │
│ Vite + TailwindCSS          │
└──────────────┬──────────────┘
               │
               │ HTTP / WebSocket
               ▼
┌─────────────────────────────┐
│        Node.js API          │
│ Express + TypeScript        │
│ Socket.IO                   │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│   yt-dlp    │  │   SQLite    │
│ Downloader  │  │   History   │
└──────┬──────┘  └─────────────┘
       │
       ▼
┌─────────────┐
│   FFmpeg    │
│ Media Tools │
└─────────────┘
```

### Project structure

```text
DownloadMP3/
│
├── frontend/
│   ├── src/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── .env.example
│   └── ...
│
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

---

# 🧰 Tech Stack

## Frontend

| Technology                 | Purpose                   |
| -------------------------- | ------------------------- |
| React 19                   | User interface            |
| TypeScript                 | Static typing             |
| Vite                       | Development/build tooling |
| TailwindCSS                | Styling                   |
| shadcn/ui-style components | UI components             |
| React Query                | Server state management   |
| Axios                      | HTTP communication        |

## Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Node.js    | Runtime                   |
| Express    | REST API                  |
| TypeScript | Static typing             |
| Socket.IO  | Real-time communication   |
| yt-dlp     | Media extraction/download |
| FFmpeg     | Audio/video processing    |

## Database

**SQLite**

Used for persistent download history and application data without requiring an external database server.

## Testing

**Vitest**

Used for unit testing backend and frontend logic.

## DevOps

**Docker + Docker Compose**

The project includes a `docker-compose.yml` for running the application using local container images.

---

# 🚀 Features

## 🎵 Audio & Video

The application supports multiple output formats:

```text
Audio
├── MP3
└── M4A

Video
├── MP4
├── MKV
└── WEBM
```

For MP3 downloads, the user can select the desired bitrate according to their needs.

---

## 📋 Download Queue

Downloads are handled through a queue system with configurable concurrency.

This makes it possible to control how many downloads can execute simultaneously instead of launching unlimited processes.

```text
Download Queue

[01] ▶ Processing
[02] ⏳ Waiting
[03] ⏳ Waiting
[04] ⏳ Waiting
```

---

## 📊 Real-Time Progress

Download progress is delivered to the frontend in real time using **Socket.IO**.

The interface can display:

* Download percentage
* Current status
* Progress
* Processing state
* Completion
* Errors
* Cancellation

No manual page refresh is required.

---

## 🕘 Persistent History

Completed downloads are stored in SQLite.

The history interface provides:

* Search
* Filtering
* Download information
* File details
* Deletion of records

This allows the application to maintain a local record of previous operations.

---

# 🔐 Local-first approach

One of the main ideas behind DownloadMP3 is **local execution**.

Instead of:

```text
Browser
   ↓
Third-party download website
   ↓
External server
   ↓
Downloaded file
```

the application uses:

```text
Browser
   ↓
Local application
   ↓
yt-dlp
   ↓
FFmpeg
   ↓
Local file
```

This approach gives the user greater control over the process and avoids depending on random third-party downloader websites.

It also reduces exposure to common problems associated with these websites, such as:

* Intrusive advertising
* Malicious redirects
* Fake download buttons
* Suspicious browser notifications
* Unwanted scripts

> **Important:** local execution improves control and reduces exposure to third-party websites, but no software should be considered completely risk-free.

---

# 🤖 AI-Assisted Development

This project was developed using **AI-assisted software engineering** as part of the development workflow.

AI was used as a development accelerator for activities such as:

* Architecture exploration
* Code generation
* Refactoring
* Debugging
* Test creation
* Documentation
* Code review
* Problem solving
* Development iteration

However, the generated code was **reviewed, tested and validated during development**.

The goal was not to replace engineering decisions with AI, but to use AI to significantly accelerate the implementation cycle.

> **AI is the accelerator. Engineering judgment is still the driver.**

---

# ⚙️ Requirements

Before running the project locally, make sure you have:

* **Node.js 20+**
* **yt-dlp**
* **FFmpeg**
* npm

Verify the installations:

```bash
node --version
npm --version
yt-dlp --version
ffmpeg -version
```

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/eduardotecnologo/DuduDownload.git
```

Enter the project directory:

```bash
cd DuduDownload
```

Install dependencies:

```bash
npm install
```

If required, configure the backend environment:

```bash
cp backend/.env.example backend/.env
```

Adjust the configuration according to your environment.

---

# ▶️ Development

Start frontend and backend simultaneously:

```bash
npm run dev
```

The application will be available at:

```text
Frontend
http://localhost:5173

Backend
http://localhost:4000
```

---

# 🧪 Scripts

Available scripts from the project root:

```bash
npm run dev
```

Starts frontend and backend in development mode.

```bash
npm run build
```

Builds frontend and backend.

```bash
npm run lint
```

Runs ESLint across the project.

```bash
npm run test
```

Runs unit tests.

---

# 🐳 Docker

The project includes Docker Compose support.

Build and start the application:

```bash
docker compose up --build
```

Stop the containers:

```bash
docker compose down
```

---

# 🔄 Download Flow

A typical download follows this flow:

```text
User enters URL
       │
       ▼
Frontend validates request
       │
       ▼
Backend receives request
       │
       ▼
yt-dlp retrieves metadata
       │
       ▼
Download added to queue
       │
       ▼
yt-dlp downloads media
       │
       ▼
FFmpeg processes/converts media
       │
       ▼
Socket.IO sends progress
       │
       ▼
Frontend updates UI
       │
       ▼
Result saved locally
       │
       ▼
SQLite stores history
```

---

# 🛡️ Security & Responsible Use

DownloadMP3 is designed as a **local application**.

The project does not intend to:

* Bypass DRM
* Circumvent access restrictions
* Access private content
* Facilitate unauthorized distribution

Users are responsible for ensuring that downloaded content can legally be downloaded and used.

The application should also be kept updated, particularly:

* `yt-dlp`
* `FFmpeg`
* Node.js dependencies

---

# 📸 Screenshots

Add screenshots of the application here:

```text
docs/
├── dashboard.png
├── download-progress.png
├── history.png
└── settings.png
```

Example:

![Dashboard](docs/dashboard.png)

---

# 🗺️ Roadmap

Possible future improvements:

* [ ] Drag & drop URLs
* [ ] Download speed display
* [ ] Estimated remaining time
* [ ] More advanced queue management
* [ ] Automatic dependency update assistant
* [ ] Improved playlist management
* [ ] Download presets
* [ ] More granular download controls
* [ ] Improved error reporting
* [ ] Expanded automated test coverage

---

# 📄 License

Add your preferred license here.

For example:

```text
MIT License
```

---

# 👨‍💻 Author

**Eduardo Developer**

Software Engineer | Full Stack Developer | AI-Assisted Development

---

## ⭐ Why this project?

DownloadMP3 started from a simple idea:

> **What if downloading media could be controlled locally through a clean, modern interface instead of relying on random third-party websites?**

The result became a full-stack application combining:

**React + TypeScript + Node.js + Express + Socket.IO + SQLite + yt-dlp + FFmpeg**

all brought together with an **AI-assisted development workflow** and a focus on clean architecture, maintainability, testing and user experience.

---

<p align="center">
  Built with ❤️, TypeScript and AI-assisted engineering.
</p>
