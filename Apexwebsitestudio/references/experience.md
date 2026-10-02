# Experience layer (scrollcraft-grade)
A correct page and a memorable page are two different products. The trial sites were correct, with calls up top, real facts and nothing broken, but they read as documents: static blocks stacked on top of each other. Clients buy a site that feels like an experience, so every Demo and Build ships with this layer. It's the default, not an upgrade.

If the `scroll-craft` skill is installed, read its `references/devices.md` and `references/hero-depth.md` too. This file is the version tuned for local-service sites.

## 1. Plan a scroll score before any code
Write `.atelier/score.md` with one row per section:
`section · device · what moves · what the visitor feels · scroll length`.
Then add these two lines:
- **Feeling curve:** where the page is calm, where it's intense, and where the single **peak** is. The peak is the moment a visitor would describe to a friend: "It's the site where the termite tent drapes over the house as you scroll."
- **Tell-someone sentence:** "It's the site where ___." Fill the blank with an experience, not a feature.

If you can't fill in the sentence, the page isn't designed yet.

## 2. Dimensional hero (required)
Build the hero from **at least 3 independently moving planes**:
1. **Background:** the sky, the street or the room.
2. **Subject:** the house, the unit or the person.
3. **Foreground:** palm fronds, a tool, a tag or a stamp.
4. Optionally **atmosphere:** heat shimmer, light rays or dust.

How to build and move them:
- **Layering:** the headline sits *between* planes, so the subject partially covers the background while the text stays fully readable.
- **Scroll motion:** on scroll, the planes move at different rates, for example background 0.2×, subject 0.5× and foreground 1.2×, plus a slight scale on the subject. Drive this with `animation-timeline: scroll()` inside `@supports`, with a transform-only JS fallback using `requestAnimationFrame`.
- **Pointer motion (desktop):** move the planes 4–12px with the pointer.
- **Reduced motion:** the static composition still shows depth through overlap and occlusion; only the movement goes.
- **No photos:** build the planes as layered SVG illustration in the brand's line style (a house cutout, palm silhouettes, a tent). Never use one flat image with text faded over it.

## 3. Device families: use at least 4, never the same twice in a row
| Family | Device | Good for |
|---|---|---|
| Pin & scrub | the section pins, and scroll scrubs a transformation (a tarp drapes, a dial turns, a ledger fills) | the peak |
| Reveal by mask | clip-path or mask wipes a before→after (old site→new, dirty duct→clean) | proof |
| Horizontal track | a pinned section scrolls sideways through steps or towns | process, service area |
| Draw-on | SVG paths draw as you scroll (a duct route, a map, a signature) | journeys, maps |
| Stack & shuffle | cards stack and peel off like a work-order pad | services, reviews |
| Count & stamp | real numbers count up and a stamp presses down (sourced facts only) | trust |
| Type in motion | the headline splits and its lines slide at different speeds | section openers |
| Quiet section | deliberate stillness: big type, no motion | rest before and after the peak |

The quiet sections matter. A page that moves the whole way through is as flat as one that never moves.

## 4. Mobile is its own composition
- Re-art-direct the hero for portrait, with fewer planes (2–3) and the subject cropped closer.
- Horizontal tracks become vertical swipeable cards with a visible peek.
- Pinned sections get at most 150vh of scroll on phones.
- The call button never sits underneath a pinned layer.

## 5. Implementation rules
- **Animation:** transform and opacity only. Use `will-change` only while a section is active. Use IntersectionObserver to start and stop work.
- **Libraries:** GSAP + ScrollTrigger (cdnjs, `defer`) are allowed for pin & scrub and horizontal tracks. CSS scroll timelines are preferred where enough. Lenis smooth scroll is optional, and off when reduced motion is on.
- **Pinning:** every pinned section has a no-JS fallback that shows its final state.
- **Budget:** the experience layer adds at most about 120KB gzipped of JS. Keep 60fps on a mid-range phone; if a device stutters, simplify it.
- **Verification:** `inspect.mjs --shots` tours the page screen by screen, so check the peak's start, middle and end frames on the contact sheet, and the reduced-motion shot.

## 6. Critic check (brand lens)
- Is the hero layered, with at least 3 planes visibly moving at different rates?
- Are there at least 4 device families, with no repeats side by side?
- Is there one clear peak?
- Can you write the tell-someone sentence from the screenshots alone?

Any "no" caps the brand score at 6.
