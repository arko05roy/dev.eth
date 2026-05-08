# Brand — The Tarnished Path

_Status: applied (codified from established direction, not via brand-design interview)_

A learning game built on Devcon and ETHGlobal's complete archive. The aesthetic is **dark scholarly archive**: Miyazaki dread, Souls restraint, illuminated-manuscript typography. Warm parchment ink on deep void.

## Palette

OKLCH primary. Hex for display.

| Token | Hex | Role |
|---|---|---|
| `--bg` (void) | `#0e0c0a` | Base background — deep ink |
| `void-50` | `#1a1714` | Elevated surface (cards, panels) |
| `--fg` (parchment) | `#d9cdb4` | Body text |
| `parch-dim` | `#a89c87` | Secondary text, prose |
| `parch-faint` | `#7a7160` | Tertiary, mono captions |
| `parch-ghost` | `#4a4438` | Hint of text, locked states |
| `--ember` | `#c9a96e` | THE accent. Used sparingly: bosses, CTAs, runes. |
| `ember-glow` | `#e6c896` | Highlight/halo |
| `--blood` | `#7a3a2c` | Reserved for destructive actions only |
| `--hairline` | `#2a2520` | Dividers, borders. Always thin. |

Single-accent system. Ember is the only chromatic note in a grayscale-warm world. Multiple competing colors are anti-pattern.

## Typography

Display: **Cormorant Garamond** (Google Fonts) — serif, used for act titles, boss names, runes. Italic carries 80% of the emotional weight. Weights 400/500/600/700.

Body: **Inter** — sans, used for body prose, tertiary text. Weights 400/500.

Mono: **JetBrains Mono** — used for metadata, tags, "rune labels," all-caps tracking-widest captions. Weights 400/500.

Hierarchy:
- 3 weights max in any view.
- 4–5 sizes max in any view.
- Tracking-widest (`0.18em`) on small mono labels in caps. This is the manuscript-rule device.

## Voice

**Miyazaki dread, not Marvel quips.** Cryptic, weighty, melancholy. Cypherpunk-adjacent. Never corporate, never explanatory.

Three modes:
- **Site of Grace** prose: 2nd person, "Tarnished, you stand…" Weighty. Sentences end in fragments.
- **Boss runes**: "the rune of *X*" — italic, single noun.
- **Mono captions**: small caps, terse. `─── THREADS ───` framing.

Forbidden:
- Emojis.
- "Key learnings", "actionable insights", "it's that easy", "buckle up".
- Gradient buttons. AI-default purple. Bouncy springs. Drop shadows.
- "Click here", "learn more", "discover".

Allowed lore vocabulary: *rune, gate, vow, flame, witness, shroud, thread, the Land of, the Tarnished, the Erdtree, kin, sermon, scroll, apocrypha, canon.*

## Motion

Restrained. 200–400ms ease-out. **No springs.** No bounce. Asymmetric: entry slightly longer than exit. Reduced-motion respected unconditionally.

The single allowed flourish: a soft fade-up + opacity on first reveal of new content (`fade-up`).

## Composition

- **Hairlines, not boxes.** When a divider is needed, use a 1px line in `--hairline`. Frames are rare and signify importance (boss cards).
- **Asymmetry**. Generous left-rail space, ragged right edges, dropped capitals.
- **Greek glyphs (Α Β Γ Δ Ε Ζ · Φ Μ Σ Χ · Ψ Ξ Λ Π Θ)** as section marks. Never English numerals where a glyph fits.
- **Boss cards are illuminated**. Double-rule top, drop-cap prose, rune-callout block. They're the only place ornament is allowed.

## Backgrounds & atmosphere

- Subtle parchment grain via SVG circles or radial gradients (low opacity ~0.04).
- A single warm radial glow in the upper-third of any large surface, fading to void at the edges.
- No noise textures. No glassmorphism. No gradient meshes.

## Brand voice tagline candidates

- "Walk it in order, or wander."
- "Some doors open only after others close."
- "The map is most accurate at the bosses and grows fainter at the edges."

## Don't list

- Don't add a second accent color. Ember is the only chromatic anchor.
- Don't use rounded corners larger than 2px outside avatars/logos.
- Don't pair sans + serif at the same weight in the same line.
- Don't truncate boss prose. It's load-bearing.
- Don't render brand logos at full color saturation — desaturate to `0.85` and brightness `0.95`.
