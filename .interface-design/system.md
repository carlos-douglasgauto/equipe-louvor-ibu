# LouvorSync — Design System (`.interface-design/system.md`)

## Direction

**Personality:** Precision & Studio Calm (inspired by Planning Center Services, Linear, and LouveApp workflow)
**Foundation:** Neutral Studio Slate/Zinc (High-legibility Dark Mode for stage/rehearsal + Crisp Paper Light Mode for planning)
**Depth:** Subtle surface-elevation shifts + whisper-quiet `1px` borders (`rgba(255,255,255,0.07)` dark / `rgba(15,23,42,0.08)` light). No decorative multi-stop rainbow gradients.

### Domain Exploration
- **Domain:** Estante de Partitura (Music Stand), Passagem de Som (Soundcheck), Escala Dominical (Sunday Roster), Tom & Cifra (Key & Chord), Mapa de Palco (Stage Plot).
- **Color World:** Matte stage black (`#09090b`), studio rack slate (`#0f172a` / `#1e293b`), sheet-music paper (`#f8fafc` / `#ffffff`), stage cue sky-blue (`#0284c7` / `#38bdf8`), soundboard LED indicators (emerald `#10b981` for confirmed/synced, amber `#f59e0b` for consecutive-Sunday warning, rose `#f43f5e` for vocal/minister cue).
- **Signature:** Concentric segmented role/view switchers with 6px semantic LED indicator dots instead of full-bleed colored backgrounds, paired with `tabular-nums` for all dates, keys, BPMs, and counters.

---

## Tokens

### Spacing & Grid
- **Base Unit:** `4px`
- **Scale:** `4px` (micro gap), `8px` (compact control gap), `12px` (control padding), `16px` (card padding mobile), `20px–24px` (card/section padding desktop), `32px` (major layout rhythm).

### Surface Elevation & Colors

#### Dark Mode (Stage / Rehearsal Default)
```css
--bg-canvas: #090d16;          /* Deep stage background */
--bg-surface: #0f172a;         /* Primary card / navbar surface */
--bg-elevated: #1e293b;        /* Active pill / dropdown / hover surface */
--bg-inset: #060911;           /* Inputs & recessed segmented track */
--border-subtle: rgba(255, 255, 255, 0.07);
--border-emphasis: rgba(255, 255, 255, 0.14);
--text-primary: #f8fafc;
--text-secondary: #cbd5e1;
--text-tertiary: #94a3b8;
--text-muted: #64748b;
--accent-primary: #0284c7;     /* Sky 600 */
--accent-subtle: rgba(56, 189, 248, 0.12);
```

#### Light Mode (Daylight Planning)
```css
--bg-canvas: #f8fafc;          /* Crisp paper canvas */
--bg-surface: #ffffff;         /* Pure white card surface */
--bg-elevated: #f1f5f9;        /* Secondary surface */
--bg-inset: #f1f5f9;           /* Recessed track / input fill */
--border-subtle: rgba(15, 23, 42, 0.08);
--border-emphasis: rgba(15, 23, 42, 0.15);
--text-primary: #0f172a;
--text-secondary: #334155;
--text-tertiary: #64748b;
--text-muted: #94a3b8;
--accent-primary: #0284c7;
--accent-subtle: rgba(2, 132, 199, 0.08);
```

### Radius Scale (Concentric)
- **Control / Inner Pill:** `6px` (`rounded-md`)
- **Button / Segmented Track / Input:** `8px` (`rounded-lg`)
- **Card / Panel:** `12px` (`rounded-xl`)
- **Modal:** `16px` (`rounded-2xl`)
- *Rule:* `outerRadius = innerRadius + padding` (e.g., segmented track `rounded-lg` [8px] with `p-1` [4px] holds `rounded-md` [6px] buttons).

### Typography
- **Sans:** `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif`
- **Mono (Chords, Keys, Musical Figures):** `'Fira Code', monospace`
- **Numeric Discipline:** `font-variant-numeric: tabular-nums` on all dates, counts, keys, and song numbers.
- **Hierarchy Levers:** Combine size + weight + color tier (`primary 600`, `secondary 500`, `muted 400`) rather than size jumps alone.

---

## Component Patterns

### 1. Top Studio Navbar (`Navbar.jsx`)
- **Height:** `60px` (`h-15`) desktop, compact two-tier on mobile.
- **Surface:** `glass-panel` using subtle border-bottom (`var(--border-subtle)`) and high-opacity surface (`92%`) without rainbow gradients.
- **Role Switcher:** Recessed track (`bg-slate-200/70 dark:bg-slate-900 p-1 rounded-lg border border-slate-300/60 dark:border-slate-800`). Active role uses elevated neutral surface (`bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs`) with a `6px` semantic dot (`bg-sky-500` Leader, `bg-rose-500` Minister, `bg-emerald-500` Musician).

### 2. Interactive Controls (Buttons & Split Controls)
- **Standard Control Height:** `36px` (`h-9`) for header/toolbar actions; `32px` (`h-8`) for dense inline actions.
- **Press Feedback:** `active:scale-[0.98] transition-all duration-150`.
- **Primary Action:** Solid single-hue (`bg-sky-600 hover:bg-sky-500 text-white shadow-xs`).
- **Secondary Action:** Neutral surface (`bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800`).

### 3. Cards (`.glass-card` / `.surface-card`)
- **Elevation:** 1px subtle border + whisper-quiet shadow in light mode; 1px subtle border (`rgba(255,255,255,0.07)`) on `#0f172a` in dark mode.
- **Padding:** `16px` (`p-4`) on mobile, `20px` (`p-5`) on desktop.

### 4. Sunday Selector Cards (`MusicianDashboard.jsx` & `MinisterSetlistEditor.jsx`)
- **Direct Entry:** Top explanatory banner removed; the 5 Sunday selector cards sit directly below the navbar for immediate navigation.
- **Active State:** Elevated neutral surface (`bg-white dark:bg-slate-900`) with a `1px` border (`border-emerald-500/80` or `border-rose-500/80`) and a `44x44px` (`w-11 h-11`) calendar badge using `tabular-nums`.
- **Member Status Indicator:** 6px semantic dot (`bg-emerald-500` when confirmed, `bg-amber-400` when pending confirmation) next to the assigned instrument role, or `Folga` when off-duty.

### 5. Streamlined Musician View (`MusicianDashboard.jsx`)
- **Single Horizontal Overview Card:** Replaced bulky 7-column lineup grid with a clean horizontal studio card:
  - Header line: `DOMINGO • DD/MM/YYYY • [Título do Culto]` + personal status pill (`Você: [Instrumento] (Confirmado/Pendente)` or `Você está de folga`).
  - Ministração: Minister name.
  - Inline Lineup: `Vocal: ... • Violão: ... • Guitarra: ... • Teclado: ... • Baixo: ... • Bateria: ...` with confirmation LED dots and current member underline.
  - Rehearsal row: Clean single-line info strip (`Ensaio: DD/MM/YYYY às HH:MM • Local • "Observações"`).
  - Consolidated Action Cluster: Member select dropdown (`Integrante: [Nome]`), 1-click Presence Confirmation toggle (`Confirmar Presença` / `Presença Confirmada`), and WhatsApp scale share button.
- **Full-Width Setlist:** Repertoire rendered full width below the Sunday overview, offering maximum clarity for song titles, key badges (`Tom: X`, `Orig: Y → X`, `BPM`), arrangement notes, `Ouvir Tudo`, and direct `Abrir Cifra` + `Vídeo` buttons.

### 6. Song Editor Form & Streamlined Minister View (`MinisterSetlistEditor.jsx`)
- **Direct Entry:** Top explanatory banner removed; the 5 Sunday selector cards sit directly below the navbar for immediate navigation.
- **Consolidated Action Cluster:** All Sunday-level operations (`Importar do Google Docs`, `Enviar WhatsApp`, `+ Adicionar Música`) are centralized in the active Sunday lineup header card.
- **Fast-Fill Split Area:** Two balanced columns (YouTube auto-extract on left with 36px inputs, Church Catalog dropdown on right with 1-click apply).
- **Tone & Key Matrix:** Clear distinction between Original Key (`Tom Original (Gravação)`) and Ministry Key (`Tom Cantado no Culto`) with dynamic transposition alert.
- **Micro-Actions:** 32px utility buttons (`Banana Cifras`, `Cifra Club`, `Colar da Área de Transferência`).

### 7. Leader Macro Board & Member Manager (`MacroMonthView.jsx` & `MembersManager.jsx`)
- **Macro Matrix:** 5 compact Sunday columns with direct slot tap-to-assign, vocal slot additions, and unassigned member alert dot (`bg-amber-500`).
- **Musician Pool:** Filter chips with 1-tap allocation into active slot, showing member load indicator badge (`tabular-nums`).
- **Member Cards:** Concentric border radius, status pill with semantic LED indicator (`● Ativo` emerald / `○ Em recesso` slate).

---

## Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Replace rainbow gradients with 6px LED role dots | Multi-color gradient buttons in the header competed with schedule alerts and song keys. Neutral active tabs with a single semantic dot preserve instant role awareness with 10x cleaner visual hierarchy. | 2026-10-30 |
| Upgrade `.glass-panel` and `.glass-card` to studio tokens | Existing views rely on `.glass-panel` and `.glass-card`. Updating these classes in `index.css` immediately removes excessive blur/glow across the entire app while keeping full compatibility. | 2026-10-30 |
| Integrate Cloud Sync indicator into Navbar | Having sync status visible in the main header reassures leaders and musicians on mobile without hunting for the footer or Leader-only sub-bar. | 2026-10-30 |

