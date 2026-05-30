# Design System Specification: The Academic Atelier

## 1. Overview & Creative North Star
**Creative North Star: "The Intellectual Sanctuary"**

University management systems are traditionally cluttered, rigid, and exhausting. This design system rejects the "spreadsheet-as-an-interface" status quo. Instead, we adopt a **High-End Editorial** approach that treats academic data with the same reverence as a prestigious journal. 

We break the "template" look by utilizing **intentional white space, tonal layering over lines, and a dual-typeface system** that balances the authority of a classic institution with the efficiency of modern technology. The goal is to create a digital environment that feels quiet, focused, and profoundly structured—a sanctuary for administrative and academic excellence.

---

## 2. Colors: Tonal Architecture
We move away from the "bordered box" mentality. Instead, we use color as a structural tool to define space.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. 
Boundaries are defined solely through background shifts. A `surface-container-low` section sitting on a `background` provides all the separation the eye needs. This creates a seamless, fluid transition across the dashboard.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface tiers to create "nested" depth:
*   **Base:** `background` (#f8f9fa) for the main canvas.
*   **Secondary Content:** `surface-container-low` (#f1f4f6) for sidebar backgrounds or secondary groupings.
*   **Primary Cards:** `surface-container-lowest` (#ffffff) to make critical information "pop" forward naturally.
*   **Active Overlays:** `surface-container-highest` (#dbe4e7) for transient elements like hover states or inactive tabs.

### The "Glass & Gradient" Rule
To add soul to the "Professional Blue," avoid flat fills for large CTAs. Use a subtle linear gradient (45deg) from `primary` (#255dad) to `primary_dim` (#1151a0). For floating navigation or headers, apply a backdrop-blur (12px) to a semi-transparent `surface` color to achieve a "frosted glass" effect, integrating the UI into the background.

---

## 3. Typography: The Editorial Scale
We use a high-contrast typographic pairing to signal both modern tech and academic tradition.

*   **The Display & Headline (Manrope):** Use Manrope for all headers. It is a geometric sans-serif that feels contemporary yet authoritative. 
    *   *Usage:* Use `display-lg` (3.5rem) for dashboard greetings or high-level analytics. Use `headline-sm` (1.5rem) for card titles to maintain a "journal" feel.
*   **The Body & Label (Public Sans):** Public Sans is optimized for legibility in dense academic data.
    *   *Usage:* Use `body-md` (0.875rem) for all standard data entries and prose. 
*   **Intentional Asymmetry:** Don't center everything. Align large `display-md` headers to the far left, balanced by generous white space on the right to create a sophisticated, asymmetrical rhythm.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a clean academic environment. We prioritize **Tonal Lift**.

*   **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container` (#eaeff1) background. This creates a soft, natural lift without the "dirtiness" of a gray shadow.
*   **Ambient Shadows:** If a shadow is required for a floating Modal or Popover, use: `box-shadow: 0 20px 40px rgba(43, 52, 55, 0.06);`. The shadow color is derived from `on_surface` (#2b3437) at a very low opacity to mimic natural light.
*   **The "Ghost Border":** For input fields or high-density tables where separation is critical, use the `outline_variant` (#abb3b7) at **15% opacity**. Never use 100% opacity borders.

---

## 5. Components

### Buttons
*   **Primary:** A gradient fill of `primary` to `primary_dim`. `borderRadius: 0.5rem (lg)`. No border. Text is `on_primary`.
*   **Secondary:** `surface-container-high` background with `on_surface` text. This feels like part of the UI, not an interruption.
*   **Tertiary:** No background. `primary` text. Use for low-emphasis actions like "Cancel" or "View Details."

### Input Fields
*   **Style:** `surface-container-lowest` background with a 1px "Ghost Border" (15% `outline_variant`). 
*   **Focus State:** Shift the border to 100% `primary` and add a 4px soft glow using `primary_container` at 30% opacity.

### Cards & Lists (The "No Divider" Rule)
*   Forbid 1px horizontal dividers in lists. 
*   **Alternative:** Use 16px of vertical white space between list items, or alternate the background color of rows using `surface-container-low` and `background`.

### Academic-Specific Components
*   **Course Transcript Chips:** Use `secondary_container` with `on_secondary_container` text. Use `borderRadius: full` for a pill shape to distinguish from square data cards.
*   **Status Indicators:** Use "Soft Statuses." Instead of a harsh red, use an `error_container` background with `on_error_container` text for a sophisticated, legible warning.

---

## 6. Do's and Don'ts

### Do
*   **Do** use `surface-container-lowest` for the main content area to make it feel like a clean sheet of paper.
*   **Do** utilize `title-lg` for section headers to maintain a clear hierarchy.
*   **Do** allow for "Breathing Room." If you think there's enough padding, add 8px more.

### Don't
*   **Don't** use black (#000000) for text. Always use `on_surface` (#2b3437) to maintain a premium, softer contrast.
*   **Don't** use standard "drop shadows" on cards. Use tonal shifts.
*   **Don't** use "Information Density" as an excuse for clutter. Hide secondary actions behind a "More" (three-dot) menu to keep the workspace clean.