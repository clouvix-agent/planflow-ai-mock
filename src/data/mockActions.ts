export interface SprintAction {
  id: string;
  type: "Create Ticket" | "Update Ticket" | "Link Items" | "Flag Blocker";
  summary: string;
  source: string;
  status: "Pending" | "Approved" | "Rejected";
  details?: {
    issueType?: string;
    priority?: string;
    assignee?: string;
    description?: string;
  };
}

export const mockActions: SprintAction[] = [
  {
    id: "A1",
    type: "Create Ticket",
    summary: "Implement error boundary for dashboard widgets",
    source: "Sprint Planning - Jan 10",
    status: "Pending",
    details: {
      issueType: "Task",
      priority: "Medium",
      description: "Add React error boundaries to dashboard widget components to prevent full page crashes when individual widgets fail."
    }
  },
  {
    id: "A2",
    type: "Update Ticket",
    summary: "Increase priority of AUTH-22 (token refresh issue)",
    source: "PBR Discussion - Jan 8",
    status: "Pending",
    details: {
      priority: "High",
      description: "Users are experiencing session timeouts. This is blocking multiple features."
    }
  },
  {
    id: "A3",
    type: "Create Ticket",
    summary: "Research push notification providers for notification service",
    source: "PBR Discussion - Jan 8",
    status: "Pending",
    details: {
      issueType: "Story",
      priority: "Medium",
      description: "Evaluate Firebase Cloud Messaging, OneSignal, and Pusher for our notification system. Document pros/cons and cost estimates."
    }
  },
  {
    id: "A4",
    type: "Create Ticket",
    summary: "Set up automated rollback mechanism for deployments",
    source: "Infra Weekly Sync",
    status: "Pending",
    details: {
      issueType: "Task",
      priority: "High",
      description: "Implement automated rollback in CI/CD pipeline to reduce downtime during failed deployments."
    }
  },
  {
    id: "A5",
    type: "Link Items",
    summary: "Link AUTH-22 to Login Module PRD",
    source: "PBR Discussion - Jan 8",
    status: "Pending",
    details: {
      description: "Create relationship between AUTH-22 (token refresh bug) and the Login Module PRD for better context."
    }
  },
  {
    id: "A6",
    type: "Flag Blocker",
    summary: "Dashboard revamp blocked by missing design assets",
    source: "Sprint Retro - Dec 28",
    status: "Pending",
    details: {
      description: "UI implementation is waiting for final icon set and responsive mockups from design team."
    }
  },
  {
    id: "A7",
    type: "Create Ticket",
    summary: "Consolidate meeting schedule to reduce overhead",
    source: "Sprint Retro - Dec 28",
    status: "Pending",
    details: {
      issueType: "Task",
      priority: "Low",
      description: "Review recurring meetings and consolidate where possible to free up team time."
    }
  }
];
