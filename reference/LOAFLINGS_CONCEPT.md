# Daylings — Desktop Companion Idle Game Inspiration Notes

## 1. Core Idea

**Daylings** is a desktop companion / idle game where the player's normal computer-use patterns gradually create a unique creature.

The main idea is:

> **You work. It grows. Every day leaves behind a creature.**

Instead of rewarding only raw clicks, keystrokes, or idle time with simple currency, the game turns the *shape of the player's day* into a creature.

Each day begins with an egg or a new tiny lifeform.

Throughout the day, anonymous interaction patterns influence its traits:

- Typing bursts
- Click frequency
- Mouse movement
- Continuous focus time
- Idle time
- Window switching frequency
- Active hours
- Work/rest balance

At the end of the day, the creature is permanently recorded in the player's collection.

Over time, the player's computer-use history becomes a personal ecosystem.

---

## 2. Why This Is Different

Many current desktop companion games broadly fall into several patterns:

### Bongo Cat style
- Typing/clicking generates points
- Points unlock hats, cosmetics or collectibles
- Very low interaction cost

### Desktop idle / farming style
Examples: Rusty's Retirement, Tiny Pasture

- Game sits at the edge of the desktop
- Resources accumulate while the player works
- Player occasionally returns to collect and upgrade

### Productivity companion style
Example: Spirit City

- Pomodoro / focus / to-do systems
- Productivity actions generate XP or unlockables
- More explicitly framed as a productivity tool

### Desktop pet activity trackers
Examples: Pawgress and similar projects

- Keyboard/mouse activity affects the pet
- Pet reacts to activity level

### Desktop-world pets
- Pets stand on or move around actual windows
- Windows and desktop space become part of the play area

### “You work, they work” games
- Typing makes an on-screen character write, code, build, etc.

---

## 3. Main Differentiator

The goal should **not** be:

> 10,000 keystrokes = 10,000 coins.

Instead:

> **How you used your computer today becomes the genetics of today's creature.**

This makes the system harder to reduce to simple grinding.

The player is rewarded for patterns rather than just volume.

Examples:

- Heavy typing → mechanical claws / typewriter tail
- Long focus sessions → Deep Focus trait
- Lots of mouse movement → wings / explorer trait
- Frequent window switching → Window Hopper trait
- Long idle sessions → Dream-related traits
- Mostly late-night activity → Night Owl species
- Balanced work/rest → calm or Zen-type creature
- Chaotic bursts of input → strange unstable mutation

The outcome should feel slightly unpredictable.

The player should regularly think:

> “What the hell did I create today?”

---

## 4. Daily Gameplay Loop

### Morning

A new egg appears:

`🥚`

The creature starts the day mostly undefined.

### During work

The player continues using the computer normally.

The creature changes gradually based on activity.

Examples:

- Typing causes it to build something
- Mouse movement makes it explore
- Focus sessions make it craft
- Idle time causes it to sleep, dream, fish, explore or leave the screen

The game should remain non-intrusive.

### Short interaction moments

When the player has free time, they can interact for 10–60 seconds.

Possible interactions:

- Feed the creature
- Throw a toy
- Open something it found
- Choose between two evolution directions
- Dig for treasure
- Pet it
- Inspect its current traits

### End of day

The creature finishes developing.

Example result:

```text
NEW DAYLING DISCOVERED

Momo

Type: Night Builder
Rarity: Rare

Focus: ★★★★☆
Curiosity: ★★★★★
Laziness: ★★☆☆☆

Traits:
- Keyboard Tail
- Night Owl
- Fisher
- Window Hopper
```

The Dayling then permanently enters the player's collection.

The next day begins with a new egg.

---

## 5. Activity Resources

The game should reward all major ways of using — or not using — the computer.

### Work Energy

Generated from:

- Typing
- Clicking
- Sustained active input

Possible uses:

- Building
- Crafting
- Physical evolution
- Tools
- Structures

### Explore Energy

Generated from:

- Mouse movement
- Window switching
- Broad desktop interaction

Possible uses:

- Exploration
- Finding items
- Unlocking map regions
- Curiosity-related traits

### Dream Energy

Generated from:

- Idle time
- Breaks
- Leaving the computer alone

Possible uses:

- Dreams
- Rare discoveries
- Strange mutations
- Memory fragments
- Night-only items

This is important because **idle time should not be treated as failure**.

A player who does nothing for an hour should still come back to something interesting.

Example:

> The creature went fishing while you were away.

or:

> Your Dayling disappeared for 47 minutes and came back with an ancient skull.

---

## 6. Creature Genetics

Creature appearance should be generated modularly.

Possible mapping:

```text
body        = focus pattern
ears        = typing pattern
tail        = mouse activity
colour      = active time of day
accessory   = rare daily event
personality = work / idle ratio
mutation    = unusual behaviour combination
```

Example art component pool:

- 20 body types
- 15 ear types
- 15 tail types
- 10 colour palettes
- 30 accessories

This already creates:

**1,350,000 visual combinations**

without manually drawing 1.35 million creatures.

Traits can further increase uniqueness.

---

## 7. Personality System

Daylings should have lightweight personalities derived from behaviour patterns.

Possible personalities:

- Builder
- Explorer
- Dreamer
- Night Owl
- Hyperactive
- Lazy
- Collector
- Scholar
- Wanderer
- Gremlin
- Perfectionist
- Distracted
- Calm
- Curious

Personality should affect animation and idle behaviour, not just stats.

For example:

### Explorer
Frequently leaves the corner of the screen and returns with objects.

### Dreamer
Sleeps often and generates unusual dream items.

### Builder
Creates increasingly elaborate structures.

### Gremlin
Steals desktop objects, hides items or behaves chaotically.

---

## 8. Long-Term Progression

The major long-term goal should not simply be:

> Level 87 cat.

Instead, the player slowly creates a personal ecosystem from many different days.

### The Collection

Every completed Dayling is permanently stored.

Possible presentation:

- Terrarium
- Island
- Desktop zoo
- Floating world
- Laboratory
- Digital ecosystem

Old creatures continue interacting.

This means the player's collection gradually becomes a visual record of their life with the computer.

---

## 9. Weekly and Long-Term Mutations

Patterns across multiple days can unlock special species.

Examples:

### Night Species

Condition:

- Heavy activity late at night for several days

### Zen Species

Condition:

- Balanced work and idle periods

### Explorer Species

Condition:

- Very high mouse movement over a week

### Deep Worker Species

Condition:

- Multiple long uninterrupted sessions

### Chaos Species

Condition:

- Extreme switching / input patterns

### Wanderer Species

Condition:

- Multiple low-activity days

These should not punish behaviour.

Even “unproductive” behaviour can create interesting species.

---

## 10. Offline / Idle Events

When the player is away, the creature should continue living.

Possible events:

- Fishing
- Sleeping
- Digging
- Exploring
- Visiting another Dayling
- Building something
- Discovering an item
- Getting lost
- Bringing back a mysterious object

This creates the feeling that the creature exists independently of the player.

The important emotional loop is:

> “I wonder what it did while I was gone.”

---

## 11. Short Active Minigames

The project does not need large traditional minigames.

Small optional interactions are enough.

Examples:

### Digging

Click several times to uncover an object.

### Catch

Throw an object and see how the creature reacts.

### Feeding

Choose between several foods.

### Expedition Choice

Choose:

- Forest
- City
- Cave

The creature returns later with different loot.

### Evolution Choice

Occasionally choose between two visual mutations.

These interactions should remain optional.

The core game should still function when ignored.

---

## 12. Shareable Daily Card

Each day can generate a shareable summary.

Example:

```text
17 Sep 2026

⌨️ 8,421 keystrokes
🖱️ 3.7 km mouse travel
🔥 Longest focus: 74 min
💤 Idle: 2h 13m

You created:

THE OVERTHINKER

Rare
```

with the generated Dayling shown underneath.

This can provide strong organic sharing potential.

Possible communities:

- Steam screenshots
- Reddit
- X
- Discord
- Xiaohongshu
- TikTok / short-form content

The creature itself becomes the shareable result.

---

## 13. Privacy Principle

Privacy should be a core product feature.

The app should **not**:

- Read what the player types
- Store typed text
- Take screenshots
- Read document contents
- Inspect messages
- Upload detailed activity logs by default

Instead it only records anonymous behavioural statistics such as:

- Number of keystrokes
- Click count
- Mouse distance
- Active duration
- Idle duration
- Focus session length
- Window-switch frequency

Potential marketing line:

> **We count your keystrokes. We never read them.**

The system should ideally work locally.

---

## 14. MVP Scope

The first version should stay small.

### Required

- Transparent desktop companion window
- Global keyboard activity counter
- Global mouse activity counter
- Idle detector
- Focus session timer
- Basic window-switch counter
- Daily activity profile
- Modular creature generator
- Creature animations
- Daily creature completion
- Local creature collection
- Simple item system
- Daily summary card

### Optional Later

- Cloud sync
- Steam achievements
- Trading
- Friend ecosystems
- Creature visits
- More advanced procedural animation
- Workshop support
- Community cosmetic packs
- Seasonal events

---

## 15. MVP Creature Generation Example

A simple initial formula:

```text
typing intensity
    ↓
ear / arm / tool type

mouse movement
    ↓
tail / movement trait

focus duration
    ↓
body type

idle time
    ↓
dream trait

window switching
    ↓
curiosity

active time
    ↓
colour palette

rare behavioural combination
    ↓
special mutation
```

The algorithm does not need AI.

It can initially be deterministic + weighted randomness.

---

## 16. Product Philosophy

The ideal interaction ratio:

> **95% ignored, 5% irresistible.**

The game should never constantly demand attention.

The player should be able to forget it exists, then suddenly notice something strange happening in the corner of the desktop.

The emotional target:

> “Wait. What is that idiot doing now?”

That is more important than complex gameplay.

---

## 17. Core Retention Loop

```text
Use computer normally
        ↓
Behaviour changes creature
        ↓
Creature performs autonomous actions
        ↓
Player occasionally notices / interacts
        ↓
Daily creature completes
        ↓
Creature enters ecosystem
        ↓
Collection grows
        ↓
New species / mutations become possible
        ↓
Repeat
```

---

## 18. Strongest Selling Point

The game turns computer time that would normally disappear into something permanent.

Instead of recording productivity as charts or statistics:

> **Your day becomes a creature.**

After months of use, the player has a strange living archive of their computer habits.

This creates a different emotional relationship from normal productivity trackers.

---

## 19. Possible Names

Current favourite:

### Daylings

Other directions:

- Deskling
- Workling
- Idleling
- Tiny Shift
- Daily Spawn
- Deskborn
- Workborn
- Afterhours
- Desktop Ecology
- Little Hours

---

## 20. Possible Taglines

### Primary

> **You work. It grows. Every day leaves behind a creature.**

### Alternatives

> **Your workday is alive.**

> **Turn your computer habits into tiny creatures.**

> **Every day creates something different.**

> **A desktop companion shaped by the way you work.**

> **Your day happened. Now it has legs.**

---

## 21. Design Principle to Protect

Do not let the project collapse into:

```text
typing
↓
coins
↓
shop
↓
cosmetics
```

That can exist as a secondary progression system, but it should never become the main identity of the game.

The primary value is:

```text
behaviour
↓
interpretation
↓
creature
↓
memory
↓
ecosystem
```

That is the concept worth protecting.

---

## 22. Current One-Sentence Product Definition

**Daylings is a passive desktop companion game where each day of keyboard, mouse, focus and idle behaviour grows into a unique creature that permanently joins your personal desktop ecosystem.**
