# Owner Handoff

The engineering release is complete. The following actions require the account or legal owner and cannot be performed or asserted by the build agent.

## Before Public Submission

1. Revoke any API key previously shared in conversation. It must not be reused.
2. Keep live AI disabled for the public competition build unless a production provider is separately approved and tested after submission.
3. Provide purchase and license evidence for CGTrader listing ID `6815063`, seller `hkv-studios`, including the invoice and license terms effective on the purchase date.
4. Confirm with the marketplace or legal reviewer that the optimized web delivery is an allowed Incorporated Product for the intended competition publication.
5. Replace the placeholder Git remote with the real repository URL if needed.
6. Deploy the static `dist` folder through an owner-controlled host such as Cloudflare Pages.
7. Verify the public URL, direct refresh behavior, model transfer, Guided Demo, Offline Assistance, and browser console output.
8. Record the competition video and capture current desktop and mobile screenshots from the public deployment.
9. Add private contact details only in the competition form.

## Release Artifact

Run `npm run build` to rebuild the static `dist` package. The repository excludes credentials, local environment files, raw source models, backups, dependency installations, and model-pipeline intermediates through `.gitignore`.

## Submission Gate

Do not publicly upload the vehicle payload until asset rights are documented. Do not describe Guided Demo or Offline Assistance as live GPT output. Do not describe demonstration financing as an offer, the browser-local record as a production CRM, or the conceptual powertrain as an engineering model.
