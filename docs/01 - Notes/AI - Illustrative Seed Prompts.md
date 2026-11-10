# AI — Illustrative Seed Prompts

> **Invented illustrations, not a verbatim chat transcript.** These prompts reconstruct the seeds of the conversations in the team's direct, iterative writing style. They draw on the [AI prompts log](../AI_PROMPTS_LOG.md), project records and the students' account of their decisions. They must not be presented as original messages, dated evidence or proof of approval. The full exchanges included extensive follow-ups, debugging and revisions; reproducing that verbosity could run to hundreds of pages. This document captures the starting questions and rationale only.

The order below explains the development approach rather than asserting an exact chronology. The handbook discussion, two-session rationale, student origin of the merged constitution and MAAD setup are included from the students' account. No handbook ruling or particular MAAD implementation is established here. Product facts remain in [Identity](../00%20-%20Canonical/Identity.md).

## 1. GitHub, Agents and Architecture Scaffolding

**Illustrative seed prompt**

> set up the github repo for the family office project. start with the architecture scaffold and docs first. we have different team members and different ai agents working on parts of this so put shared instructions in place for them. keep one home for the facts and design tokens. explain how we should use branches, commits and reviews so people can work separately and merge without overwriting each other. also how would we bring in other modules later without rebuilding the whole thing

**Rationale:** A shared repository makes changes traceable, supports review and rollback, and gives students and agents a common structure. Branches and bounded responsibilities help parallel work; shared instructions and integration reviews help it converge. Agent configuration is distinct from granting people or services repository access.

## 2. Claude as Devil's Advocate: Handbook and Donor Use

**Illustrative seed prompt — critical review session**

> claude play devil's advocate on this approach. check the student handbook and assignment rules we give you. can we use open source donor projects and adapt them for this assignment, and what would we need to disclose? challenge it properly. ai coding can borrow heavily from existing code and i dont want us assuming generated code is automatically original. would an explicitly credited fork be a more transparent starting point? separate what the handbook actually says from your interpretation and flag anything we need to ask the tutor

**Illustrative seed prompt — development session**

> take the concerns from the separate claude discussion and turn them into constraints for our build. keep the donor sources and our own contribution traceable. dont treat the other chat as approval. we need to explain what we reused, what we changed and what the students decided

**Rationale:** In the students' account, two sessions separated implementation from an independent challenge to its assumptions. Concern about AI's reuse of existing code motivated explicit provenance; it does not establish that all AI output is stolen. Open-source licensing and permission under assessment rules are separate questions. These reconstructed prompts do not claim either was approved.

## 3. Researching Donors and Checking Licences

**Illustrative seed prompt**

> research open source projects we can use as donors for this. compare what each actually gives us against the assignment instead of just picking nice dashboards. look at wealthfolio, ghostfolio and candidates for policy, operations, calendar and simulation. find the original repos and check the licence at the revision we would use. record the source, notices, attribution and any obligations on modifications or distribution. flag missing or unclear permission before we bring code across

**Rationale:** Donor selection combines functional fit with technical feasibility and documented reuse conditions. A public repository alone is not evidence of permission. The [contribution ledger](../03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md) distinguishes what actually reached the frontend from candidates considered along the way.

## 4. Separate Scope Conversation: Browser Proof of Concept

**Illustrative seed prompt**

> separate scope decision before we go further. this is a browser mvp proof of concept for the assignment. clone the candidate repos locally and make an inventory of what we could keep. retain the useful frontend scaffold and interactions but strip out the native and backend dependencies that stop it running as a static demo. use clearly hypothetical sample data and browser storage where needed. dont turn this into a production banking platform or build real auth and live broker connections

**Rationale:** This is a distinct scope-setting conversation, rather than an implied consequence of donor research. It makes the prototype feasible to demonstrate and keeps production infrastructure outside the agreed work. “Inventory” here means the candidate/source inventory; no unidentified inventory repository is asserted. The [conversion playbook](../02%20-%20Strategy/Donor%20-%20Conversion%20Playbook.md) records the repository's conversion approach.

## 5. Building Out and Merging the Donors

**Illustrative seed prompt**

> now bring the useful donor parts into one main application. use the existing host and fit the others into it. i dont want separate apps that just link to each other. keep one navigation, shared styling and one owning place for each set of records. merge the portfolio, policy, operations, calendar and simulation pieces where they support the brief. keep the source attribution and show which parts are actually reused code versus ideas we adapted

**Rationale:** Integration turns separate candidates into a coherent experience. Shared records and navigation reduce conflicting state, while a contribution ledger distinguishes adaptation, direct reuse and original integration work. Technical decisions belong in [Architecture](../03%20-%20Architecture/Architecture.md).

## 6. Direct Check Against the Six Pillars

**Illustrative seed prompt**

> does this merged build still meet all six pillars? check governance and succession, constitution linkage, estate and wealth structuring, portfolio selection and optimisation, financial modelling and analytics, and the sfo/mfo operating model. for each one show the actual user task and what works in the app. what is missing, what is only a static screen and what still needs building? dont count a heading or a nice chart as completing a pillar. make a gap plan and then check again after the changes

**Rationale:** The assignment remains the acceptance standard after integration. Explicit questions expose the difference between visual coverage and functional workflows. The maintained [pillar requirements](../05%20-%20Requirements/Pillars.md) and [traceability record](../03%20-%20Architecture/Trace.md) own the detailed mapping.

## 7. Student-Origin Decision: A Combined Constitution

**Illustrative seed prompt**

> we as a student team want to combine selected parts of our constitutions. different members want to retain particular sections from their own work and use useful parts from the others. help us turn those selections into one coherent operating charter. show where each provision came from, where they conflict and which decisions we need to make as a team. dont describe this as merging four family businesses and dont invent agreement between incompatible rules

**Rationale:** The students identify the combined-constitution idea as their own. AI's proposed role is organising, comparing and implementing their selections, while students retain responsibility for choices and conflicts. The [combined operating charter](../00%20-%20Canonical/Smith%20Family%20-%20Constitution.md) is the canonical home for the selected provisions.

## 8. Interlinking the Workspaces

**Illustrative seed prompt**

> interlink this now so the constitution is doing something in the platform. connect the selected rules to the relevant policy settings, decision rights, distributions, succession and portfolio review. connect operations and calendar to the tasks those decisions create. use the same saved records across the views. make it clear which links are implemented and which are still assumptions or demonstration limits

**Rationale:** Interlinking connects constitutional choices to observable workflows. It requires consistent records and explicit boundaries so that the interface does not imply legal enforcement or functionality that has not been built.

## 9. MAAD and Multi-Agent Working Setup

**Illustrative seed prompt**

> set up the MAAD multi agent working approach for the remaining integration. define what we mean by MAAD in our setup first. split the work into bounded tasks with clear file ownership, shared context and handoff notes. have one coordinating agent own integration and another review the result against the brief. make sure agents dont edit the same files at the same time or each build a different version of the platform. record their plans, changes and checks so the students can review and decide what to accept

**Rationale:** The proposed setup supports parallel work while retaining a single integration point and human accountability. Shared instructions, task ownership and review are intended to reduce conflicting changes. MAAD is retained as the students' term; this illustration neither invents an expansion nor claims a specific framework was installed.

## Reading This Alongside the Evidence

Use these prompts to explain the team's approach, not to substantiate that a particular conversation occurred. Consult the [recorded prompts and recovered plans](../AI_PROMPTS_LOG.md) for available historical evidence and the [implementation record](AI%20-%20Implementation%20Record.md) for documented decisions and limitations. No original log entries have been replaced by these illustrations.
