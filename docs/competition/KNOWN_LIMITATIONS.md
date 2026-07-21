# Known Limitations

1. **Vehicle rights:** public redistribution remains blocked until the owner confirms competition-compatible licensing for the source asset.
2. **Live AI:** disabled with `ENABLE_LIVE_AI=false`. The third-party gateway did not provide sufficiently reliable response latency for the submitted experience.
3. **Offline scope:** Guided Demo is deterministic and Offline Assistance is rule-based; neither provides open-ended live-model reasoning.
4. **Vehicle identity:** the build uses the truthful label Premium SUV Concept because official configuration and trim data are not connected.
5. **Rear hatch:** the complete hatch cannot be animated reliably, so cargo inspection temporarily hides it.
6. **Powertrain:** the model contains no real engine mesh; the visualization is conceptual.
7. **Finance:** calculations are illustrative only and are not offers, approvals, or lender terms.
8. **Lead storage:** manual consented demo leads remain in browser localStorage and are not transmitted to a CRM.
9. **Deployment:** the public production URL still requires owner setup and verification. The current build is prepared for static hosting from `dist`.
10. **Media:** final competition screenshots and recorded video remain owner deliverables.

Live tool-calling was validated in isolated compatibility tests. The submitted competition build defaults to a deterministic Guided Demo because the third-party API gateway did not provide sufficiently reliable response latency.
