# Section story prompt

Reusable brief for turning a text-heavy programme section into a visual story.
Written after rebuilding Tomorrow's Reef; apply the same treatment to Climate
Dash & Eco-Village and Pinelands Pavilion.

Paste the prompt below, replace `[SECTION]`, and attach the photo folder and any
edited video.

---

> Rebuild the **[SECTION]** section of the Green Rising site as a visual story
> for a youth audience. The media carries the meaning; the words support it.
>
> **First, audit.** List everything the section currently says and mark what is
> genuinely load-bearing — a real figure, a place, a named partner. Assume most
> prose is cut. Show me that list before you write anything, and flag any copy
> you suspect was AI-generated rather than written by the organisation.
>
> **Then order the photos into an arc.** Name the beat each one carries in one
> short phrase, and say which photo is the payoff. If two photos carry the same
> beat, use one.
>
> **Writing rules.**
> - Captions of 8 words or fewer, one idea each.
> - No dates unless the date *is* the point.
> - No self-description: "landmark", "flagship", "premiere", "immersive",
>   "state-of-the-art". If a sentence tells the reader how to feel, cut it.
> - Second person where it fits. A 15-year-old should recognise the voice.
> - Never invent a fact to fill a slot. Leave a marked placeholder instead.
>
> **Build rules.**
> - One pinned GSAP scrub sequence per page, maximum. Everything else scrolls
>   normally. If this page already has a pin, do not add a second.
> - Never run two scroll systems on the same element. GSAP owns pinning;
>   CSS-sticky or Framer own anything unpinned.
> - Every frame must be a visible element in the markup. JavaScript only
>   enhances. If the script never runs, the section is still a readable gallery.
> - `ScrollTrigger.refresh()` after lazy images load, or the pin height is
>   computed from unloaded images and unpins early.
> - Mixed orientations: `cover` in a 16:9 frame crops a portrait photo by ~60%.
>   Contain portraits over a blurred copy of themselves instead.
>
> **Assets.**
> - Resize every photo to 1920px on the long edge, quality ~82. Camera
>   originals run 12–16 MB each and are unusable as-is.
> - Check EXIF orientation *before* resizing. `System.Drawing` writes no EXIF,
>   so an orientation tag that the browser was honouring is silently lost and
>   the image flips.
> - Video: `-c:v libx264 -crf 28 -preset slow -vf scale=1280:-2 -c:a aac
>   -b:a 112k -movflags +faststart`. Click-to-play against a poster frame, never
>   autoplay — a 45 MB autoplaying video is what exhausted the hosting quota.
> - Lowercase filenames, no spaces. `Hero 1.JPG` needed `%20` encoding and broke
>   on case-sensitive hosts.
>
> **Verify before reporting done.**
> - Zero console errors, checked in a *fresh tab* — console messages persist
>   across navigations and have produced false results before.
> - Strip every inline style and confirm all media still computes to opacity 1.
> - No horizontal scroll at 390px.
> - Both themes.
> - `prefers-reduced-motion` degrades to a plain gallery.
> - Report page weight before and after.
>
> **Do not commit anything without asking.**

---

## What this produced for Tomorrow's Reef

| | Before | After |
|---|---|---|
| Section markup | 323 lines | 147 lines |
| Media on the page | none | 6-frame pinned sequence + film |
| Photos | — | 100.7 MB → 1.94 MB |
| Video | — | 45.49 MB → 12.49 MB |

Structure: intro + film → pinned scrub sequence (GSAP) → stacked cards
(21st.dev Scroll Cards, CSS-sticky, mounted as a React island) → three facts →
partners.
