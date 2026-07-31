# RIT Library

A comprehensive, student-led resource library for the RIT community. Built to manage, organize, and seamlessly access previous year question papers (PYQs), course notes, syllabus trackers, and campus event updates.

## 🚀 Features

- **Resource Hub**: Quickly search, filter, and access PYQs and notes by branch, semester, and specific subject/elective.
- **Client-Side Document Extraction**: Extracts and lets you copy text directly from PDFs and PowerPoint (PPTX) files in the browser without server bottlenecks.
- **Secure File Contributions**: Users can directly contribute resources to the library through an integrated direct-to-Drive upload system that handles extremely large files.
- **PostgreSQL Admin Management**: A scalable, dynamic admin dashboard to manage system access and hand down privileges to junior students seamlessly.
- **Syllabus Tracker**: Track your progress dynamically across your subjects.
- **Cloudflare Edge Performance**: Extremely fast file metadata retrieval via Cloudflare Workers and Cloudflare R2 object storage.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Framer Motion for animations, PDF.js for client-side extraction.
- **Backend**: Cloudflare Workers (Serverless).
- **Database**: Neon PostgreSQL (Admin Management).
- **Storage**: Cloudflare R2 (Metadata), Google Drive (Binary File Storage).
- **Authentication**: Firebase Authentication.

## 📦 Project Structure

This repository is organized into a monorepo structure:

- `my-project/` - The React Vite frontend application.
- `library-backend/` - The Cloudflare Worker backend and API integrations.

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Wrangler CLI (for Cloudflare Workers)

### 1. Setup Frontend
```bash
cd my-project
npm install
npm run dev
```

### 2. Setup Backend (Cloudflare Worker)
```bash
cd library-backend
npm install
npx wrangler dev
```

### Environment Variables
You will need to configure `.env` variables for Firebase Authentication, Google Drive Service Accounts, and your Neon Postgres database. Refer to the configuration files in each respective directory for the required keys.

## 🤝 Contributing
Contributions are always welcome! Feel free to open issues or submit pull requests for any bugs or feature enhancements.

## 📄 License
This project is for educational use within the RIT student community.
