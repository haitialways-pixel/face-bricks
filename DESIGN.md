# Face-Action: Falling Bricks — Design Doc (prototype v0.2)

Second game in the Face-Action family, by Steeve J. A phone-browser PWA (single `index.html`, canvas + JS) played with facial gestures through the front camera, or with touch. Built on the first game's tech: MediaPipe Face Landmarker blendshapes (bundled in `vendor/`, CDN fallback), on-device only, calibration saved locally, debug/sensitivity panel, Web Audio synth sounds, EN/FR localization.

Live: https://haitialways-pixel.github.io/face-bricks/

## Concept
Four glowing color stacks stand side by side at the bottom, one each for blue, hot pink, yellow and green. Each is labeled with its color, gesture and fill count (n/10). Bricks fall one at a time down the middle toward a red dashed line above the stacks. Make **the brick's color gesture** and it flies in an arc onto **its own color's stack** (whoosh, then a rising lock note and a squash). No head movement is needed. Look: intense, high-contrast colors with glow and white outlines, a tinted lane per color, and the dark, gold-accented Face-Action background.

*v0.2 change (Steeve's feedback):* there's no longer a single shared stack, and head-turn placement and the overlap/perfect-alignment rule are removed.

## Colors and gestures
| Brick / stack | Gesture (face) | Touch |
|---|---|---|
| 💙 Blue `#2979ff` | Double blink (2 blinks within ~600 ms) | 👀 blue button under the blue stack |
| 💗 Hot pink `#ff1493` | Mouth open, held ~0.25 s | 😮 pink button under the pink stack |
| 💛 Yellow `#ffd600` | Smile, held ~0.3 s | 😁 yellow button under the yellow stack |
| 💚 Green `#00e676` | Eyebrow raise, held ~0.3 s | 🤨 green button under the green stack |

Each falling brick shows its gesture icon. The touch buttons sit in a 4-column grid aligned exactly under their stacks.

## Rules
- Correct gesture: the brick flies to its stack. **10 points** × combo.
- **Quick bonus +5:** identify the brick in the top third of its fall. A faint gold ring around the brick shows the bonus window.
- **Lose a heart** for a wrong gesture (the brick cracks and shatters) or a brick reaching the red line unidentified ("Too slow!"). **5 hearts**; game over at 0. Single natural blinks are ignored, and cheek puff on a normal brick is ignored.
- **Each stack sinks on its own** when it reaches 10 bricks: crunch sound, dust, screen shake, **+20**, and the level goes up.
- **Difficulty curve:** fall time starts at a generous 6.5 s (+15 % in face mode) and gets 8 % shorter per sink, with a 2.5 s floor. The first 6 bricks are never special.
- In face mode a 15 s face-rest break is offered every 3 sinks (skippable, camera off).

## Gratification and hooks
- **Combo multiplier:** every 3 correct bricks in a row raises it, ×2 → ×5, with a rising pentatonic note per lock and a chord sting at each combo-up. A heart loss resets it.
- **Color chain:** 3 correct bricks of the same color in a row burst for **+50** and **3 s slow-mo**. Rainbow counts as wild. The HUD shows ●●○ progress in the chain color.
- **Special bricks** (after brick 6, about 6 % / 6 % / 4 %):
  - 🌈 **Rainbow:** any color gesture works, and it goes to the **shortest stack**.
  - 💣 **Bomb:** puff your cheeks (touch: tap the bomb) to defuse, **+1 heart** (max 5). Any other gesture, or letting it reach the line, makes it explode (−1 heart).
  - ⭐ **Golden:** shows its color; the right gesture sends it to that color's stack for **100 points** (× combo).
- **Next brick preview** in the HUD.
- **Near-miss game over:** "So close! Only N points from your best!" (shown when within 25 % / 60 pts), plus a big **Play again** button.
- **Daily challenge** (📅 toggle): the brick sequence comes from an RNG seeded by the local date, so everyone gets the same bricks that day. The daily best is saved per day and mode.
- **Unlockable brick styles**, saved locally, unlocked by your best score ever: Classic (0), Neon (250), Candy (600), Gems (1200). Pick one from 🎨 Styles.
- **Separate best scores** for Face and Touch modes.

## Gesture detection
- Blendshapes are compared against a **calibrated neutral baseline** (capped at 0.5) and normalised: `act = (score − base) / (1 − base)`.
- Calibration has 6 steps of 3 s each with a countdown and beeps: relax (baseline), blink, mouth open, smile, eyebrow raise, cheek puff. The head-turn step was removed in v0.2. Each step measures the player's own peak and sets a **per-gesture threshold** (~55 % of peak, clamped to 60–180 % of the default). It's saved once (`fb_cal_v2`), and there's a 🎯 Recalibrate button on the start screen and in the 🐞 panel.
- **Hold times** prevent false triggers. **One gesture at a time:** while a gesture is active (with hysteresis, released below 70 % of its threshold), the others are ignored. Blinks are ignored during smiles (eye squint). There's a 0.5 s lockout after each gesture, and gestures in the first 0.35 s of a brick are ignored.
- A **small on-screen indicator** in the ground strip shows the detected gesture, its hold progress, "blink 1/2", and a ✓ when it fires.
- 🐞 debug panel: live bars for blink, mouth, smile, brow and puff with threshold markers; FPS; model status; and a sensitivity slider.

## Privacy and camera
The camera runs only while actively playing in face mode. It stops on pause, rest, game over, menu, hidden tab, or page hide. There's a red "camera on" badge and a small mirrored preview you can hide (👁). Video is processed on-device and is never recorded or uploaded. No data is collected. Settings live in localStorage under `fb_*` keys; the language choice `fa_lang` is shared with Face-Action. See `privacy.html` (EN + FR).

## Start screen (kept uncluttered)
Title, a one-line pitch, a big **Play with Face** button, **Play with Touch**, and one row of small chips (📅 Daily, 🎨 Styles, ❓ How to Play, 🎯 Recalibrate). Below that: the two best scores, privacy · 🌐 language, and © 2026 Steeve J.

## Not yet
Android/Play build, online leaderboard (Play Games Services), more special bricks (ice, chain), haptics tuning, and per-gesture sensitivity sliders.
