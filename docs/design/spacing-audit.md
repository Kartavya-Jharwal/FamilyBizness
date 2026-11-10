# Spacing Audit

| Element | Original owner / property | Correction |
|---|---|---|
| Sidebar outer edge | AppSidebar outer div / pt-12 padding | Removed surplus leading padding; nav owns spacing |
| Logo label | span / ms-2 margin | Header owns gap |
| Finance children | details / ms-4 margin and ps-2 padding | Flat nested list, row padding-left token |
| Logo bottom | logo wrapper / pb-6 padding | Parent gap |
| Nav siblings | individual rows / mb-1 and mb-4 margins | List owns gap |
| Settings categories | two top rows with Tabs and flex gap | Left list with token padding and gap |
| Settings content | main / space-y-5 child margins | Grid and detail flex gap |

New navigation and settings structural components use no spacing margins; list margin is reset to zero. Existing embedded specialist forms and chart content still contain utility margins and need the wider visual sweep. Screenshots are required before release; this audit does not claim screenshot verification.

The shared `FamilyOfficeShell` formerly used Tailwind `space-y-6`, which writes child margins. The shell now owns `flex flex-col gap-6`, preserving the canonical sibling interval without leading/trailing child margins.


## Navigation and profile icon polish

Before this change, ProfileShell owned sibling spacing through `space-y-6` (child margins) and its header used `space-y-2`. The entry container now owns `gap: --space-6` and padding; header copy owns `gap: --space-2`. The three-column profile grid left a sixth position empty; six equal CSS tracks now centre the final two cards using column placement, without offset margins. Sidebar controls own their padding, icon/text gap and canonical touch target. Existing navigation row indentation remains data-driven padding.
