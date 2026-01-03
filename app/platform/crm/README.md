# CRM Module

Internal CRM for Faith Interactive staff to manage church/prospect leads.

## Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/platform/crm` | Dashboard - My Follow-ups | FI_ADMIN, SALES_REP |
| `/platform/crm/leads` | Leads list with filters | FI_ADMIN, SALES_REP |
| `/platform/crm/leads/new` | Create new lead | FI_ADMIN, SALES_REP |
| `/platform/crm/leads/[id]` | Lead detail page | FI_ADMIN, SALES_REP* |
| `/platform/crm/kanban` | Kanban pipeline view | FI_ADMIN, SALES_REP |
| `/platform/crm/settings/stages` | Manage pipeline stages | FI_ADMIN only |

*SALES_REP can only access leads they own.

## RBAC Rules

### FI_ADMIN
- Full access to all leads, tasks, and DNC records
- Can reassign lead owners
- Can manage pipeline stages
- Can override DNC restrictions for contact tasks

### SALES_REP
- Can only view/edit leads where `ownerUserId === currentUserId`
- Can create leads (automatically assigned to self)
- Can create tasks only for their own leads
- Cannot create contact tasks (call, email, text) for DNC leads
- Cannot access stage settings

## Schema

### CrmStage
```
id          String   (cuid)
name        String
sortOrder   Int      (for ordering)
isActive    Boolean  (default: true)
createdAt   DateTime
updatedAt   DateTime
```

### CrmLead
```
id                  String   (cuid)
churchName          String   (required)
primaryContactName  String?
email               String?
phone               String?
website             String?
location            String?  (city/state)
stageId             FK -> CrmStage
ownerUserId         FK -> User
source              String?  (referral, inbound, list, event, etc.)
notes               Text?
nextFollowUpAt      DateTime? (derived from earliest open task)
createdAt           DateTime
updatedAt           DateTime
```

### CrmTask
```
id          String        (cuid)
leadId      FK -> CrmLead
ownerUserId FK -> User
type        Enum          (CALL, EMAIL, TEXT, MEETING, OTHER)
dueAt       DateTime
status      Enum          (OPEN, DONE)
notes       Text?
completedAt DateTime?
createdAt   DateTime
updatedAt   DateTime
```

### CrmDnc (Do Not Contact)
```
id            String   (cuid)
leadId        FK -> CrmLead (unique - one per lead)
reason        String?
addedByUserId FK -> User
addedAt       DateTime
```

## Seeding Stages

Default stages are seeded automatically when the CRM dashboard is first accessed. The stages are:

1. New
2. Contacted
3. Qualified
4. Demo Scheduled
5. Proposal Sent
6. Won
7. Lost

To manually seed stages, call `seedDefaultStages()` from `lib/crm/actions.ts`.

## Key Files

```
lib/crm/
  guards.ts    - RBAC guards and permission checks
  schemas.ts   - Zod validation schemas
  actions.ts   - Server actions for mutations
  queries.ts   - Data fetching functions
  index.ts     - Re-exports

app/platform/crm/
  layout.tsx   - RBAC guard (403 for non-CRM users)
  page.tsx     - Dashboard (My Follow-ups)

  components/
    task-list.tsx       - Task list with actions
    leads-table.tsx     - Leads table view
    lead-filters.tsx    - Filter controls
    lead-form.tsx       - Create/edit lead form
    lead-header.tsx     - Lead detail header
    lead-details.tsx    - Lead info section
    lead-dnc.tsx        - DNC status toggle
    lead-tasks.tsx      - Task management
    kanban-board.tsx    - Kanban view
    stage-list.tsx      - Stage management
    create-stage-form.tsx

  leads/
    page.tsx           - Leads list
    new/page.tsx       - Create lead
    [id]/page.tsx      - Lead detail

  kanban/
    page.tsx           - Kanban view

  settings/
    stages/page.tsx    - Stage settings (FI_ADMIN only)
```

## Derived Rules

- When creating or updating tasks, `crm_lead.nextFollowUpAt` is updated to the earliest open task's due date (or null if no open tasks).
- DNC leads block contact task creation (call, email, text) for SALES_REP. FI_ADMIN can override with `allowDncOverride: true`.
- If a SALES_REP tries to access a lead they don't own, they get a 404 (not 403) to avoid leaking lead existence.
