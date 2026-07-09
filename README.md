# ISO 8583 Analyzer

A professional web application for parsing, visualizing, and comparing ISO 8583 financial transaction messages. Built with React, TypeScript, and Vite.

## Features

- **Parse ISO 8583 messages** — Decode ASCII or hex-encoded messages into structured JSON
- **Bitmap visualizer** — Interactive grid showing active/inactive fields (1–128)
- **Field inspector** — View parsed field details with type, length, format, and raw value
- **Message comparison** — Side-by-side diff of two ISO 8583 messages with bitmap and field-level comparison
- **Sample templates** — Pre-loaded purchase, echo, and reversal messages for quick testing
- **JSON export** — Copy parsed output to clipboard

## Architecture

```
src/
  core/           — Domain logic (parser, bitmap, fields, comparator) with SOLID design
  components/     — Reusable UI components
  hooks/          — Custom React hooks for state management
  constants/      — ISO 8583 field specs, MTI lookups, descriptions, samples
  types/          — TypeScript interfaces and type definitions
  styles/         — Modular CSS with glassmorphism dark theme
```

Built with dependency injection: the parser service receives its dependencies (`MtiLookupProvider`, `InputNormalizer`, `BitmapParser`, `FieldsParser`) through the constructor, making it testable and extensible.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | Run ESLint across source files |
| `npm test` | Run Vitest unit tests |
| `npm run preview` | Preview production build |

## Tech Stack

- **React 18** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Vitest** — Unit testing
- **ESLint** — Code quality

## License

MIT
