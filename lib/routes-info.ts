export const ROUTES_INFO: { path: string; description: string; href: string }[] = [
  { path: "/", description: "Home; choose Login or Join.", href: "/" },
  { path: "/login", description: "Sign in.", href: "/login" },
  { path: "/join", description: "Sign up / accept company invite.", href: "/join" },
  {
    path: "/email-confirmation",
    description: "Email confirmation (link from verification email).",
    href: "/email-confirmation",
  },
  {
    path: "/verify/[key]",
    description: "Email verification after signup (legacy path).",
    href: "/verify/demo",
  },
  {
    path: "/dashboard",
    description: "Dashboard: task stats, completion graph, hero stats.",
    href: "/dashboard",
  },
  {
    path: "/employees/[employeeId]",
    description: "Employee profile and analytics.",
    href: "/employees/1",
  },
  { path: "/invite", description: "Invite users to the company.", href: "/invite" },
  { path: "/squads", description: "List squads.", href: "/squads" },
  {
    path: "/squads/create",
    description: "Create a new squad.",
    href: "/squads/create",
  },
  {
    path: "/squads/[squadId]/edit",
    description: "Edit a squad.",
    href: "/squads/1/edit",
  },
  {
    path: "/tasks",
    description: "Task list and filters.",
    href: "/tasks",
  },
  {
    path: "/tasks/create",
    description: "Create a task.",
    href: "/tasks/create",
  },
  {
    path: "/tasks/[taskId]",
    description: "Task details.",
    href: "/tasks/1",
  },
  {
    path: "/tasks/edit/[taskId]",
    description: "Edit a task.",
    href: "/tasks/edit/1",
  },
  {
    path: "/onboarding",
    description: "Onboarding checklist (with token).",
    href: "/onboarding",
  },
  {
    path: "/routes",
    description: "This page: list of all routes.",
    href: "/routes",
  },
];
