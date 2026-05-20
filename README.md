# 🧠 Sentiment Analysis System

> An AI-powered sentiment analysis platform that classifies text as **Positive**, **Negative**, or **Neutral** in real time — built with React, TypeScript, and a modern component-driven UI.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

---

## ✨ Features

- **Real-time sentiment classification** — Classifies any text input as Positive, Negative, or Neutral instantly
- **NLP-based text processing** — Natural Language Processing pipeline for accurate sentiment detection
- **Interactive analysis page** — Dedicated results view with detailed sentiment breakdown
- **Data visualization** — Sentiment scores and trends rendered with Recharts
- **Dark mode support** — Full light/dark theme toggle via `next-themes`
- **Form validation** — Input handling with React Hook Form and Zod schema validation
- **Toast notifications** — Real-time feedback using Sonner
- **Test coverage** — Unit and integration tests with Vitest and React Testing Library
- **Responsive design** — Fully optimised for desktop, tablet, and mobile

---

## 🖥️ Screenshots

| Snapshots |
|------|
| <img width="1919" height="984" alt="Screenshot 2026-05-20 160833" src="https://github.com/user-attachments/assets/ee99bed6-e4f2-40b9-8342-69c3ffa4d566" />|
| <img width="1919" height="991" alt="Screenshot 2026-05-20 160908" src="https://github.com/user-attachments/assets/820d7d69-943f-4cd1-892c-dcb7b1611ab6" />|
| <img width="1919" height="809" alt="Screenshot 2026-05-20 162728" src="https://github.com/user-attachments/assets/0c797c71-9b71-4703-9076-7e13349261e9" />|


---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| UI Framework | [React 18](https://react.dev/) |
| Language | [TypeScript 5.8](https://www.typescriptlang.org/) |
| Build Tool | [Vite 5](https://vitejs.dev/) with SWC |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Component Library | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| Routing | [React Router DOM v6](https://reactrouter.com/) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| Charts | [Recharts](https://recharts.org/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| Package Manager | [Bun](https://bun.sh/) |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.0 **or** Node.js ≥ 18 with npm
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/LithkeshBalajiB/Sentiment-Analysis-System.git
cd Sentiment-Analysis-System

# 2. Install dependencies
bun install
# or: npm install

# 3. Start the development server
bun run dev
# or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
bun run build
bun run preview     # preview the production build locally
```

---

## 🧪 Running Tests

```bash
# Run all tests once
bun run test

# Run tests in watch mode
bun run test:watch
```

Tests are written with **Vitest** and **React Testing Library** and cover core sentiment logic and UI components.

---

## 📂 Project Structure

```
Sentiment-Analysis-System/
├── public/                  # Static assets and screenshots
├── src/
│   ├── components/          # Reusable UI components (shadcn/ui + custom)
│   ├── pages/               # Application pages (Home, Analysis)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Sentiment analysis logic and utilities
│   └── styles/              # Global CSS and Tailwind configuration
├── vitest.config.ts         # Vitest test configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

---

## 💡 Use Cases

- **Social media monitoring** — Analyse tweets, comments, and posts for public sentiment
- **Customer feedback** — Classify product reviews and support tickets automatically
- **Brand monitoring** — Track how users feel about a brand over time
- **Opinion mining** — Extract sentiment signals from large volumes of free text
- **Research & education** — Explore NLP concepts with an interactive interface

---

## 🔮 Future Enhancements

- [ ] Advanced deep learning model integration (BERT / transformer-based)
- [ ] Multi-language sentiment support
- [ ] Batch text processing via CSV upload
- [ ] Sentiment trend dashboard with historical analytics
- [ ] REST API backend for external integrations
- [ ] Cloud deployment (Vercel / Cloudflare Pages)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature-name`
5. Open a Pull Request

### Code Style

```bash
bun run lint       # ESLint check
```
