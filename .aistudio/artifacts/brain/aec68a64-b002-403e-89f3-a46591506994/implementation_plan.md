# A Warm Blooming Check-in for Pumpkin

A warm-toned floral interactive keepsake website crafted with golden-peach and rosy flower gradients (sunflowers, tulips, carnations) designed by Fred as an affectionate, thoughtful check-in experience for Pumpkin.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were skipped, so the following recommended design defaults have been established. All elements can also be customized directly in the app.

- **Name Lock Verification**: Case-insensitive password check strictly accepting `"pumpkin"` (e.g., `pumpkin`, `PUMPKIN`, `Pumpkin`). Gentle, playful feedback is shown for incorrect attempts without locking her out.
- **Floral Theme & Atmosphere**: A warm golden-amber to rose-petal gradient background sprinkled with animated drifting petals and illustrated botanical elements (sunflowers, tulips, and carnations).
- **11th Secret Cookie & Song**: Features a music card and synth audio melody preview for *"Golden Hour"* (with a customize button to input any personal song title, artist, or YouTube/Spotify link).
- **Jigsaw Puzzle Engine**: Built-in sunflower & floral keepsake photo with an instant **"Upload / Change Photo"** button so any personal memory photo can be loaded. Includes 3x3 (casual 9 pieces) and 4x4 modes with snap-to-grid piece placement, hint outline toggle, and preview thumbnail.
- **Check-in Response Memory**: Responses to the 3 questions (Scale 1–10 + comments) are preserved in local storage and offer a one-click *"Save / Copy Summary Note"* so she can easily send her answers back to Fred.

---

### 1. Overview & Core Concept

- **What It Does**: A multi-step interactive journey built with warmth, emotional care, and gentle whimsy.
  1. **Gatekeeper (Part 1)**: Welcomes the visitor with blooming florals and a secret name prompt requiring `"pumpkin"` to unlock.
  2. **Heartfelt Introduction (Part 2)**: A warm letter explaining that Fred created this mini website to check in, acknowledging that they haven't spoken in a long time and reassuring her with comforting, gentle words.
  3. **Personal Check-in (Part 3)**: Three warm interactive 1–10 sliders with emotional descriptive labels and expandable comment boxes:
     - *How she has been so far*
     - *How her academics/studies are going*
     - *How excited she is for Christmas*
  4. **The 10 Fortune Cookies (Part 4)**: A bakery of 10 hand-drawn fortune cookies with distinct cute motifs:
     - 🍓 Strawberries
     - 🐔 Chicken
     - 🎃 Pumpkin
     - 🥥 Coconut
     - 🍉 Watermelon
     - 🎀 Pink Bow
     - 💉 Syringe
     - 🌷 Tulip
     - 🌻 Sunflower
     - 🌸 Carnation
     Each cookie can be cracked open with an animated break sequence and audio chime, revealing caring, motivational, or scripture quotes (with customizable text editor).
  5. **The Secret 11th Song Cookie**: Automatically revealed after cracking all 10 cookies, decorated with music notes. It breaks open to reveal the special song Fred has been thinking about every night with a lyric card and audio melody.
  6. **Interactive Jigsaw Puzzle & Final Message (Part 5)**: A playable jigsaw puzzle of a warm floral keepsake image (with photo upload option). Solving it unlocks a celebration of confetti and Fred's heartfelt customizable closing message.

---

### 2. User Experience & Visual Design

#### Visual Identity & Theme
- **Dominant Atmosphere (60%)**: Warm sunlit meadow gradient from soft apricot (`#FFF7ED`) through warm peach (`#FFEDD5`) to sunset rose (`#FFE4E6`), with subtle drifting floral petals.
- **Structural Surfaces (30%)**: Cream-tinted cards (`#FFFFFA`), translucent glass-morphism panels with warm amber hairline borders (`border-amber-200/60`), and dark warm espresso typography (`#451A03`).
- **Accent Budget (10%)**: Golden sunflower yellow (`#F59E0B`), coral tulip crimson (`#E11D48`), and soft carnation pink (`#F43F5E`).
- **Typography**:
  - *Display / Titles*: `Fraunces` or `Playfair Display` serif style for warm, intimate, poetic feelings.
  - *Body / Controls*: Clean, highly readable sans-serif (`Plus Jakarta Sans` or modern system sans) with generous line heights.
  - *Zero-Pill Discipline*: Unboxed text metadata separated by subtle dots (`·`) instead of generic colored pill badges.

#### Key Interactive Flows
```
┌─────────────────┐       Pass "pumpkin"      ┌──────────────────────┐
│  Part 1: Entry  │ ────────────────────────> │ Part 2: Introduction │
│  Name Gatekeeper│                           │ Heartfelt Note       │
└─────────────────┘                           └──────────┬───────────┘
                                                         │ Continue
                                                         ▼
┌─────────────────────────┐   All 10 Cracked  ┌──────────────────────┐
│ Part 4: Fortune Cookies │ <──────────────── │  Part 3: 3 Check-in  │
│ 10 Cookies + 11th Song  │   Move to Part 4  │  Questions (1-10)    │
└────────────┬────────────┘                   └──────────────────────┘
             │ Complete Song
             ▼
┌─────────────────────────────────┐
│ Part 5: Jigsaw Puzzle & Message │
│ Solve Puzzle -> Final Heart Note│
└─────────────────────────────────┘
```

---

### 3. Key Product Decisions & Trade-Offs

- **Single-Page Step Journey vs. Jump Navigation**:
  - *Chosen Approach*: A progressive sequence with a discrete top floral progress bar that allows Pumpkin to step through naturally while also being able to revisit previous sections anytime once unlocked.
  - *Why*: Gives a narrative, storybook feel while preventing frustration if she wants to re-read a quote or adjust an answer.
- **Fortune Cookie Cracking Animation**:
  - *Chosen Approach*: Multi-stage CSS/SVG transition (wobble -> fracture into left/right halves -> paper slip sliding out) paired with Web Audio API synthesized soft crunchy chimes.
  - *Why*: Zero external asset dependencies, instant load time, high tactile delight on both mobile and desktop.
- **Jigsaw Puzzle Engine**:
  - *Chosen Approach*: HTML5 Canvas slice & DOM snap-grid puzzle supporting touch and mouse drag-and-drop or click-to-swap, with a "Show Reference", "Solve Hint", and "Change Photo" button.
  - *Why*: Works smoothly in mobile web views without canvas coordinate clipping bugs, while remaining accessible and fun.
- **Customizable Quotes & Messages**:
  - *Chosen Approach*: Pre-loaded with warm, poetic, motivational, caring, and uplifting quotes matching each drawing, plus an edit modal allowing Fred to adjust any quote or the final letter on the fly.
  - *Why*: Ready to share out of the box with thoughtful defaults while allowing 100% personalization.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                               App State                                │
│  - currentStep: 1 | 2 | 3 | 4 | 5                                      │
│  - unlockedSteps: Set<number>                                          │
│  - checkinAnswers: { mood: number, moodNote, academics, acadNote, ...} │
│  - crackedCookies: Set<string> (tracks 10 icons cracked)               │
│  - bonusUnlocked: boolean                                              │
│  - puzzleSolved: boolean                                               │
│  - customLetter / customQuotes: LocalStorage cache                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼──────────────────────────────┐
    ▼                               ▼                              ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ FloralBackground        │  │ SoundFX Engine          │  │ Confetti & Petals       │
│ Sunflowers, Tulips,     │  │ Web Audio oscillator    │  │ Canvas particle system   │
│ Carnations drifting     │  │ chime & gentle crack    │  │ for win celebration      │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

- **Audio Engine**: Lightweight procedural Web Audio API oscillator synthesis (gentle marimba chime on crack, soft harmonic tone on puzzle completion, music player mockup for the 11th song).
- **Build Verification**: TypeScript compilation and lint verification before presentation.
