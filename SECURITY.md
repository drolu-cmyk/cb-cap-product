# Security

CB-CAP v1 holds **no PHI and no resident records**. Report suspected exposure of credentials, unexpected personal data, or a path that could accept individual health information.

## Report

Open a private advisory on this repository or email the Tech Inc. operator named on sozorock.com. Do not file PHI in a public issue.

## Rules for this codebase

- Do not add patient, member, or claims identifiers.
- Do not log request bodies that could contain personal data.
- Secrets stay out of the client bundle and out of this repo.
- Institutional auth, when added, is an activation-gated increment. Names of vendors do not appear in the primary UI.
