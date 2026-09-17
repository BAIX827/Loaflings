# Loaflings / 摸鱼灵 — Character Visual Specification

> Canonical character design specification for Loaflings.
>
> This document defines the visual DNA that should remain consistent across
> all Loafling characters, variants, illustrations, sprites and animations.

---

## 1. Core Identity

A **Loafling / 摸鱼灵** is a tiny desktop companion with:

- a soft dough-like body
- a simple minimal face
- a small floating cloud above its body
- a relaxed, squishy and slightly lazy personality

The basic visual formula is:

`soft dough creature + tiny simple face + floating cloud + squishy silhouette`

Loaflings may vary significantly in colour, proportions, personality and
special traits, but they should still clearly belong to the same character family.

---

# 2. Canonical Character Assets

The Loafling character system uses different assets for different purposes.
Do not treat every asset as equally authoritative.

## Geometry Master

- `Pet_Base_Master.svg`

This is the **canonical geometry master** for the Base Loafling front view.

Use it as the primary reference for:

- body silhouette
- body proportions
- paw placement and size
- face placement
- tail placement
- cloud size and position
- outline geometry
- centre axis and baseline alignment

When recreating or modifying the Base Loafling, preserve the structure and
proportions of this SVG unless a deliberate character variation requires a change.

The current master uses a `1200 × 900` viewBox and should remain fully vector
and editable. Geometry may be constructed from circles, ellipses and consistent
radii, but the final silhouette should still feel soft rather than mechanical.

## Implementation Reference

- `loafling-standard-base.css`

This file records implementation-oriented values such as:

- dimensions
- absolute positions
- colours
- outline widths
- guide positions
- component bounds

The CSS supports implementation, reconstruction and UI integration, but it is
**not** the authoritative source for vector geometry. If CSS values and the SVG
shape disagree visually, preserve the SVG geometry and update the implementation.

## Visual References

- `loaflings-character-design-bible.png`
- `loafling-base-front.png`
- `loafling-base-side.png`
- `loafling-base-back.png`

These raster references define the intended visual feeling, softness,
personality and rendered appearance.

Use them to judge whether a result still feels like a Loafling, but do not copy
small generation inconsistencies from raster images when they conflict with the
canonical SVG geometry.

## Asset Roles

Use the assets according to this rule:

`MD = design rules`

`SVG = canonical geometry`

`PNG = visual feeling and rendered appearance`

`CSS = implementation values`

---

# 3. Base Loafling

The Base Loafling is the neutral starting form.

It should feel like a small piece of living dough rather than a normal animal.

## Body

The body is:

- soft
- rounded
- slightly irregular
- dough-like
- squishy
- low to the ground
- visually lightweight and comfortable

The construction may use circles, ellipses and consistent radii so that the
character can be reproduced reliably across SVG, Figma and game assets.

However, the **final silhouette should not read as a mathematically perfect
sphere or oval**.

Small controlled asymmetries are desirable where they preserve the soft,
hand-shaped feeling.

The silhouette should feel like a soft piece of dough gently settled under
gravity rather than a rigid geometric logo.

There is no obvious separation between:

- head
- neck
- torso

The creature is essentially one continuous soft body.

---

# 4. Body Proportions

The body should generally be:

- wider than it is tall
- compact
- low
- visually soft

Approximate default proportion:

`width : height ≈ 1.5–1.8 : 1`

This ratio may vary between individual Loaflings.

Allowed body variations include:

- slightly rounder
- wider
- longer
- chubbier
- flatter
- taller
- mildly asymmetrical

Do not make the body extremely thin, muscular or anatomically realistic.

---

# 5. Limbs

Limbs are secondary to the body.

Default limbs should look like:

- tiny dough nubs
- rounded paws
- soft protrusions from the body

They should NOT look like realistic arms or legs.

Avoid:

- elbows
- knees
- fingers
- realistic joints
- long human-like limbs

The default front paws should remain small compared with the main body.

---

# 6. Face

The face is deliberately minimal.

## Eyes

Default eyes:

- two small dark dots or very simple oval dots
- symmetrical or very slightly imperfect
- no complex highlights required
- no realistic eyelids

The eyes should occupy very little visual space.

## Mouth

The mouth should be:

- extremely small
- simple
- subtle

Suitable shapes include:

- tiny line
- tiny soft `w`
- tiny shallow curve

Avoid large anime mouths or detailed lips.

## Blush

Soft blush may appear on both cheeks.

Blush should be:

- pale
- subtle
- soft-edged
- optional depending on state or variation

---

# 7. The Floating Cloud

The floating cloud is one of the most important visual signatures of Loaflings.

**Every standard Loafling should have a cloud.**

## Placement

The cloud:

- floats above the Loafling
- does NOT physically grow from the body
- does NOT touch the head
- has a clearly visible air gap

The cloud should feel connected to the Loafling emotionally rather than physically.

## Size

The cloud should be significantly smaller than the creature.

Approximate visual relationship:

`cloud width ≈ 25–40% of body width`

Do not make the cloud dominate the character.

## Shape

Default cloud:

- small
- soft
- rounded
- simple
- approximately 2–4 cloud lobes

Avoid highly realistic clouds.

The shape should be readable even at small desktop-icon scale.

---

# 8. Cloud Behaviour

The cloud may react to:

- mood
- activity
- work state
- idle state
- personality
- special traits

Examples:

### Normal

Small soft white cloud.

### Focused

Slightly tighter or brighter cloud.

### Happy

Softer, slightly puffier cloud.

### Sleepy

Cloud may lower slightly or become softer.

### Dreaming

May include extremely subtle:

- stars
- moon
- glow

### Rainy

Cloud may become grey-blue and produce tiny droplets.

### Stormy

Cloud may darken and show a small lightning effect.

These states must still preserve the same basic cloud identity.

The cloud should not become an unrelated giant weather system.

---

# 9. Base Colour

Default Base Loafling colour:

- warm cream
- off-white
- very light beige

Avoid pure clinical white.

The body should feel warm and soft.

Suggested colour family:

`cream / milk / warm ivory`

Secondary shading may use:

- pale peach
- warm beige
- very soft brown

## Canonical Base Master Tokens

The current Base Loafling front-view master uses the following canonical
colour tokens:

- Canvas / background: `#FFFDFC`
- Body fill: `#FFF8F1`
- Main outline: `#4B3A32`
- Blush: `#FFD6D6`
- Tail accent: `#FFE9DB`
- Cloud fill: `#EAF4FF`
- Cloud outline: `#8CB7F0`
- Construction guides: `#CFC7C2`

At the current `1200 × 900` master scale, the main implementation stroke
widths are:

- body outline: `8px`
- paws and tail: `7px`
- facial mouth stroke: `7px`
- toe details: `5px`
- cloud outline: `5px`
- thought dot outline: `4px`
- geometry guides: `1–2px`

These values describe the canonical master scale. When the character is scaled,
stroke widths and spacing should scale proportionally unless the target renderer
requires optical adjustment for very small sizes.

---

# 10. Outline

Preferred outlines:

- thin
- soft
- dark brown
- desaturated charcoal-brown

Avoid pure black heavy outlines.

Outline thickness should remain relatively consistent.

The outline should support the form without becoming the dominant visual element.

---

# 11. Shading

Shading should be subtle.

Preferred style:

- soft digital painting
- gentle watercolor-like shading
- very mild gradients
- warm ambient shadows

Avoid:

- hard cel shading
- dramatic cinematic lighting
- strong specular reflections
- photorealistic textures

The character should remain readable at small size.

---

# 12. Ground Shadow

A very subtle ground shadow may appear beneath the Loafling.

The shadow should be:

- soft
- light
- small
- slightly warm or neutral

Its purpose is only to prevent the character from visually floating.

The cloud itself should still clearly float.

---

# 13. Overall Personality

The visual personality should communicate:

- calm
- cozy
- friendly
- slightly lazy
- curious
- harmless
- quietly expressive

A Loafling should feel like:

> something that happily sits beside you while you work.

It should NOT feel like:

- an action-game mascot
- an aggressive monster
- a hyperactive cartoon sidekick
- a realistic pet
- a traditional Pokémon-like battle creature

---

# 14. Squishy Physical Language

All Loaflings should feel physically soft.

When moving or reacting, their body may:

- compress
- stretch slightly
- wobble
- bounce softly
- flatten
- slowly return to shape

The motion should imply:

`soft dough + mochi + cushion`

rather than:

`rubber ball`

Movements should generally have gentle easing and slight secondary motion.

---

# 15. Idle Behaviour

Loaflings are desktop companions, so their default behaviour should be calm.

Typical idle behaviour:

- breathing gently
- slightly shifting weight
- blinking
- looking around
- subtly squishing
- cloud slowly drifting
- gradually becoming sleepy

The character should not constantly demand attention.

---

# 16. Core Expressions

Required basic expressions should include:

- Normal
- Happy
- Sleepy
- Curious
- Surprised
- Focused
- Grumpy
- Excited

Expressions should primarily be communicated through:

- eyes
- tiny mouth
- body posture
- cloud behaviour

Do not rely on highly detailed facial anatomy.

---

# 17. Allowed Character Variations

Loaflings may vary in:

## Body

- width
- height
- softness
- asymmetry
- overall silhouette

## Colour

Examples:

- Cream
- Mocha
- Matcha
- Strawberry
- Mint
- Lavender
- Sky
- Sesame
- Chocolate

## Markings

Possible subtle markings:

- patches
- spots
- gradients
- soft colour zones

## Small Physical Traits

Possible traits:

- tiny ears
- small tail
- subtle horns
- small fins
- tiny wings
- soft mechanical components
- plant details
- elemental characteristics

## Accessories

Possible accessories:

- blanket
- glasses
- headphones
- backpack
- tiny hat
- scarf

Accessories should never visually overpower the Loafling.

---

# 18. Variation Rule

The design principle is:

> **Vary the character, not the visual DNA.**

Different Loaflings can look meaningfully different.

However, the following visual characteristics should remain recognizable:

1. soft rounded body language
2. simple minimal face
3. small floating cloud
4. gentle pastel/cozy art direction
5. squishy physical feeling
6. friendly desktop-companion personality

A variation should still immediately feel like it belongs to the Loaflings world.

---

# 19. Avoid Becoming a Normal Animal

A Loafling may contain animal-inspired traits.

For example:

- small rabbit ears
- small cat-like tail
- tiny bear ears

However:

**The creature itself should NOT simply become a cat, dog, rabbit, bear or other standard animal.**

Animal traits are modifiers.

The underlying creature must remain a Loafling.

Bad:

`normal cat + cloud`

Good:

`Loafling body + subtle cat-inspired ears`

---

# 20. Design Constraints

## DO

- keep shapes soft
- use rounded silhouettes
- preserve the floating cloud
- keep the face minimal
- use gentle pastel colours
- allow subtle imperfections
- maintain the soft dough feeling
- design for small desktop display sizes
- preserve visual readability
- allow personality through animation

## DO NOT

- use sharp body geometry
- use realistic anatomy
- use realistic fur
- use detailed noses
- use realistic eyes
- use muscular bodies
- make limbs human-like
- overload the character with accessories
- make the design visually aggressive
- turn every variation into a normal animal
- attach the cloud directly to the body
- remove the cloud from standard Loaflings
- make the cloud larger than the creature
- add unnecessary visual complexity

---

# 21. Base Character — Front View

Canonical geometry master:

`Pet_Base_Master.svg`

Implementation reference:

`loafling-standard-base.css`

Visual reference:

`loafling-base-front.png`

The SVG is authoritative for front-view geometry. The CSS is authoritative only
for implementation values that reproduce that master. The PNG remains a visual
reference for softness, rendered feeling and overall art direction.

Important characteristics:

- wide soft body
- low stance
- front paws visible
- minimal face
- warm cream colour
- small floating cloud
- cloud centred approximately above the body
- visible air gap between cloud and body
- geometry aligned around a stable centre axis and baseline
- shapes remain simple enough to recolour, accessorise and animate

---

# 22. Base Character — Side View

Canonical reference:

`loafling-base-side.png`

Important characteristics:

- body extends horizontally
- front of body remains soft and rounded
- rear body gently tapers
- small rear/tail form
- no visible neck
- entire body remains a continuous dough shape
- cloud remains floating above the body

---

# 23. Base Character — Back View

Canonical reference:

`loafling-base-back.png`

Important characteristics:

- large continuous rounded body
- simple rear silhouette
- small soft rear/tail feature
- no complex anatomical structure
- cloud remains visible above

---

# 24. Character Generation Checklist

Before accepting a generated Loafling, verify:

- [ ] Does it look soft and dough-like?
- [ ] Is the body rounded and organic?
- [ ] Is there no clear human/animal anatomical torso structure?
- [ ] Is the face very simple?
- [ ] Are the eyes small?
- [ ] Is the mouth tiny?
- [ ] Is the cloud clearly floating?
- [ ] Is there visible space between cloud and body?
- [ ] Is the cloud smaller than the body?
- [ ] Does the colour palette remain soft and cozy?
- [ ] Are details restrained?
- [ ] Would the design remain readable at small desktop size?
- [ ] Does it still clearly feel like a Loafling?

If several answers are "No", redesign the character.

---

# 25. Standard AI Image Generation Instruction

When creating Loafling artwork, use the following instruction together with
the specific task:

> Follow `LOAFLING_CHARACTER_SPEC.md` and the canonical Loafling character
> assets for visual identity.
>
> For the Base Loafling front view, use `Pet_Base_Master.svg` as the geometry
> authority. Use canonical PNG references for visual feeling and
> `loafling-standard-base.css` only for implementation values.
>
> Preserve the Loaflings core visual DNA:
> a soft irregular dough-like body, tiny minimal face, rounded squishy
> silhouette, warm cozy pastel styling, and a small cloud floating above the
> body with a visible gap.
>
> The new character may vary in body shape, colour, mood, personality and
> secondary traits, but it must immediately remain recognizable as a Loafling.
>
> Preserve the character family identity. Vary the individual character,
> not the underlying visual DNA.

---

# 26. Priority When Generating Artwork

When instructions conflict, use:

1. Current explicit user instruction
2. `LOAFLING_CHARACTER_SPEC.md`
3. `Pet_Base_Master.svg` for canonical front-view geometry
4. Canonical PNG references for visual appearance and art direction
5. `loafling-standard-base.css` for implementation values
6. Relevant additional reference material
7. Model interpretation

Do not override canonical SVG geometry with approximate raster details or
implementation shortcuts unless the current explicit instruction requires it.

Do not introduce major visual changes based only on model interpretation.

---

# 27. Current Canonical Definition

**A Loafling is a tiny, soft, dough-like desktop companion with a simple face
and a small expressive cloud floating above its body.**

It should feel:

**soft, cozy, quiet, squishy, slightly lazy and alive.**