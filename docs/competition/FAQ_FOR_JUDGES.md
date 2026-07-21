# FAQ for Judges

## Is Lyra using a live language model in the submitted build?

No. Guided Demo is deterministic and Offline Assistance uses rule-based intent matching with prepared, truthful responses. Neither is described as a live GPT response.

## How were Codex and GPT-5.6 used?

Auto Gallery was designed and engineered with Codex powered by GPT-5.6. GPT-5.6 supported the development of the 3D interaction architecture, guided vehicle journey, scene-action tools, performance pipeline, testing strategy, and competition release. The submitted public build defaults to a deterministic Guided Demo for reliable judging.

## Why is Live AI unavailable?

Live tool-calling was validated in isolated compatibility tests. The public competition build uses a deterministic Guided Demo because the tested third-party gateway did not provide sufficiently reliable production latency.

## What does the Guided Demo prove?

It proves the complete customer journey can run reliably: exterior reveal, driver door, cabin, steering, off-road visualization, cargo, conceptual powertrain, illustrative finance, and a local-only lead summary. Each step has timeout recovery and Pause, Resume, Exit, and Restart controls.

## Is paint customization included?

No. The public competition build uses a fixed Onyx Black vehicle presentation. Public paint controls were removed for reliability and visual consistency.

## Is the financing real?

No. It is labeled **Demonstration Only** and **Not a Financing Offer**. Values are illustrative and are not approval, lender terms, or live pricing.

## Is the CRM real?

No. The guided journey creates only a summary. The manual form requires consent and stores a minimal record locally in the browser with the message **Demo lead created locally**.

## Is the engine model real?

No. The source vehicle has no real engine mesh. The powertrain view is explicitly conceptual.

## Why does the cargo hatch disappear?

The asset does not support a reliable complete rear-hatch pivot. Hiding the hatch during cargo inspection is more truthful than presenting a broken animation.

## What remains for production?

A licensed vehicle asset, verified trim and inventory content, an approved low-latency AI provider if live AI is desired, authenticated CRM and consent infrastructure, lender-approved finance services, analytics, and public deployment validation.
