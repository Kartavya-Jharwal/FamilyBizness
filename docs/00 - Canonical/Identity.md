# Identity

> **Canonical file.** Load-bearing product facts live here only. Other docs link here; they do not redefine these facts.

## Product

| Fact | Value |
|------|--------|
| Internal Code Name | **familybizness** |
| Display Name | Browser-local surname (`FAMILY_NAME`, default `Smith`) followed by **Family Office**. Editable in Settings → General and the landing/Stewardship header. |
| One-liner | Wealth management platform for a single-family office (SFO) to plan the estate and run the financial affairs of a family business, optimising returns for current and future generations. |
| Form | Functional prototype / MVP packaged for GitHub Pages: branded entry shell and integrated planning/portfolio workspaces. Deployment status is recorded in the [MVP release record](../03%20-%20Architecture/Release%20-%20MVP.md). |
| Legal baseline | English law (estate & wealth structuring). |

## Smith Family — Hypothetical Reference Family

The reference family is the **Smith family**. Its fictional founding story follows a line of smiths whose business served a royal palace over many years and held a Royal Warrant of Appointment. The palace, founding ancestor, trade specialism, warrant holder and dates remain unspecified; this is a hypothetical family narrative, not a claim about a real warrant or royal endorsement.

The family accumulated wealth through generations of business ownership while continuing to live modestly. It is an established family enterprise rather than a business empire. Industrial change and, more recently, the digital age have increased the complexity of managing the business and the family's financial affairs.

The family's guiding values are craftsmanship, continuity, modest living, stewardship and personal responsibility. Modernisation should preserve that heritage and help successive generations care for the business and its wealth.

The intended operating model is a private, dedicated family wealth management platform at a scale smaller than a traditional staffed SFO. The family wants to coordinate its growing business, estate planning and intergenerational affairs while retaining its own identity and personal oversight, rather than joining an MFO. SFO capabilities describe the scope of the platform, not an assumption of institutional staffing or empire-scale assets.

This reference identity is distinct from the browser-local display-name customisation described above. No wealth amount, palace name, founding date or additional genealogy has been established.

## Audience

- Patriarchs
- Family board members
- CEO / Managing Directors

## Pillars

Mandated capabilities (detail → [`../05 - Requirements/Pillars.md`](../05%20-%20Requirements/Pillars.md)):

1. Governance & succession  
2. Constitution linkage  
3. Estate & wealth structuring  
4. Portfolio selection & optimisation  
5. Financial modelling & analytics  
6. SFO / MFO operating model  

## Family office and constitution

The application is one prepared family-office experience. Its [combined operating charter](Smith%20Family%20-%20Constitution.md) selects provisions from Golden Bird, Calcot / Stone, Sandoval and Vasnani. These are source constitutions for the application, not four merged businesses or a requirement for visiting families to build constitutions. Golden Bird alone does not define the product.

## Cold-visit flow

The main public landing presents the family brand, founding legacy, current and next generations, photo slots and six tailored office capabilities. Its single “Let’s log in” action opens visitor-profile selection inside Portfolio, including on returning visits. Patriarch, family board and professional profiles enter the same prepared office and saved records. Add profile adds a visitor. Existing earlier workspaces remain recoverable as a secondary option. Current contract: [Entry and profile flow](../05%20-%20Requirements/Auth%20Flow.md).

## Link-outs

- Architecture → [`../03 - Architecture/Architecture.md`](../03%20-%20Architecture/Architecture.md)
- Design tokens → [`../../packages/tokens/tokens.css`](../../packages/tokens/tokens.css)
- Constitution → platform trace → [`../03 - Architecture/Trace.md`](../03%20-%20Architecture/Trace.md)
