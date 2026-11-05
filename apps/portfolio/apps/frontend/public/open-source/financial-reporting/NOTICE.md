# ERPNext Frontend Adaptation

Source: ERPNext, https://github.com/frappe/erpnext, commit `4d8a0664a9e2a0375025ac2685841ed05095f023`.

Selected ERPNext source fragments retain GPL-3.0 terms. Original copyright belongs to Frappe Technologies Pvt. Ltd. and contributors. The unchanged original `license.txt` is distributed here as `LICENSE`. The host retains its separate original application license and notices. Corresponding modified source is available in the FamilyBizness project repository: https://github.com/Kartavya-Jharwal/FamilyBizness . No affiliation or endorsement is claimed.

## Extracted frontend masks and code

- `erpnext/projects/doctype/task/task.json`: selected Task DocType field order, labels, types, required flags and priority options, extracted to `src/features/family-office/erpnext-frontend.ts`.
- `erpnext/projects/doctype/task/task_list.js`: list fields, default-open view, status indicators, selected-item Open/Completed actions and project/assignee/progress inspection, adapted into `erpnext-task-workspace.tsx`.
- `erpnext/accounts/doctype/shareholder/shareholder.json`: Title/Company and Share Balance frontend mask, adapted into `erpnext-ownership-register.tsx`.

The Task fields and selected-item actions use the existing profile-scoped operations register. Completion still requires host evidence. Priority, project, start date and progress are optional metadata in that same record, not another task database. The ownership register filters existing estate records; percentages remain economic ownership percentages, not numbers of shares. Selected holdings open the existing host editor.

Server methods, Frappe globals, permission records, naming series, accounting/general-ledger calculations, Python runtime and donor global styling have been removed. Host components, state, routes and canonical tokens take precedence. Financial calculations remain the host's existing planning models; this extraction does not claim ERPNext's accounting engine as shipped. Source SHA-256 fingerprints and adapted host paths are in `../donor-manifest.json`.

Projects workspace shell: selected runtime number-card labels and Project Summary / Delayed Tasks Summary report names are extracted from `erpnext/projects/workspace/projects/projects.json`; `erpnext/workspace_sidebar/projects.json` supplies Projects/Task hierarchy. The host renders computed project groups, progress, Open Projects and Non Completed Tasks from its saved operations rows. List, task-board and project-summary views share those rows; project selection filters the Task list. Timesheet Working Hours and unavailable ERP modules are omitted rather than represented by invented accounting values.
