# Design System Specification: Editorial Precision

## 1. Overview & Creative North Star
**The Creative North Star: "The Clinical Atelier"**

This design system moves beyond the generic utility of medical software to embrace the sophisticated, high-end feel of a premium optical boutique. We are not just building a management tool; we are crafting a digital assistant that feels as precise as a lens and as refined as designer frames.

To achieve this, the system rejects "standard" mobile layouts in favor of **Editorial Asymmetry**. We utilize a hyper-clear typographic hierarchy and tonal layering to guide the eye. By removing traditional dividers and borders, we create a "seamless flow" where information is separated by light and space rather than rigid boxes. The result is an interface that feels expansive, professional, and intentionally curated.

---

## 2. Colors & Tonal Depth
Our palette is rooted in the authority of **Primary Purple (#7c3aed)** and **Secondary Blue (#2563eb)**, but it is the neutral "Surface" tokens that define the experience.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined through background shifts or subtle tonal transitions. Use `surface-container-low` for large section backgrounds and `surface-container-lowest` (Pure White) for interactive cards.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
- **Base Layer:** `surface` (#f9f9fc)
- **Sectioning Layer:** `surface-container-low` (#f3f3f6)
- **Interactive Component Layer:** `surface-container-lowest` (#ffffff)

### The "Glass & Gradient" Rule
To inject visual "soul," use subtle gradients for primary actions. Instead of a flat hex code, transition from `primary` (#630ed4) to `primary_container` (#7c3aed) at a 135° angle. For floating elements, use **Glassmorphism**: a background of `surface_container_lowest` at 80% opacity with a `20px` backdrop blur.

---

## 3. Typography: The Editorial Voice
We use a dual-font strategy to balance clinical precision with brand character.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism. Use `display-md` and `headline-lg` with tight letter-spacing (-0.02em) to create a bold, authoritative editorial feel.
*   **Body & Labels (Inter):** Chosen for maximum legibility at small sizes. The optical data (SPH, CYL, AXIS) must always use `title-md` in Inter to ensure zero ambiguity for the clinician.

**Typographic Hierarchy:**
- **Patient Names:** `headline-sm` (Manrope) - Bold and commanding.
- **Optical Values:** `title-md` (Inter, Medium weight) - High-contrast against `on_surface`.
- **Secondary Metadata:** `body-sm` (Inter) - Using `on_surface_variant` for reduced visual noise.

---

## 4. Elevation & Depth
Hierarchy is conveyed through **Tonal Layering**, not structural lines.

*   **The Layering Principle:** Depth is achieved by stacking. Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a "soft lift" that feels natural and modern.
*   **Ambient Shadows:** For floating elements (like Quick-Action Buttons), use an extra-diffused shadow: `0px 12px 32px rgba(99, 14, 212, 0.08)`. The shadow color is a tint of the `primary` color, not grey, to mimic natural light passing through a purple lens.
*   **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., in high-glare environments), use a "Ghost Border": `outline-variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Optical Data Input Fields
*   **Architecture:** Avoid the standard 4-wall box. Use a "Gutter" style: a `surface-container-high` background with a `xl` (1.5rem) corner radius. 
*   **States:** On focus, the background shifts to `primary_fixed` with a subtle `primary` glow.
*   **Context:** SPH, CYL, and AXIS inputs should be grouped in a horizontal flex-row to mimic the layout of a physical prescription.

### Mobile-Optimized Cards
*   **Constraint:** No dividers. Use `spacing-4` (1.4rem) to separate internal text elements.
*   **Style:** Use `surface-container-lowest`, a `16px` corner radius, and an asymmetric layout where the patient's initials or avatar overlaps the top-left edge of the card by `0.5rem`.

### Scanning Interfaces
*   **Visuals:** Use a "Glass" overlay using `surface_container` at 40% opacity with a heavy backdrop blur. The scanning reticle should be a `primary` stroke with a pulsate animation using the `surface_tint`.

### Quick-Action Buttons (QAB)
*   **Primary:** A floating circular action button (FAB) using the "Glass & Gradient" rule. 
*   **Secondary:** Ghost buttons (no fill) with `primary` text, used for less frequent actions like "Print" or "Export."

### Lists & Dividers
*   **The Rule:** Dividers are banned. Use vertical whitespace (`spacing-3` to `spacing-5`) and alternating `surface` vs `surface-container-low` backgrounds to denote list item transitions.

---

## 6. Do's and Don'ts

### Do
*   **Do** use generous whitespace (`spacing-6` or `spacing-8`) between major sections to let the design "breathe."
*   **Do** use `xl` (24px) corner radii for large containers and `md` (12px) for smaller interactive elements like chips.
*   **Do** ensure all "Optical Data" values are high-contrast (`on_surface` on `surface-container-lowest`).

### Don't
*   **Don't** use black (#000000). Use `on_background` (#1a1c1e) for a softer, more premium look.
*   **Don't** use 1px solid dividers. Use a `0.7rem` (spacing-2) gap or a tonal shift instead.
*   **Don't** use standard Material shadows. Always use tinted, diffused ambient shadows for depth.