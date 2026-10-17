# Face-Action: Falling Bricks — Design Doc (prototype v0.1)

Second game in the Face-Action family, by Steeve J. A phone-browser PWA (single `index.html`, canvas + JS) played with facial gestures through the front camera, or with touch. Built on the first game's tech: MediaPipe Face Landmarker blendshapes (bundled in `vendor/`, CDN fallback), on-device only, calibration saved locally, debug/sensitivity panel, Web Audio synth sounds, EN/FR localization.

Live: https://haitialways-pixel.github.io/face-bricks/

## Concept
Glowing bricks fall one at a time onto a tower. Slide each brick over the stack with a **head turn**, then make **that brick's color gesture** to drop and lock it. Look: intense, high-contrast colors with glow and white outlines on the dark, gold-accented Face-Action background.

## Colors and gestures
| Brick | Gesture (face) | Touch |
|---|---|---|
| 💙 Blue `#2979ff` | Double blink (2 blinks within ~600 ms) | blue button |
| 💗 Hot pink `#ff1493` | Mouth open, held ~0.25 s | pink button |
| 💛 Yellow `#ffd600` | Smile, held ~0.3 s | yellow button |
| 💚 Green `#00e676` | Eyebrow raise, held ~0.3 s | green button |
| Move | Head turn left/right (velocity, calibrated) | ◀ ▶ buttons (hold) or swipe/drag anywhere |

Each falling brick shows its gesture icon (👀 😮 😁 🤨), and a dashed ghost outline on the stack shows where it would land: red = would miss, green = will land, gold = perfect.

## Rules
- A correct gesture drops the brick fast. If it overlaps the stack top by ≥ 40 %, it locks: **10 points** (× combo).
- **Lose a heart** for a wrong gesture (the brick cracks), a dropped brick that misses the stack, or a brick that reaches the stack with no gesture ("Too slow!", it slides off and hits the ground). **5 hearts**; game over at 0.
- Single natural blinks are ignored (only double blinks count). Cheek puff on a normal brick is ignored.
- **Every 10 rows** the stack sinks into the ground (crunch sound, dust, screen shake) leaving the top brick as the new base, and the level goes up.
- **Difficulty curve:** fall time starts at a generous 7.5 s (+15 % in face mode), drops 10 % per sink, floor 3 s. The first 6 bricks are never special.
- In face mode a 15 s face-rest break is offered every 3 sinks (skippable, camera off).

## Gratification and hooks
- **Combo multiplier:** every 3 consecutive locks raises it, ×2 → ×5. Each lock plays the next note of a rising pentatonic scale, and the combo-up has a chord sting. A heart loss resets it.
- **Perfect alignment** (within 8 % of brick width): snaps exactly, **+5**, white sparkles and a chime.
- **Color burst:** 3 of the same color in a row on top burst for **+50** and **3 s slow-mo** (rainbow counts as wild).
- **Special bricks** (after brick 6, about 6 % / 6 % / 4 %):
  - 🌈 **Rainbow:** any color gesture locks it.
  - 💣 **Bomb:** puff your cheeks (touch: tap the bomb) to defuse, **+1 heart** (max 5). Any other gesture, or letting it land, makes it explode (−1 heart).
  - ⭐ **Golden:** shows its color; the right gesture locks it for **100 points** (× combo).
- **Next brick preview** in the HUD.
- **Near-miss game over:** "So close! Only N points from your best!" (shown when within 25 % / 60 pts), plus a big **Play again** button.
- **Daily challenge:** a 📅 toggle on the start screen. The brick sequence (colors, specials, spawn offsets) comes from an RNG seeded by the local date, so everyone gets the same bricks that day, which is good for the WhatsApp contest. The daily best is saved per day and mode, and the game-over screen shows the date.
- **Unlockable brick styles**, saved locally, unlocked by your best score ever: Classic (0), Neon (250), Candy (600), Gems (1200). The unlock is announced mid-game, and you pick a style from 🎨 Styles.
- **Separate best scores** for Face and Touch modes (`fb_best_face`, `fb_best_touch`).

## Gesture detection
- Blendshapes are compared against a **calibrated neutral baseline** (capped at 0.5) and normalised: `act = (score − base) / (1 − base)`.
- Calibration has 7 steps of 3 s each with a countdown and beeps: relax (baseline + head yaw), turn head left (direction + range), blink, mouth open, smile, eyebrow raise, cheek puff. Each step measures the player's own peak and sets a **per-gesture threshold** (~55 % of peak, clamped to 60–180 % of the default). It's saved once (`fb_cal_v1`), and there's a 🎯 Recalibrate button on the start screen and in the 🐞 panel.
- **Hold times** prevent false triggers. **One gesture at a time:** while a gesture is active (with hysteresis, released below 70 % of its threshold), the others are ignored. Blinks are ignored during smiles (eye squint). There's a 0.5 s lockout after each gesture, and gestures in the first 0.35 s of a brick are ignored.
- The brick holds still while a gesture is being held, so face movement during a gesture doesn't knock it off alignment.
- A **small on-screen indicator** under the ground shows the detected gesture, its hold progress, "blink 1/2", and a ✓ when it fires.
- 🐞 debug panel: live bars for blink, mouth, smile, brow, puff, and move with threshold markers; FPS; model status; and a sensitivity slider.

## Privacy and camera
The camera runs only while actively playing in face mode. It stops on pause, rest, game over, menu, hidden tab, or page hide. There's a red "camera on" badge and a small mirrored preview you can hide (👁). Video is processed on-device and is never recorded or uploaded. No data is collected. Settings live in localStorage under `fb_*` keys; the language choice `fa_lang` is shared with Face-Action. See `privacy.html` (EN + FR).

## Start screen (kept uncluttered)
Title, a one-line pitch, a big **Play with Face** button, **Play with Touch**, and one row of small chips (📅 Daily, 🎨 Styles, ❓ How to Play, 🎯 Recalibrate). Below that: the two best scores, privacy · 🌐 language, and © 2026 Steeve J.

## Not yet
Android/Play build, online leaderboard (Play Games Services), more special bricks (ice, chain), haptics tuning, and per-gesture sensitivity sliders.
