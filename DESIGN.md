# Face-Action: Falling Bricks — Design Doc (prototype v0.5)

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
- Correct gesture: the brick flies to its stack and scores its **current value × combo**.
- **Decaying value (v0.4, replaces the flat 10 pts and the quick +5):** each brick is worth `round(20 × (1 − progress))`, where progress goes from 0 at spawn to 1 at the red line (whole numbers, min 0). A live value badge next to the falling brick counts down and shifts gold → white → grey, with a thin drain bar under the brick (and ×N beside it when a combo is active). The popup shows what you earned, e.g. `+17` or `+34 x2`. Catching a brick at 18+ (golden 90+) adds a sparkle.
- **Lose a heart** for a wrong gesture (the brick cracks and shatters) or a brick reaching the red line unidentified ("Too slow!"). **5 hearts**; game over at 0. Single natural blinks are ignored, and cheek puff on a normal brick is ignored.
- **Each stack sinks on its own** when it reaches 10 bricks: crunch sound, dust, screen shake, **+20**, and the level goes up.
- **Difficulty curve:** fall time starts at a generous 6.5 s (+15 % in face mode) and gets 8 % shorter per sink, with a 2.5 s floor. The first 6 bricks are never special.
- In face mode a 15 s face-rest break is offered every 3 sinks (skippable, camera off).

## Gratification and hooks
- **Combo multiplier:** every 3 correct bricks in a row raises it, ×2 → ×5, with a rising pentatonic note per lock and a chord sting at each combo-up. A heart loss resets it.
- **Color chain:** 3 correct bricks of the same color in a row burst for **+50** and **3 s slow-mo**. Rainbow counts as wild. The HUD shows ●●○ progress in the chain color.
- **Special bricks** (after brick 6, about 6 % / 6 % / 4 %):
  - 🌈 **Rainbow:** any color gesture works, and it goes to the **shortest stack**. Same 20 → 0 value.
  - 💣 **Bomb:** defuse it for **+1 heart** (max 5). Face mode: **shake/turn your head** clearly left or right (primary), or **puff your cheeks / push your lips out** (backup). Touch mode: tap the bomb itself (bomb + ~40 px hit area). Since v0.4 there's no Defuse button or hint banner in touch mode. **Color gestures on a bomb are ignored (no penalty)**, so a stray smile or blink can't cost a heart. The only way to lose a heart to a bomb is letting it reach the red line (it explodes).
  - ⭐ **Golden:** shows its color; the right gesture sends it to that color's stack. Its value starts at **100** and decays the same way to 0 (× combo), so a quick catch is a big reward.
- **Next brick preview** in the HUD.
- **Near-miss game over:** "So close! Only N points from your best!" (shown when within 25 % / 60 pts), plus a big **Play again** button.
- **Daily challenge** (📅 toggle): the brick sequence comes from an RNG seeded by the local date, so everyone gets the same bricks that day. The daily best is saved per day and mode.
- Bonuses unchanged: color chain +50, stack sink +20.
- **Unlockable brick styles**, saved locally, unlocked by your best score ever: Classic (0), Neon (250), Candy (600), Gems (1200). These milestones are unchanged in v0.4: an average catch at about 25–35 % of the fall pays about 13–15 per brick, close to the old 10 (+5 quick). Pick one from 🎨 Styles.
- **Separate best scores** for Face and Touch modes.

### Celebration moments (v0.5)
- **Hype banners at combo milestones:** ×2 "NICE!", ×3 "ON FIRE! 🔥", ×4 "UNSTOPPABLE!", ×5 "LEGENDARY!" (FR: BIEN JOUÉ ! / EN FEU ! 🔥 / IMPARABLE ! / LÉGENDAIRE !). Each one is a big pop-in banner (~0.9 s) with a colored screen flash and a rising sound sting. It sits **below the red line over the stacks**, so it never covers the falling brick or its value badge. Banners are throttled (at most one per 1.1 s; the record banner overrides).
- **PERFECT!** (PARFAIT !) pops over the stack when a brick is caught at full value (20, golden 100). Its flash and sound are throttled to once per second.
- **Stack sink celebration:** confetti in the stack's color, 12 coins flying into the score (score pulses), a triumphant chord, "+20" and "STACK CLEARED!" (PILE COMPLÈTE !) over the column, and a light screen shake.
- **Personal-best moment:** the first time in a run the score passes the stored best for the current mode (only if that best is > 0), falling **freezes for ~1 s** (the brick's value timer freezes too, so it isn't unfair), with fireworks, a gold flash and border, the "NEW RECORD!" (NOUVEAU RECORD !) banner, and a fanfare.
- **Share card:** on game over with a new record, a 1080×1350 card is drawn on a canvas (game name, record, score, mode, level, bricks, local date, haitialways-pixel.github.io/face-bricks). "📤 Share my record" uses the phone's share sheet (navigator.share with the image) or falls back to downloading `face-bricks-record.png`. Everything is generated on the device; nothing is uploaded.
- All sounds respect mute/volume. Particles are capped at 260 for phone performance.

## Gesture detection
- Blendshapes are compared against a **calibrated neutral baseline** (capped at 0.5) and normalised: `act = (score − base) / (1 − base)`.
- Calibration has 7 steps of 3 s each with a countdown and beeps: relax (baseline), **turn head left and right** (measures your yaw range for the bomb shake; restored in v0.3), blink, mouth open, smile, eyebrow raise, cheek puff. Each step measures the player's own peak and sets a **per-gesture threshold** (~55 % of peak, clamped to 60–180 % of the default; puff uses ~40 % of peak, clamped to 50–130 %, so it's easier). The saved format stays `fb_cal_v2`: the new `yawR` field is optional, and older calibrations fall back to a default 0.2 rad shake threshold plus the new lower puff default, so nobody is forced to recalibrate.
- **Bomb defuse detector (v0.3)** is separate from the color-gesture engine and is not blocked by the one-gesture-at-a-time lock, so a held smile doesn't prevent defusing. It's active only while a bomb is falling.
  - Shake: |yaw − reference| > threshold, held about 0.12 s. The threshold is 50 % of the calibrated turn range, kept between 0.1 and 0.3 rad. The reference yaw slowly follows the player's resting head angle (2.5 s time constant) while no bomb is falling.
  - Puff: max(cheekPuff, 0.8 × max(mouthPucker, mouthFunnel) when the jaw is closed) above a lowered threshold (default 0.14), held about 0.2 s.
  - In face mode the bomb shows a red hint pill ("Shake head / puff cheeks!" / "Secouez la tête / gonflez les joues !") and a green progress ring that fills while the defuse gesture is held. Touch mode shows no banner.
- Bomb taps map pointer coordinates through the canvas' real CSS box (`getBoundingClientRect`), so they're correct regardless of devicePixelRatio or the 100dvh vs innerHeight difference on phones.
- **Hold times** prevent false triggers. **One gesture at a time:** while a gesture is active (with hysteresis, released below 70 % of its threshold), the others are ignored. Blinks are ignored during smiles (eye squint). There's a 0.5 s lockout after each gesture, and gestures in the first 0.35 s of a brick are ignored.
- A **small on-screen indicator** in the ground strip shows the detected gesture, its hold progress, "blink 1/2", and a ✓ when it fires.
- 🐞 debug panel: live bars for blink, mouth, smile, brow, puff and head shake with threshold markers; FPS; model status; and a sensitivity slider.

## Privacy and camera
The camera runs only while actively playing in face mode. It stops on pause, rest, game over, menu, hidden tab, or page hide. There's a red "camera on" badge and a small mirrored preview you can hide (👁). Video is processed on-device and is never recorded or uploaded. No data is collected. Settings live in localStorage under `fb_*` keys; the language choice `fa_lang` is shared with Face-Action. See `privacy.html` (EN + FR).

## Start screen (kept uncluttered)
Title, a one-line pitch, a big **Play with Face** button, **Play with Touch**, and one row of small chips (📅 Daily, 🎨 Styles, ❓ How to Play, 🎯 Recalibrate). Below that: the two best scores, privacy · 🌐 language, and © 2026 Steeve J.

## Not yet
Android/Play build, online leaderboard (Play Games Services), more special bricks (ice, chain), haptics tuning, and per-gesture sensitivity sliders.
