# Entry and profile flow

The MVP opens profile selection and family setup inside Portfolio. The public landing and continuity narrative lead to `/portfolio/`; legacy login/splash/verification URLs redirect there so existing links still work.

A cold visitor chooses a saved browser profile, starts a blank family case, or selects a teaching case. Golden Bird is one optional constitution/case, not the platform's final family. Profile-specific setup, case management and constitution selection belong to the host application. A returning visitor resumes the selected local profile and can switch from its profile controls.

This is the completed prototype entry flow. Real authentication, MFA and shared server permissions remain outside the deliberately browser-local MVP. No fake OTP or biometric challenge is presented as authentication.

Product form and audiences: [Identity](../00%20-%20Canonical/Identity.md).
