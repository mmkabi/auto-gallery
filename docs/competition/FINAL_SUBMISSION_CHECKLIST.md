# Final Submission Checklist

## Product

- [x] Auto Gallery and Lyra branding retained.
- [x] Default render mode is Quality on every fresh load.
- [x] Onyx Black is the fixed public vehicle color.
- [x] Front and rear in-scene AG vehicle badge sprites are removed.
- [x] Auto Gallery UI branding remains present.
- [x] Guided Demo is the competition default.
- [x] Offline Assistance is labeled as rule-based, not live GPT.
- [x] Live AI is unavailable in the public build.
- [x] No browser route depends on `/api/lyra/respond` in the static build.
- [x] Exterior, driver door, cabin, steering, off-road, cargo, powertrain, finance, and lead-summary steps are included.
- [x] Pause, Resume, Exit, and Restart are implemented.
- [x] Every guided step has timeout and recovery handling.
- [x] Restart restores clean vehicle and UI state.
- [x] Financing labels are **Demonstration Only** and **Not a Financing Offer**.
- [x] Manual local lead confirmation says **Demo lead created locally**.

## Verification

- [x] Secret scan passes.
- [x] Globalization scan passes.
- [x] Unit tests pass.
- [x] Production build succeeds.
- [x] Production assets include the optimized glTF vehicle.
- [x] Static deployment fallback exists at `public/_redirects`.
- [x] External AI connectivity tests were not run for this handoff.

## Owner Actions

- [ ] Confirm source-vehicle redistribution rights.
- [ ] Replace the placeholder GitHub remote with the real repository URL if needed.
- [ ] Push the final reviewed commit to GitHub.
- [ ] Confirm the public deployment URL.
- [ ] Capture final desktop and mobile screenshots.
- [ ] Record and edit the competition video.
- [ ] Obtain the Codex Session ID from the Codex application history.
- [ ] Submit the final repository, deployment URL, screenshots, and video.
