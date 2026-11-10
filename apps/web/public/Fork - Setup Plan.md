# FamilyBizness — Setup Plan For A New Family Office

You are my coding agent. Your job is to take the open-source FamilyBizness proof of concept and turn it into a private, working family office platform for my own family. Follow this plan in order. Work in small, reviewable steps, and stop to ask me whenever a decision is genuinely mine to make. Do not rebuild the product from scratch. The proof of concept already contains the structure, the design system and the screens; your work is to fork it, make it ours, and connect it to real information carefully.

## 1. Who I am and what this is for

FamilyBizness is a wealth platform for a single-family office. It covers two things at once: the family's estate, meaning what we own, how it is held and how it passes between generations; and the financial affairs of the family business, meaning its accounts, cash, governance and plans. The people who will use it are the head of the family, the family board, and the chief executives or managing directors of the family business. Treat them as busy, senior and non-technical. Every screen must be readable at a glance, and nothing may look like a trading terminal.

The public demo uses a hypothetical family called the Smiths. Everything about the Smiths is invented. Before you replace it, read the canonical identity file at `docs/00 - Canonical/Identity.md` and the Smith family constitution at `docs/00 - Canonical/Smith Family - Constitution.md`, so you understand the shape of what we are replacing.

## 2. Ground rules for the whole engagement

1. Privacy first. My family's data never goes into a public repository, an issue, a pull request description, a commit message, a screenshot you share, or a prompt sent to any third-party service unless I approve that specific flow.
2. Keep the fork private. Create it under my own account and set its visibility to private before you add anything about my family.
3. Keep secrets out of Git. API keys, tokens and passwords live in a local environment file that is listed in `.gitignore`, or in my operating system's secret store. Never print a secret in full in a terminal log or a chat reply.
4. Respect the house rules already in the repository. Read `AGENTS.md`, `CLAUDE.md` and `.cursor/rules/` first and follow them. In particular:
   - design tokens live only in `packages/tokens/tokens.css`;
   - every fact has one canonical home under `docs/00 - Canonical/`, and everything else links to it;
   - folders are numbered and named by function;
   - file names use the pattern `Subject - Description.ext` in Title Case, with no version numbers.
5. Do not invent financial, legal or tax facts. When something needs a qualified adviser (estate structuring under English law, trusts, tax residence, regulated investment advice), say so plainly and leave a clearly marked placeholder rather than a guess.
6. Unreadable text and overlapping chart labels are release blockers. Render every changed screen, look at it at desktop width (1440 pixels) and phone width (390 pixels), and fix problems before you call a step done.
7. Prefer adapting what exists over writing new systems. Do not build full authentication, a portfolio engine or a financial model unless I ask for one in writing during this engagement.

## 3. Phase one — Fork and run it unchanged

Goal: a private copy that builds and runs on my own machine exactly like the public demo.

1. Fork `https://github.com/Kartavya-Jharwal/FamilyBizness` into my account, then make the fork private. If private forks are not allowed, create a new private repository and push a clone of the original into it, keeping the full history and the licence files.
2. Clone it to my machine. Install Bun if it is missing, using the official installer for my operating system.
3. From the repository root run `bun install`, then `bun run build`, then `bun run preview`. Open the printed address and confirm:
   - the landing page loads;
   - the welcome question appears once;
   - the login, splash and verification stubs work;
   - the portfolio workspace opens.
4. Read these documents and summarise them back to me in plain English, in under 300 words:
   - `docs/03 - Architecture/Architecture.md`;
   - `docs/03 - Architecture/Trace.md`;
   - `docs/04 - Design/Design.md`;
   - the requirements folder.
5. Record what you did in a new note at `docs/01 - Notes/Fork - Setup Log.md`, with the date, the commit you started from, and anything that failed.

Stop here and show me the running demo before going further.

## 4. Phase two — Make it ours

Goal: the demo now describes my family instead of the Smiths, still using only invented or approved figures.

1. Ask me for:
   - our family surname;
   - the names and roles of the people who will use the platform (head of family, board members, business leaders, advisers);
   - the name and sector of the family business;
   - the countries where we hold assets.
   Ask for nothing more sensitive than that yet.
2. Create our own canonical files under `docs/00 - Canonical/`:
   - an identity file for our family office;
   - a draft family constitution that follows the structure of the Smith constitution: purpose, values, governance, the family board, the investment policy summary, succession, conflicts of interest and amendment.
   Mark every clause as a draft for family discussion. Do not copy the Smith clauses as if they were ours.
3. Repoint links that should now reference our canonical files. Keep the Smith files in the repository as the reference example, and clearly label them as the public demo family.
4. Update the prepared demo records in the portfolio app so the default family is ours:
   - the family name;
   - the roles;
   - the meeting calendar;
   - the goals;
   - the charter articles.
   Use placeholder amounts until Phase four. Keep the visitor-role profiles, but rename them to our real roles.
5. Change the landing copy:
   - hero line;
   - story section;
   - team or credits;
   - footer.
   Keep the open-source credit to the original authors (Kartavya Jharwal, Abdul Rafay Malik, Dalet Sandoval, Michael Stone and Sonia Vasnani) and the licences of every bundled project.
6. If we have brand colours or typefaces, change them only in `packages/tokens/tokens.css`. Check text contrast against the WCAG AA standard (4.5 to 1 for body text) on both light and dark surfaces, and on every chart.
7. Rebuild, then check every changed screen at both widths.

Stop and show me screenshots of the landing page, the Stewardship overview, the family charter and Settings.

## 5. Phase three — Decide where it runs

Goal: a hosting choice that matches how private we want this to be. Present these options to me with their trade-offs and let me choose:

1. **Local only.** It runs on one family computer with `bun run preview`. Data stays in that browser's local storage. This is simplest and most private, but there is no sharing and data is lost if the browser storage is cleared.
2. **Home or office server.** It runs on a small always-on machine on our own network: a mini PC, a network storage box or a spare laptop, reachable only inside our network or through a private VPN such as Tailscale or WireGuard. There is no public address.
3. **Private cloud host.** A static host or virtual machine with access controls in front of it, such as Cloudflare Access or an identity-aware proxy. This is convenient for travel, but it needs care with keys and audit logs.
4. **GitHub Pages.** Use this only for the public, invented demo. Never use it with real family data, because Pages sites are public.

Whatever I choose, write the decision and the reasons in `docs/03 - Architecture/Decision - Hosting.md`. Write the step-by-step runbook for starting, stopping, updating and backing up in `docs/06 - Operating Model/Runbook - Family Office Host.md`.

## 6. Phase four — Connect real information, one source at a time

Goal: replace placeholder figures with real ones, behind the integration previews that already exist in Settings, without leaking anything.

Work through sources in this order, finishing each before you start the next. For each one:
- ask me which provider we use;
- read that provider's official API documentation;
- confirm the least-privilege, read-only scope;
- then build.

1. **Accounting for the family business.** Examples are Xero, QuickBooks and Sage. Read-only access to the trial balance, profit and loss, balance sheet and cash flow. Map them onto the existing financial-sheets screens.
2. **Bank and cash.** Use open banking through a regulated aggregator in our region (for example TrueLayer, Plaid or GoCardless Bank Account Data). Read-only balances and transactions. Map them onto Stewardship spending and liquidity.
3. **Brokerage and custody.** Read-only holdings and transactions from our broker or custodian, or a regular statement file export if there is no API. Map them onto allocations and holdings.
4. **Market data.** A licensed price source for the holdings we actually own. Respect its rate limits and terms, and cache responses locally.
5. **Property and private assets.** Usually there is no API. Build a simple, validated manual-entry form or a spreadsheet import, with the valuation date and source recorded beside each figure.
6. **Documents.** Wills, trust deeds, shareholder agreements, minutes. Store the files where I decide, either an encrypted local folder or our existing document vault. The platform holds only titles, dates and links, never copies.

Rules for every connection:
- Keys go in the local environment file or the secret store, read at run time, never bundled into the static site.
- If a call needs a secret, put a small local proxy or server function between the browser and the provider, so the browser never holds the key.
- Show the source and the "as of" time beside every real figure.
- Fail visibly. If a feed is down, show the last good value with its date and a clear notice; never show a silent zero.
- Add a one-click disconnect in Settings that also deletes cached data from that source.
- Write each integration's purpose, scopes, data kept and retention period in `docs/05 - Requirements/Integrations - Data Register.md`.

Stop after each source and show me the screens it feeds, with real numbers blurred in any screenshot you share.

## 7. Phase five — People and access

Goal: the right people see the right things. Do not build a full identity system unless I ask for one.

1. List who needs access and what each role should see. Typical splits:
   - the head of family sees everything;
   - board members see governance, the charter, goals and summaries;
   - business leaders see the business financials;
   - advisers see only what they are engaged on.
2. Start with the access control of the hosting choice from Phase three: network-only access, VPN accounts, or the access proxy's single sign-on with our existing email accounts. Use the platform's existing role profiles to tailor menus, not as a security boundary.
3. If I later ask for real in-app authentication, propose a proven provider and a design document first. Do not hand-roll password storage.
4. Record the access matrix in `docs/06 - Operating Model/Access - Roles And Permissions.md`.

## 8. Phase six — Estate and governance content

Goal: the charter, policy and succession sections reflect our family's real intentions, clearly marked as drafts until advisers confirm them.

1. Walk me through the draft constitution section by section. Ask short questions and record my answers verbatim as notes before you rewrite anything.
2. Draft the investment policy statement summary in plain language:
   - objectives;
   - time horizon;
   - liquidity needs;
   - risk tolerance;
   - permitted and excluded assets;
   - review cadence.
   Flag it for review by a regulated adviser.
3. Draft a succession and estate overview:
   - who holds what, through which structure;
   - which documents govern it;
   - when it was last reviewed;
   - who our advisers are.
   Use English law as the baseline unless I tell you otherwise. Never present this as legal advice.
4. Set up the goals screen with our real multi-generational goals, each with an owner, a target date and a measure.
5. Set up the meeting calendar for the family board and the business board, with agendas linked to the relevant charter articles.

## 9. Phase seven — Models and scenarios

Goal: honest, explainable projections, not false precision.

1. Keep the existing illustrative scenarios and stochastic tracking views, but label clearly which inputs are real and which are assumptions.
2. Ask me for planning assumptions:
   - expected returns by asset class;
   - inflation;
   - spending;
   - business distributions;
   - one-off events such as education, property or liquidity events.
   Store them in one canonical assumptions file and link to it from every model screen.
3. Show ranges, not single numbers. Explain each chart in one sentence that the head of the family would understand.
4. Do not build a new financial model unless I ask. If I do, write a design note first covering method, inputs, validation and limits, and get my approval.

## 10. Phase eight — Safety, backup and continuity

1. Back up the family data and canonical documents on a schedule I choose, to at least two places, one of them off-site and encrypted. Test a restore and record the result.
2. Turn on dependency update alerts for the private fork. Review and apply updates monthly, rebuilding and re-checking screens each time.
3. Keep an audit note in `docs/01 - Notes/` of every integration change, access change and restore test, with dates.
4. Write a one-page "if something happens to the person who runs this" guide. It covers where the platform runs, how to start it, where the backups are, who to call, and how to recover the secrets. It is stored with the family's other emergency documents, not only in the repository.
5. Keep the in-app "Wipe and restart demo" option for demo devices, but make sure real data has a backup before anyone uses it.

## 11. Phase nine — Hand-over and review

1. Rebuild from a clean clone to prove the setup is reproducible.
2. Check every screen at 1440 and 390 pixels for readable contrast, non-overlapping chart labels, no horizontal scrolling and no console errors. Fix release blockers.
3. Update these files so they match what was actually built:
   - `docs/03 - Architecture/Trace.md`;
   - `docs/03 - Architecture/Architecture.md`;
   - `docs/04 - Design/Design.md`.
4. Give me a short hand-over note covering:
   - what is running and where;
   - which sources are connected;
   - which items still need an adviser;
   - what you recommend next;
   - every place you made an assumption.
5. Suggest improvements that would help other small family offices. Offer to contribute them upstream to the open-source project in a form that contains no family data, but only with my explicit approval.

## 12. How to work with me

- Before each phase, give me a three-to-five-line plan and wait for my go-ahead.
- After each phase, show what changed, with screenshots, and list anything you could not do and why.
- Ask one clear question at a time when you are blocked, with a recommended answer.
- Keep explanations in plain English. If you must use a technical term, explain it in the same sentence.
- If an instruction in this plan conflicts with the repository's own rules or with safety, stop and tell me rather than guessing.

Begin with Phase one now.
