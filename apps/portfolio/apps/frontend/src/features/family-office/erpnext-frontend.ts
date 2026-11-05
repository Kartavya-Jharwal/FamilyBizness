/**
 * Selected UI metadata adapted from ERPNext Task/Shareholder DocTypes.
 * Copyright (c) Frappe Technologies Pvt. Ltd. and contributors. GPL-3.0.
 * Commit 4d8a0664a9e2a0375025ac2685841ed05095f023.
 * Source paths and retained license: public/open-source/financial-reporting/NOTICE.md.
 * Server methods, permissions, naming series and Frappe runtime have been removed.
 */
export const erpTaskMask = [
  {
    "fieldname": "subject",
    "fieldtype": "Data",
    "label": "Subject",
    "reqd": 1
  },
  {
    "fieldname": "project",
    "fieldtype": "Link",
    "label": "Project",
    "options": "Project",
    "in_list_view": 1
  },
  {
    "fieldname": "status",
    "fieldtype": "Select",
    "label": "Status",
    "options": "Open\nWorking\nPending Review\nOverdue\nTemplate\nCompleted\nCancelled",
    "in_list_view": 1
  },
  {
    "fieldname": "priority",
    "fieldtype": "Select",
    "label": "Priority",
    "options": "Low\nMedium\nHigh\nUrgent",
    "in_list_view": 1
  },
  {
    "fieldname": "exp_start_date",
    "fieldtype": "Datetime",
    "label": "Expected Start Date"
  },
  {
    "fieldname": "exp_end_date",
    "fieldtype": "Datetime",
    "label": "Expected End Date"
  },
  {
    "fieldname": "progress",
    "fieldtype": "Percent",
    "label": "% Progress"
  },
  {
    "fieldname": "description",
    "fieldtype": "Text Editor",
    "label": "Task Description"
  },
  {
    "fieldname": "company",
    "fieldtype": "Link",
    "label": "Company",
    "options": "Company"
  }
] as const;
export const erpShareholderMask = [
  {
    "fieldname": "title",
    "fieldtype": "Data",
    "label": "Title",
    "reqd": 1
  },
  {
    "fieldname": "folio_no",
    "fieldtype": "Data",
    "label": "Folio no.",
    "read_only": 1
  },
  {
    "fieldname": "company",
    "fieldtype": "Link",
    "label": "Company",
    "options": "Company",
    "reqd": 1,
    "in_list_view": 1
  },
  {
    "fieldname": "share_balance",
    "fieldtype": "Table",
    "label": "Share Balance",
    "options": "Share Balance",
    "read_only": 1
  }
] as const;

// Adapted from Task task_list.js get_indicator. Semantic host roles replace donor colors.
export const erpTaskIndicators = {
  Open: "text-foreground", Overdue: "text-destructive", "Pending Review": "text-muted-foreground",
  Working: "text-foreground", Completed: "text-foreground", Cancelled: "text-muted-foreground", Template: "text-muted-foreground",
} as const;
export const erpTaskListFields = ["project", "status", "priority", "exp_start_date", "exp_end_date", "subject", "progress", "depends_on_tasks"] as const;
export const erpTaskBulkActions = [
  {label:"Set as Open",status:"Open"}, {label:"Set as Completed",status:"Complete"},
] as const;

/** Runtime subset of Projects Workspace content/number_cards and Project Reports links.
 * Source: erpnext/projects/workspace/projects/projects.json at the revision above.
 * Timesheet Working Hours is intentionally omitted because the host has no time ledger. */
export const erpProjectWorkspaceMask = {
  title: "Projects",
  numberCards: [
    { label: "Open Projects", key: "projects" },
    { label: "Non Completed Tasks", key: "open" },
  ],
  reports: ["Project Summary", "Delayed Tasks Summary"],
  views: ["List", "Board", "Projects"],
} as const;
