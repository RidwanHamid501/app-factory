# Consumer App Factory — Reusable Package Catalog

This document is a comprehensive reference for the reusable packages in your **consumer micro-app factory**.  
Use it as the canonical package specification while you design, build, and scale multiple £5 consumer apps.

---

## 1) `@factory/app-shell`

### What it is
The foundational runtime shell shared by every app. It owns app startup, global providers, navigation wiring, and system-level safety wrappers.

### What it will do
- Bootstraps app lifecycle (cold start, warm start, resume handling).
- Registers global providers (theme, settings, auth context, feature flags, telemetry, error handler).
- Defines route stack and deep-link entry points.
- Provides global error boundaries and fallback screens.
- Manages app-wide loading/splash orchestration.
- Hosts remote config bootstrap at startup.
- Exposes extension points for app-specific modules (adapters).

### Why it matters
Without a consistent shell, each app drifts architecturally. This package guarantees every new app starts from a stable, production-ready baseline.

---

## 2) `@factory/ui-kit`

### What it is
A shared design system implementation (components + tokens) for consistent visual quality across all apps.

### What it will do
- Provides standardized components: buttons, cards, chips, inputs, selects, toggles, modals, sheets, tabs, snackbars.
- Centralizes design tokens: spacing, typography scale, radius, elevation, icon sizing.
- Supports theme modes (light/dark) and semantic colors (success/warning/error/info).
- Enforces accessibility defaults (touch targets, contrast-safe variants, focus states).
- Supplies reusable empty/loading/error states.

### Why it matters
You can ship faster while maintaining polish. It removes repetitive UI rebuilding and preserves visual consistency across your app portfolio.

---

## 3) `@factory/screen-templates`

### What it is
Reusable page-level compositions built on top of the UI kit for common mobile product patterns.

### What it will do
- Dashboard template (KPIs + charts + quick actions).
- List/detail template with filter/search/sort patterns.
- Setup wizard template (multi-step onboarding).
- Insight-and-action template (explanation + recommended action).
- Settings template (sections, switches, permissions, legal links).
- Paywall-ready placement slots and contextual upgrade prompts.

### Why it matters
Most apps use the same 6–10 page archetypes. Templates reduce time-to-first-MVP and improve UX quality out of the box.

---

## 4) `@factory/auth-lite`

### What it is
A lightweight identity layer with support for anonymous first-use and optional account upgrade.

### What it will do
- Supports anonymous/guest mode.
- Optional sign-in methods: Apple, Google, email magic link/password.
- Handles token storage, refresh, and session lifecycle.
- Supports account linking (e.g., guest -> Apple account migration).
- Provides account management APIs (profile read/update, sign-out).
- Exposes account deletion flow hooks and legal confirmation UX.

### Why it matters
Many consumer apps need instant zero-friction start plus optional cloud sync. This package gives both without app-by-app auth rewrites.

---

## 5) `@factory/paywall`

### What it is
Monetization package for one-time unlocks (and optional future subscription support).

### What it will do
- Implements one-time £5 purchase flow.
- Handles entitlement checks (locked/unlocked features).
- Supports “restore purchases.”
- Provides paywall templates (hard gate, soft gate, contextual upgrade card).
- Supports experimentable copy/price display variants.
- Caches purchase state for reliable offline UX.
- Emits monetization analytics events (view, start, success, restore, cancel).

### Why it matters
Revenue logic must be robust and reusable. This package standardizes conversion flows and prevents monetization bugs across all apps.

---

## 6) `@factory/data-store`

### What it is
Typed local persistence and sync-ready data access layer.

### What it will do
- Abstracts storage engine (SQLite/Realm/etc.) behind repositories.
- Defines schema migration tooling and migration safety checks.
- Supports optimistic writes and offline-first read/write patterns.
- Provides conflict-resolution primitives for synced entities.
- Adds indexing helpers for fast list/filter queries.
- Exposes transaction helpers for multi-entity atomic updates.

### Why it matters
Data bugs are expensive. A stable shared persistence layer improves correctness, speed, and maintainability across every product.

---

## 7) `@factory/settings`

### What it is
Unified preferences and app configuration management.

### What it will do
- Stores user preferences: units, currency, timezone format, language, theme.
- Supports per-feature settings namespaces.
- Manages notification preferences at global + module level.
- Handles defaults, migrations, and reset-to-default behavior.
- Provides settings schema validation.

### Why it matters
Settings proliferate quickly. Centralizing them avoids inconsistent behavior and duplicated preference logic.

---

## 8) `@factory/telemetry`

### What it is
Standard analytics/event instrumentation package.

### What it will do
- Tracks screen views, key actions, funnels, conversions, and retention events.
- Standardizes event naming and payload schemas.
- Adds user/session context automatically (app version, device type, source).
- Provides buffering/retry for poor network conditions.
- Captures non-fatal diagnostics breadcrumbs.
- Offers privacy-aware event redaction hooks.

### Why it matters
You can’t improve what you can’t measure. This package creates comparable metrics across all apps and supports data-driven iteration.

---

## 9) `@factory/experiments`

### What it is
Feature flag and A/B testing infrastructure.

### What it will do
- Resolves flags at startup and refresh intervals.
- Supports percent rollouts, cohort targeting, and kill switches.
- Assigns experiment variants deterministically per user/device.
- Exposes typed flag access API to avoid runtime mistakes.
- Logs exposure events for valid experiment analysis.

### Why it matters
Allows safe incremental rollouts and rapid product learning without shipping separate app builds for every experiment.

---

## 10) `@factory/privacy-compliance`

### What it is
Shared compliance framework for privacy controls and legal obligations.

### What it will do
- Consent manager (analytics/personalization toggles, regional behavior).
- Data subject actions: export data, delete data, revoke consent.
- Retention policy hooks for data aging and cleanup.
- Permission rationale messaging and audit-trace events.
- Legal doc surfacing (privacy policy, terms, version acceptance tracking).

### Why it matters
Compliance should never be bolted on per app. This package minimizes regulatory risk and user trust erosion.

---

## 11) `@factory/capture`

### What it is
Input ingestion package for camera, file, text, and share-extension entry points.

### What it will do
- Camera capture wrapper with cropping/compression presets.
- File/document picker integration.
- Clipboard ingestion and text normalization.
- Share-extension intake from other apps.
- Input validation and type detection pipeline.

### Why it matters
Many app ideas begin with “capture something quickly.” One robust ingest package avoids repeated native integration work.

---

## 12) `@factory/ocr-parse`

### What it is
Document/image extraction and structured parsing pipeline.

### What it will do
- Runs OCR on receipts/docs/images.
- Extracts structured entities (merchant, date, amount, totals, line items).
- Assigns confidence scores and uncertainty flags.
- Supports user correction workflow and correction history.
- Exposes pluggable parsers for niche document formats.

### Why it matters
OCR + parsing is a high-value capability reused across finance/admin apps. Centralizing it improves extraction quality over time.

---

## 13) `@factory/list-normalizer`

### What it is
Normalization toolkit for messy user-entered or extracted lists.

### What it will do
- Cleans tokens (trim/case/punctuation harmonization).
- Deduplicates with exact + fuzzy matching.
- Canonicalizes aliases (e.g., merchant name variants).
- Normalizes units and quantities.
- Provides deterministic key generation for matching entities over time.

### Why it matters
Raw consumer data is noisy. Normalization is required for reliable insights, dedupe, and trend tracking.

---

## 14) `@factory/rules-engine`

### What it is
Declarative condition-action engine for alerts, nudges, and automated decisions.

### What it will do
- Evaluates rule sets (threshold, trend, anomaly, time-based logic).
- Executes actions (notify, tag, escalate, suggest task).
- Supports schedules and reevaluation windows.
- Provides explainability payload (“why this fired”).
- Enables user-customizable rules with safe guardrails.

### Why it matters
Many apps rely on “if this, then that.” A reusable rules core prevents rewriting alert logic in each app.

---

## 15) `@factory/reminders`

### What it is
Scheduling and reminder orchestration package for local and push reminder flows.

### What it will do
- Creates one-off and recurring reminders.
- Handles snooze/reschedule and escalation ladders.
- Supports quiet hours and user preference-aware timing.
- Detects overdue reminders and recovery nudges.
- Provides reminder templates for common workflows.

### Why it matters
Retention in utility apps depends on timely nudges. This package is central to recurring engagement and user outcomes.

---

## 16) `@factory/insights`

### What it is
Shared analytics computation layer for user-facing insights.

### What it will do
- Aggregates time-series metrics (daily/weekly/monthly).
- Computes trends, deltas, and rolling averages.
- Detects simple correlations and anomalies.
- Produces plain-language summaries from metric outputs.
- Exposes confidence/quality markers for low-signal data.

### Why it matters
Turning logs into understandable insights is what makes apps “worth paying for.” This module powers that transformation.

---

## 17) `@factory/charts`

### What it is
Reusable visualization package for interactive mobile data displays.

### What it will do
- Offers line, bar, area, donut, progress ring, and heatmap components.
- Provides standard chart interactions (tooltips, scrub, zoom windows).
- Handles empty/low-data chart states gracefully.
- Supports accessibility labels for chart values.
- Integrates with `@factory/insights` output schemas.

### Why it matters
Visual proof increases perceived value. Good charts make outcomes tangible and understandable within seconds.

---

## 18) `@factory/calculators`

### What it is
Formula and scenario modeling engine for “what-if” tools.

### What it will do
- Defines calculation models with validated inputs/assumptions.
- Supports scenario comparison (baseline vs option A/B).
- Provides sensitivity analysis via sliders.
- Returns explainable breakdowns of computed results.
- Supports regionalization hooks (currency/tax assumptions).

### Why it matters
Calculator-style utilities are high-converting consumer tools. This package enables rapid creation of trustworthy calculator apps.

---

## 19) `@factory/collab-lite`

### What it is
Minimal shared-data collaboration layer for households, couples, and friend groups.

### What it will do
- Supports shared entities (lists, tasks, balances, plans).
- Manages membership roles and permissions.
- Generates invite links and join flows.
- Handles edit conflict resolution for shared items.
- Tracks “last updated by” metadata for transparency.

### Why it matters
Social/household use-cases increase stickiness. Lightweight collaboration unlocks many high-retention consumer utilities.

---

## 20) `@factory/recommendation`

### What it is
Ranking and recommendation framework driven by constraints and scoring rules.

### What it will do
- Filters options by user constraints (budget/time/preferences).
- Scores candidates with weighted rule sets.
- Returns ranked options with explanation strings.
- Supports deterministic and exploratory recommendation modes.
- Tracks recommendation acceptance/rejection feedback loops.

### Why it matters
Recommendations create immediate utility (“what should I do/buy/cook now?”). This package powers actionable suggestions at scale.

---

## 21) `@factory/import-export`

### What it is
Interoperability package for data portability and reporting.

### What it will do
- Exports structured data as CSV/JSON/PDF.
- Imports standardized data files with schema validation.
- Generates human-readable reports for sharing/printing.
- Supports backup/restore bundles.
- Handles version compatibility checks for imported backups.

### Why it matters
Data portability increases trust and supports practical workflows (accountants, schools, reimbursements, household sharing).

---

## 22) `@factory/files-media`

### What it is
File and media analysis utilities for cleanup, dedupe, and organization workflows.

### What it will do
- Indexes media/files with metadata extraction.
- Detects likely duplicates and near-duplicates.
- Provides safe-delete flow with rollback window.
- Supports archive bundling by heuristic categories.
- Tracks storage reclaimed and cleanup history.

### Why it matters
“Declutter” apps need reliable file intelligence. This package provides the heavy lifting for tangible, immediate value.

---

## 23) `@factory/catalog-tracker`

### What it is
Watchlist and item-tracking engine for products, subscriptions, and repeated purchases.

### What it will do
- Stores tracked items with variants and source context.
- Tracks price history and threshold alerts.
- Supports recurrence patterns (e.g., consumables/restock cadence).
- Detects unusual jumps and deal windows.
- Powers “buy now vs wait” scoring hooks.

### Why it matters
Many consumer purchase decisions are repetitive. This package supports money-saving and planning-focused apps.

---

## 24) `@factory/notifications-intelligence`

### What it is
Intelligent notification policy engine for attention management.

### What it will do
- Applies contextual rules for notification suppression/allowing.
- Supports priority contacts and escalation exceptions.
- Generates interruption summaries and attention scores.
- Learns preferred interruption windows from user behavior.
- Integrates with reminder engine for unified timing control.

### Why it matters
Notification overload is a universal pain point. This package delivers an immediately felt quality-of-life improvement.

---

## 25) `@factory/app-generator-cli`

### What it is
Command-line scaffolding tool that assembles new apps from package selections.

### What it will do
- Generates a new app from a template with selected packages.
- Creates adapter skeletons (schema, domain rules, copy, screen config).
- Wires telemetry baseline events and paywall placements.
- Sets up CI/CD boilerplate and environment config stubs.
- Enforces package boundary conventions automatically.
- Optionally generates starter tests and smoke checks.

### Why it matters
This is the multiplier. It converts your platform into a repeatable “idea-to-app” pipeline, dramatically reducing launch time.

---

# How to use this catalog

1. Treat this file as your **single source of truth** for package scope.  
2. Prevent overlap by assigning each feature request to one owning package.  
3. Keep app-specific logic in thin adapter layers, not in shared packages.  
4. Add version notes and interface contracts as implementation evolves.  
5. Revisit package boundaries every 3–4 shipped apps and refactor deliberately.

---

# Suggested implementation phases

- **Phase 1 (Foundation):** app-shell, ui-kit, screen-templates, data-store, paywall, telemetry  
- **Phase 2 (Retention/Intelligence):** reminders, rules-engine, insights, charts, experiments  
- **Phase 3 (Growth Capabilities):** calculators, collab-lite, capture, import-export, recommendation  
- **Phase 4 (Niche Power):** ocr-parse, list-normalizer, files-media, catalog-tracker, notifications-intelligence  
- **Phase 5 (Scale):** app-generator-cli and stricter automation/testing standards

