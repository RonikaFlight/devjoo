# DevJoo — Design System

## Colors

### Brand (Purple)
| Token | Value | Usage |
|-------|-------|-------|
| --primary | #7C3AED | Main CTA, brand accents, selected items, active nav, Match Score |
| --primary-light | #8B5CF6 | Hover states, secondary brand |
| --primary-dark | #6D28D9 | Pressed states, dark mode primary |
| --primary-soft | #F5F3FF | Light purple backgrounds, badges |

### Base
| Token | Value | Usage |
|-------|-------|-------|
| --background | #F8FAFC | Page background |
| --surface | #FFFFFF | Cards, modals, panels |
| --text-primary | #0F172A | Headings, body text |
| --text-secondary | #475569 | Descriptions, captions |
| --border | #E2E8F0 | Borders, dividers |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| --success | #16A34A | Success states, verified badges |
| --warning | #D97706 | Warning states, pending |
| --danger | #DC2626 | Error states, rejected |
| --info | #2563EB | Info states |

### Dark Mode
| Token | Value |
|-------|-------|
| --background | #0F172A |
| --surface | #1E293B |
| --text-primary | #F8FAFC |
| --text-secondary | #94A3B8 |
| --border | #334155 |
| --primary-soft | rgba(124,58,237,0.15) |

## Typography

### Font Family
- **Primary**: Vazirmatn (self-hosted)
- **Code/Mono**: Geist Mono (for code blocks only)

### Font Weights
| Weight | Usage |
|--------|-------|
| 400 | Body text |
| 500 | Subheadings, buttons |
| 600 | Headings, emphasis |
| 700 | H1, H2 |
| 800 | Display, brand |

### Font Sizes (Tailwind)
| Class | Size | Usage |
|-------|-------|-------|
| text-xs | 12px | Captions, badges |
| text-sm | 14px | Secondary text, labels |
| text-base | 16px | Body text |
| text-lg | 18px | Subheadings |
| text-xl | 20px | Section headings |
| text-2xl | 24px | Page headings |
| text-3xl | 30px | Hero text |
| text-4xl | 36px | Display |

## Spacing
- Base unit: 4px
- Component padding: p-4 (16px) or p-6 (24px)
- Card padding: p-5 (20px) or p-6 (24px)
- Section gaps: gap-4 or gap-6
- Page padding: px-4 sm:px-6 lg:px-8

## Border Radius
| Usage | Value |
|-------|-------|
| Cards | rounded-xl (12px) or rounded-2xl (16px) |
| Buttons | rounded-lg (8px) |
| Inputs | rounded-lg (8px) |
| Badges | rounded-full |
| Avatars | rounded-full |
| Modals | rounded-xl (12px) |

## Shadows
| Usage | Value |
|-------|-------|
| Cards | shadow-sm (very subtle) |
| Dropdowns | shadow-md |
| Modals | shadow-xl |

## Buttons

### Variants
| Variant | Style |
|---------|-------|
| Primary | bg-primary text-white hover:bg-primary-dark |
| Secondary | bg-surface border border-border text-text-primary |
| Ghost | text-text-secondary hover:bg-primary-soft |
| Danger | bg-danger text-white |
| Link | text-primary underline-offset-4 |

### Sizes
| Size | Padding | Font |
|------|---------|------|
| sm | px-3 py-1.5 text-sm |
| md | px-4 py-2 text-sm |
| lg | px-6 py-3 text-base |

## Cards
- Border radius: 12-16px
- Subtle border: border border-border
- Very subtle shadow: shadow-sm
- Clean spacing inside
- Hover: slight shadow increase

## Inputs
- Border radius: 8px
- Border: border border-border
- Focus: ring-2 ring-primary/20 border-primary
- Error: border-danger
- RTL-aware (text alignment, icons)

## Badges
| Type | Style |
|------|-------|
| Default | bg-primary-soft text-primary |
| Success | bg-green-50 text-success |
| Warning | bg-amber-50 text-warning |
| Danger | bg-red-50 text-danger |
| Verified | bg-green-50 text-success + check icon |

## Status Colors
| Status | Color |
|--------|-------|
| Published | success (green) |
| Draft | text-secondary |
| In Progress | primary (purple) |
| Completed | success (green) |
| Cancelled | danger (red) |
| Pending | warning (amber) |
| Expired | text-secondary |

## Breakpoints
| Name | Min Width |
|------|-----------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

## RTL Rules
- Use logical properties (start/end instead of left/right)
- Technology names (React, Next.js) remain LTR
- Icons should be mirrored where direction matters
- Arrows: flip for RTL
- Numbers: Persian digits for UI, English for technical context
- Mixed text: proper unicode-bidi handling

## Dark Mode
- Designed, not auto-inverted
- Sufficient contrast for Persian text
- Purple accents adjusted for dark backgrounds
- User preference stored and respected
