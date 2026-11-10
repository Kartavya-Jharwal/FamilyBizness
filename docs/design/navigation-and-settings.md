# Navigation and Settings

The SFO purpose and display identity follow [Identity](../00%20-%20Canonical/Identity.md).

## Conventions and rationale

One navigation tree in `app-navigation.tsx` supplies the sidebar, dock, settings pages and search index. Flat visible child links make destinations discoverable. Left navigation follows dashboard and operating-system settings conventions; top tabs have been removed from Constitution, Portfolio and Settings. Real links support browser history and refresh; query parameters identify portfolio panes. Active pages expose aria-current; parents show active ancestry. Collapse names switch between Open menu and Close menu, and every rail link has its label as a tooltip.

General groups surname, profile and role because these describe office identity. Appearance groups theme and density because these affect presentation. Data groups records and recovery because these govern local information. Integrations groups planned connections because they cross system boundaries. Accessibility groups keyboard and operating-system preferences because these govern access. About is a separate destination because credits are reference content.

The fixed sidebar and bounded content column use canonical tokens. Narrow layouts present a settings list and a back link from details. Form rows put label, input and helper in order; the family surname saves immediately with a visible saved status. All five settings groups use the same immediate-apply pattern and visible status. Data import applies only a validated selected file; export and reset are explicit operations, rather than unsaved preference drafts. Theme uses the existing settings provider. Density, motion, focus and text preferences persist and apply on startup.

## Role boundaries

Managing Director and Family Patriarch see all pages. Associate cannot enter Constitution or Goals. Family Board sees Goals and the Capital overview only. Legal Counsel sees Portfolio and Scenario investment screens only. Capital overview includes consolidated liquidity; expenditure, fees, trading and statements are detail. Investment pages include allocation, stochastic lab, scenarios, FIRE and X-ray. Route guards use the same allowed-role fields as navigation; hidden legacy routes are denied to restricted roles.

Role visibility is a prototype presentation policy, not real authentication.

Navigation depth is data assigned while filtering the tree. Every row derives padding-left from its depth and the canonical indent token. Active ancestry uses the same background token as active links with emphasized weight.

Settings and About are available to Managing Director, Family Patriarch and Associate. Board and Counsel retain only the destinations specified in the brief; their profile picker remains available for switching personas.


## Navigation glyphs

Navigation destinations, dock/mobile controls, profile-menu actions and the main overview tabs use pinned `reicon@1.2.5` SVG factories via direct per-icon imports. The React adapter uses the official `toSvg()` output with inherited `currentColor`; no CDN or web-component runtime is needed. Link/button labels remain the accessible names and decorative SVGs are hidden from assistive technology. The fixed icon column keeps row alignment stable. [Reicon source](https://github.com/dqev/reicon), [upstream MIT license](https://raw.githubusercontent.com/dqev/reicon/main/LICENSE); the distribution includes that notice on About.
