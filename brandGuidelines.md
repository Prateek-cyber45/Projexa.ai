# CyberPlatform Brand Guidelines

## Brand Name
**CyberPlatform**

One word, capital C and capital P. Reflects the unified, professional nature of the product.

### Acceptable Usage
- CyberPlatform
- CYBERPLATFORM (all caps, headers only)
- cyberplatform (all lowercase, URLs and code only)

### Unacceptable Usage
- Cyber Platform (with space)
- cyber platform (all lowercase in UI)
- CYBERPlatform (mixed case)
- CP (abbreviation — do not use publicly)

---

## Brand Personality

CyberPlatform sits at the intersection of technical authority and educational accessibility. The brand should feel like a world-class cybersecurity environment — dark, focused, and precise — while remaining approachable enough for learners at all levels.

**Core traits:**
- Technical but not intimidating
- Professional but not cold
- Focused but not restrictive
- Modern but not gimmicky

---

## Color Palette

The color system is based on Apple's design language — clean whites and pure blacks for backgrounds, Apple's system blue as the primary accent, and Apple's semantic system colors for status and feature differentiation. All pages use the same unified palette.

### Backgrounds

**Page Background (Light)**
- HEX: `#FFFFFF`
- RGB: 255, 255, 255
- Use as: Primary page background across all subdomains (main, academy, labs, scores)

**Surface / Card Background**
- HEX: `#F5F5F7`
- RGB: 245, 245, 247
- Use as: Card backgrounds, panel surfaces, sidebar, modals — Apple's signature off-white

**Elevated Surface**
- HEX: `#FFFFFF`
- RGB: 255, 255, 255
- Use as: Elevated cards, dropdowns, tooltips (with shadow to distinguish from page)

**Dark Background (for hero sections / terminal areas only)**
- HEX: `#1D1D1F`
- RGB: 29, 29, 31
- Use as: Hero sections, Lab terminal panels, full-screen overlays — Apple's near-black

### Primary Accent

**Apple Blue** — Core accent (Apple system blue)
- HEX: `#0071E3`
- RGB: 0, 113, 227
- Use as: Primary buttons, active nav states, links, focus rings, key interactive highlights

**Apple Blue Hover**
- HEX: `#0077ED`
- RGB: 0, 119, 237
- Use as: Hover state on Apple Blue elements

**Apple Blue Light** — Tint for backgrounds
- HEX: `#E8F1FD`
- RGB: 232, 241, 253
- Use as: Subtle blue-tinted backgrounds on active states, selected rows, info callouts

### Semantic / Feature Colors

**Labs Orange** — Cyber Range accent (Apple Orange)
- HEX: `#FF6B00`
- RGB: 255, 107, 0
- Use as: Labs section indicators, honeypot UI, scenario difficulty badges, warning states

**Academy Green** — Learning accent (Apple Green)
- HEX: `#34C759`
- RGB: 52, 199, 89
- Use as: Academy section indicators, success states, completed badges, progress fills

**AI Purple** — Intelligence accent (Apple Purple)
- HEX: `#AF52DE`
- RGB: 175, 82, 222
- Use as: AI scoring elements, skill profile UI, behaviour score indicators, ML features

**Error / Destructive**
- HEX: `#FF3B30`
- RGB: 255, 59, 48
- Use as: Error states, failed badges, delete actions — Apple system red

**Warning**
- HEX: `#FF9F0A`
- RGB: 255, 159, 10
- Use as: Pending states, caution indicators — Apple system yellow/amber

### Text Colors

**Primary Text**
- HEX: `#1D1D1F`
- RGB: 29, 29, 31
- Use as: All headings and body text on light backgrounds — Apple's primary text color

**Secondary Text**
- HEX: `#6E6E73`
- RGB: 110, 110, 115
- Use as: Subtitles, metadata, captions, placeholder text — Apple's secondary label

**Tertiary Text**
- HEX: `#AEAEB2`
- RGB: 174, 174, 178
- Use as: Disabled text, fine-print, timestamp metadata — Apple's tertiary label

**Inverted Text (on dark surfaces)**
- HEX: `#F5F5F7`
- RGB: 245, 245, 247
- Use as: Text on `#1D1D1F` dark backgrounds (hero, terminal panels)

### Borders & Dividers

**Border Default**
- HEX: `#D2D2D7`
- RGB: 210, 210, 215
- Use as: Card borders, input borders, table dividers — Apple's separator color

**Border Subtle**
- HEX: `#E5E5EA`
- RGB: 229, 229, 234
- Use as: Light dividers, section separators inside panels

---

## Color Usage by Context

| Context | Color |
|---|---|
| Page background (all pages) | White `#FFFFFF` |
| Cards, panels, sidebar | Apple Off-White `#F5F5F7` |
| Hero / terminal sections | Apple Near-Black `#1D1D1F` |
| Primary CTA buttons | Apple Blue `#0071E3` |
| Labs / honeypot UI | Labs Orange `#FF6B00` |
| Academy / success states | Academy Green `#34C759` |
| AI scoring / skill UI | AI Purple `#AF52DE` |
| Error / destructive | Apple Red `#FF3B30` |
| Warning / pending | Apple Amber `#FF9F0A` |
| Primary body text | `#1D1D1F` |
| Secondary / meta text | `#6E6E73` |
| Borders and dividers | `#D2D2D7` |

---

## Typography

### Primary Font
**Rajdhani** — UI headings, labels, navigation, buttons

### Monospace Font
**Share Tech Mono** — Code blocks, IDs, terminal output, technical data, badges, timestamps

### Display Font
**Orbitron** — Hero titles, section headers, logo wordmark only

### Fallback Stack
```
font-family: 'Rajdhani', 'SF Pro Display', 'Segoe UI', sans-serif;
font-family: 'Share Tech Mono', 'Fira Code', 'Courier New', monospace;
```

### Font Weights
- **Bold (700)**: Page titles, card titles, button labels
- **Semi-Bold (600)**: Subheadings, navigation items, section labels
- **Regular (400)**: Body text, descriptions, table content
- **Light (300)**: Captions, metadata (use sparingly)

### Font Sizes
- Display / Hero: 36px / 2.25rem (Orbitron)
- H1: 28px / 1.75rem (Rajdhani Bold)
- H2: 22px / 1.375rem (Rajdhani SemiBold)
- H3: 18px / 1.125rem (Rajdhani SemiBold)
- Body: 14px / 0.875rem (Rajdhani Regular)
- Small / Meta: 12px / 0.75rem (Rajdhani or Share Tech Mono)
- Code / ID: 11–12px (Share Tech Mono)

### Letter Spacing
- Display headings: `letter-spacing: 2px`
- Section labels: `letter-spacing: 3–4px`
- Monospace labels/badges: `letter-spacing: 1–2px`
- Body text: `letter-spacing: 0.5px`

---

## Shadow System

CyberPlatform follows Apple's layered shadow approach — clean, directional shadows that create depth without color tinting. No colored glows.

| Level | CSS Box Shadow | Use |
|---|---|---|
| Card (default) | `0 2px 8px rgba(0,0,0,0.08)` | All cards and panels on white background |
| Card (hover / elevated) | `0 4px 16px rgba(0,0,0,0.12)` | Hovered cards, dropdowns, elevated surfaces |
| Modal / overlay | `0 8px 32px rgba(0,0,0,0.16)` | Modals, drawers, popovers |
| Focus ring | `0 0 0 4px rgba(0,113,227,0.3)` | Focused inputs and buttons (Apple-style blue focus ring) |

Apply shadows to: cards, modals, dropdowns, elevated panels.

Do not apply shadows to: table rows, background surfaces, body text, badges.

---

## UI Elements

### Buttons

**Primary Button**
- Background: Apple Blue `#0071E3`
- Text: White `#FFFFFF`
- Border Radius: 980px (fully rounded — Apple pill style)
- Font: SF Pro / Rajdhani SemiBold, 15px, normal letter-spacing
- Hover: Apple Blue Hover `#0077ED`
- Active: `#006ACC`
- Padding: 12px 24px

**Secondary / Ghost Button**
- Background: `#F5F5F7`
- Text: Apple Blue `#0071E3`
- Border: none
- Border Radius: 980px
- Hover: `#E8E8ED`

**Danger Button**
- Background: `#FFF1F0`
- Text: Apple Red `#FF3B30`
- Border: none
- Border Radius: 980px
- Hover: `#FFE0DE`

**Disabled State (all buttons)**
- Opacity: 0.4
- Cursor: not-allowed

### Cards / Panels

- Background: Apple Off-White `#F5F5F7`
- Border: 1px solid Border Default `#D2D2D7`
- Border Radius: 18px (Apple-style generous rounding)
- Padding: 24px
- Shadow: `0 2px 8px rgba(0,0,0,0.08)`

**Accent left-border variants (for feature differentiation):**
- Labs card: `border-left: 4px solid #FF6B00`
- Academy card: `border-left: 4px solid #34C759`
- AI card: `border-left: 4px solid #AF52DE`
- Info card: `border-left: 4px solid #0071E3`

### Input Fields

- Background: `#FFFFFF`
- Border: 1px solid `#D2D2D7`
- Border Radius: 10px
- Text: Primary Text `#1D1D1F`
- Placeholder: Tertiary Text `#AEAEB2`
- Focus Border: Apple Blue `#0071E3`
- Focus Ring: `0 0 0 4px rgba(0,113,227,0.3)`
- Font: Rajdhani Regular, 16px

### Badges / Tags

- Font: Rajdhani SemiBold, 12px, normal case
- Padding: 4px 10px
- Border Radius: 980px (pill shape)
- Use solid tinted background + matching darker text

**Status colors:**
- Completed / Active: background `#E9F9EE`, text `#1A7F37` (Apple green tint)
- Pending / Warning: background `#FFF4E0`, text `#B25000` (Apple amber tint)
- Failed / Error: background `#FFF0EE`, text `#C4291C` (Apple red tint)
- AI / Scoring: background `#F5EEFF`, text `#8A2BE2` (purple tint)
- Info / Default: background `#E8F1FD`, text `#0056B3` (blue tint)

### Tables

- Header background: `#F5F5F7`
- Header text: Secondary Text `#6E6E73`, Rajdhani SemiBold, 12px, uppercase, letter-spacing 0.5px
- Row background: `#FFFFFF`
- Row hover: `#F5F5F7`
- Border: 1px solid `#E5E5EA`
- Cell text: Primary Text `#1D1D1F`, Rajdhani Regular, 14px
- Divider between rows: `1px solid #E5E5EA`

### Navigation Tabs / Top Nav

- Background: `rgba(255,255,255,0.85)` with `backdrop-filter: blur(20px)` — Apple frosted glass nav
- Default link: Secondary Text `#6E6E73`
- Hover: Primary Text `#1D1D1F`
- Active: Apple Blue `#0071E3`
- Active underline: 2px solid `#0071E3`
- Font: Rajdhani SemiBold, 14px, normal case

---

## Zone / Section Containers

Zones group related UI sections. On the Apple-themed design, zones use light tinted backgrounds with subtle colored left borders instead of dashed outlines.

| Zone Type | Background | Left Border |
|---|---|---|
| Blue zone (main.com) | `#E8F1FD` | `4px solid #0071E3` |
| Orange zone (Labs) | `#FFF3E8` | `4px solid #FF6B00` |
| Green zone (Academy) | `#E9F9EE` | `4px solid #34C759` |
| Purple zone (AI/ML) | `#F5EEFF` | `4px solid #AF52DE` |
| Gray zone (infra/shared) | `#F5F5F7` | `4px solid #D2D2D7` |

Zone label tags: Rajdhani SemiBold, 11px, uppercase, letter-spacing 1px, using the zone's accent color.

---

## Background Treatment

CyberPlatform follows Apple's clean background approach — no decorative patterns or grid overlays on standard pages.

**Standard pages** (Dashboard, Academy, Labs, Scores, Profile): pure white `#FFFFFF` with `#F5F5F7` for card/panel surfaces.

**Hero sections** (landing page header, full-screen modals, Lab terminal panels): Apple near-black `#1D1D1F` with `#F5F5F7` inverted text.

**Section alternation**: alternate between `#FFFFFF` and `#F5F5F7` for visual rhythm on long pages — same technique Apple uses on product pages.

```css
/* Standard page */
background-color: #FFFFFF;

/* Alternating section */
background-color: #F5F5F7;

/* Dark hero / terminal panel */
background-color: #1D1D1F;
```

No grid overlays, no noise textures, no gradient backgrounds outside of hero sections.

---

## Iconography

- Style: Outlined, consistent 1.5px stroke width
- Preferred library: Lucide Icons or Heroicons (outline variant) — or SF Symbols if building native
- Size: 20px standard, 16px small, 24px large, 32px feature icon
- Color: Match surrounding text color (`#1D1D1F` default, `#6E6E73` for secondary)
- Do not use filled icons alongside outlined icons in the same view
- Interactive / primary icons: Apple Blue `#0071E3`
- Warning / destructive icons: Apple Red `#FF3B30`
- Success / live status icons: Academy Green `#34C759`
- AI / scoring icons: AI Purple `#AF52DE`
- Labs / honeypot icons: Labs Orange `#FF6B00`

---

## Live Status Indicators (Ping Dots)

Used to show real-time active status (e.g. live lab session, active scoring, connected service).

- Size: 8x8px, border-radius 50%
- Animation: pulse opacity between 1.0 and 0.3 over 2s infinite

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

| Context | Color |
|---|---|
| Main / infra services | Apple Blue `#0071E3` |
| Labs / honeypot active | Labs Orange `#FF6B00` |
| Academy / completed | Academy Green `#34C759` |
| AI engine active | AI Purple `#AF52DE` |

---

## Tone of Voice

### Core Principles
- **Technical authority**: Write like someone who deeply understands cybersecurity. Use correct terminology — do not dumb it down unnecessarily.
- **Clear and direct**: No filler. Labels, headings, and messages should be precise and scannable.
- **Instructive, not alarming**: Warnings and errors guide the user toward resolution, not panic.
- **Never condescending**: Treat users as capable practitioners who are still learning.

### UI Copy Rules

**Labels and headings:**
- Uppercase for section labels, tabs, and badges
- Title case for card titles and page headings
- Sentence case for body text and descriptions

**Buttons:**
- Action-first: "Start Lab", "Submit Report", "Add Transaction", "View Score"
- Not: "Click here to start", "Submit your report"

**Status messages:**
- Success: "Session scored. Final: 84 / 100"
- Error: "Scoring failed — retry or contact support"
- Pending: "Analysing behaviour data..."
- Empty state: "No sessions yet. Start your first Lab to see your score."

**Avoid:**
- Exclamation marks in product UI (not "Great job!")
- Vague labels ("Click here", "Submit", "Go")
- Marketing language inside the app ("Revolutionary AI-powered...")

---

## Responsive Breakpoints

| Breakpoint | Width | Behaviour |
|---|---|---|
| Mobile | < 640px | Single column, stacked navigation, hidden sidebars |
| Tablet | 641px – 1024px | Two-column layout, collapsible nav |
| Desktop | 1025px – 1400px | Full layout, three-column where applicable |
| Wide | > 1400px | Max content width 1400px, centered with side padding |

Grid system collapses at mobile:
- `grid-3` → single column
- `grid-4` → single column
- `flow-row` → vertical stack with rotated arrows (90°)

---

## Animation & Transitions

- Default transition: `all 0.2s ease`
- Page/tab entrance: `fadeUp 0.4s ease` (opacity 0 + translateY 16px → normal)
- Header entrance: `fadeDown 0.8s ease`
- Hover states: transition on color, border-color, box-shadow only — never on layout properties
- Do not use bounce, elastic, or decorative easing in production UI
- Reduce motion: respect `prefers-reduced-motion` — disable all animations and transitions

---

## Do's and Don'ts

### Do
- Use white `#FFFFFF` and off-white `#F5F5F7` as the consistent background across all pages
- Apply the correct accent color per subdomain (blue = main, orange = labs, green = academy, purple = AI)
- Use Share Tech Mono for all IDs, ports, timestamps, code, and terminal output values
- Use pill-shaped buttons (border-radius: 980px) and generously rounded cards (border-radius: 18px) — Apple standard
- Apply frosted glass nav bar (`backdrop-filter: blur(20px)`) on the top navigation
- Use clean shadows (not colored glows) to create depth

### Don't
- Do not use dark backgrounds on standard app pages — Apple light theme is non-negotiable across all pages (exception: Lab terminal panels and hero sections only)
- Do not mix accent colors arbitrarily — each color has a designated semantic role
- Do not use Orbitron for body text or small labels — display/hero use only
- Do not use colored glow effects — use Apple-style directional shadows instead
- Do not use decorative grid overlays or background textures on standard pages
- Do not use hard square corners — minimum border-radius is 8px; prefer 10–18px on cards

---

## Contact

For design, brand, or asset questions related to CyberPlatform, contact the platform design team.
