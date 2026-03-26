# Joydip Dutta — Portfolio

> Personal portfolio website of **Joydip Dutta**, Software Development Engineer — architecting high-performance, polyglot microservices, enterprise SaaS platforms, and intelligent AI systems.

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-FF5D01?style=flat&logo=astro&logoColor=white)](https://astro.build)
[![Styled with Tailwind CSS v4](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS%20v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## ✨ Overview

A **High-Signal Technical Brutalism** design philosophy portfolio showcasing:

- 🧑‍💻 **Work Experience** — Timeline of roles at Gunpowder Innovations, The Internet Folks, and AUM Capital
- 🚀 **Featured Projects** — In-depth case studies for AI agents, fintech backends, and more
- 🛠️ **Technical Arsenal** — Languages, databases, infrastructure, and AI tooling
- 📄 **MDX Content** — Project case studies written as structured MDX documents

---

## 🏗️ Tech Stack

| Layer                   | Technology                                                         |
| ----------------------- | ------------------------------------------------------------------ |
| **Framework**           | [Astro v6](https://astro.build)                                    |
| **UI Components**       | [React v19](https://react.dev)                                     |
| **Styling**             | [Tailwind CSS v4](https://tailwindcss.com) (Vite plugin)           |
| **Content**             | MDX via `@astrojs/mdx`                                             |
| **Code Highlighting**   | Shiki (`vitesse-dark` theme)                                       |
| **Icons**               | [Lucide React](https://lucide.dev)                                 |
| **Formatting**          | Prettier + `prettier-plugin-astro` + `prettier-plugin-tailwindcss` |
| **Runtime Requirement** | Node.js ≥ 22.12.0                                                  |

---

## 📁 Project Structure

```
portfolio-joydip/
├── public/                     # Static assets (fonts, images, favicons)
├── src/
│   ├── content/
│   │   └── projects/           # MDX project case studies
│   │       ├── unified-ai-agent.mdx
│   │       ├── gunpowder-fintech-backend.mdx
│   │       ├── faas-automation.mdx
│   │       ├── agrieasy-digital-ecosystem.mdx
│   │       └── agnibina-model-school.mdx
│   ├── layouts/
│   │   └── Layout.astro        # Root page layout (head, nav, footer)
│   ├── pages/
│   │   ├── index.astro         # Homepage — hero, skills, featured projects
│   │   ├── experience.astro    # Work experience timeline
│   │   └── projects/           # Dynamic project case study pages
│   ├── styles/                 # Global CSS / design tokens
│   └── content.config.ts       # Astro content collection schema
├── astro.config.mjs            # Astro configuration (Vite, MDX, React, Shiki)
├── tailwind.config.mjs         # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 22.12.0` — [Download](https://nodejs.org)
- **npm** (bundled with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/joydipdutta9943/portfolio-joydip.git
cd portfolio-joydip

# 2. Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Opens a local dev server at **`http://localhost:4321`** with hot-module replacement.
The server also listens on all network interfaces — accessible on your local network (e.g., from a mobile device) via your machine's IP address.

### Build

```bash
npm run build
```

Builds the production site to the `./dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the `./dist/` directory locally to verify the production build before deploying.

### Format Code

```bash
npm run format
```

Runs Prettier across all `.astro`, `.ts`, `.tsx`, `.mdx`, and `.css` files.

---

## 🧞 All Commands

| Command                   | Action                                     |
| :------------------------ | :----------------------------------------- |
| `npm install`             | Install project dependencies               |
| `npm run dev`             | Start dev server at `localhost:4321`       |
| `npm run build`           | Build production site to `./dist/`         |
| `npm run preview`         | Preview production build locally           |
| `npm run format`          | Format all files with Prettier             |
| `npm run astro ...`       | Run Astro CLI commands (e.g., `astro add`) |
| `npm run astro -- --help` | Get help with the Astro CLI                |

---

## 📄 Adding a New Project Case Study

1. Create a new `.mdx` file in `src/content/projects/`:

   ```
   src/content/projects/my-new-project.mdx
   ```

2. Add the required frontmatter (see `src/content.config.ts` for the schema):

   ```mdx
   ---
   title: "My New Project"
   description: "A short description of the project."
   tags: ["TypeScript", "Node.js"]
   ---

   ## Overview

   Your project write-up here...
   ```

3. The project page will be automatically available at `/projects/my-new-project`.

---

## 🛠️ Configuration Files

| File                  | Purpose                                                                      |
| :-------------------- | :--------------------------------------------------------------------------- |
| `astro.config.mjs`    | Astro integrations (MDX, React), Vite plugins (Tailwind), Shiki syntax theme |
| `tailwind.config.mjs` | Tailwind CSS theme extensions and design tokens                              |
| `tsconfig.json`       | TypeScript compiler options and path aliases                                 |
| `.prettierrc`         | Prettier formatting rules for Astro, Tailwind, and standard files            |

---

## 📬 Contact

- **GitHub:** [@joydipdutta9943](https://github.com/joydipdutta9943)
- **Portfolio:** Built and maintained by Joydip Dutta

---

> _"Architecting high-performance, polyglot microservices, enterprise SaaS platforms, and intelligent AI systems."_
