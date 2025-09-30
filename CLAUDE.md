# CLAUDE.md — Resort Website Project

## TL;DR
- **Default orchestrator:** Use sub-agent `project-manager` to plan and delegate; switch specialists as needed.
- **Model:** Prefer **GLM-4.5** (low temp, short outputs).
- **Style:** Smallest viable diff + exact run commands + brief notes.
- **Plan:** ≤3 bullets → Implement → Verify → Ship (or switch agent).

---

## Project Overview
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Testing:** Jest (unit) + Cypress (e2e)
- **Key Features:** Admin dashboard, media management, authentication

---

## Models & Runtime (Claude Code on Windows)
**Use GLM-4.5 for code/analysis; GLM-4.5-Air for quick utility.**

```powershell
# Set once per shell (PowerShell)
$env:ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="01ff9d3432274b2b90268e4902e30cec.0ctk561FeQJumSyy"
$env:ANTHROPIC_MODEL="glm-4.5"
$env:ANTHROPIC_SMALL_FAST_MODEL="glm-4.5-air"
# Sane defaults for coding sessions
$env:MAX_THINKING_TOKENS="0"            # disable chain-of-thought
$env:CLAUDE_CODE_MAX_OUTPUT_TOKENS="1200"
$env:CLAUDE_TEMPERATURE="0.2"
```

---

## Commands
**Project root:** `resort-website/`

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run build:tsc        # Build with type check
npm run preview          # Preview production build

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:ci          # CI test mode
npm run test:debug       # Debug tests
npm run e2e              # Run E2E tests
npm run e2e:open         # Open Cypress GUI

# Quality
npm run lint             # ESLint
npm run verify           # Run lint + test + build

# Type check
tsc -b                  # Build check without output
```

> **Acceptance must include** the commands executed and their exit codes.

---

## Project Structure
```
resort-website/
├── src/
│   ├── admin/           # Admin dashboard
│   ├── components/      # Shared components
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   └── utils/           # Utility functions
├── tests/               # Test files
└── public/              # Static assets
```

## Key Libraries
- **UI:** Radix UI + Lucide React
- **Forms:** React Hook Form + Zod
- **State:** React hooks (context-based)
- **Routing:** React Router v7
- **Auth:** bcryptjs + JWT
- **Media:** jszip for file handling

## Admin Panel
- Authentication system with JWT
- First-run setup wizard
- Media management system
- Dashboard analytics
- Admin UI with React components

---

## Orchestration & sub-agents
Start sessions with: `project-manager`