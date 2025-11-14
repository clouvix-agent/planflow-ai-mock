export interface Meeting {
  id: string;
  title: string;
  date: string;
  type: "Sprint Planning" | "PBR" | "Other";
  summary?: {
    overview: string;
    action_items: string[];
  };
  transcript?: {
    speaker: string;
    text: string;
    timestamp: string;
  }[];
}

export const mockMeetings: Meeting[] = [
  {
    id: "101",
    title: "Sprint Planning - Jan 10",
    date: "2025-01-10",
    type: "Sprint Planning",
    summary: {
      overview: "Discussed upcoming sprint goals, reviewed backlog priorities, and allocated story points. Team agreed to focus on the authentication module and dashboard improvements.",
      action_items: [
        "Create tickets for auth flow enhancements",
        "Update dashboard component library",
        "Schedule follow-up for API design review"
      ]
    },
    transcript: [
      { speaker: "Sarah (PM)", text: "Let's start by reviewing our sprint goals for this iteration.", timestamp: "00:00:12" },
      { speaker: "Alex (Dev)", text: "I think we should prioritize the authentication module. It's blocking several features.", timestamp: "00:01:45" },
      { speaker: "Jordan (Design)", text: "Agreed. I've finished the mockups for the login and signup flows.", timestamp: "00:02:30" },
      { speaker: "Sarah (PM)", text: "Perfect. Let's assign story points. Alex, what do you think for the auth module?", timestamp: "00:03:15" },
      { speaker: "Alex (Dev)", text: "I'd say 13 points. It includes backend integration and error handling.", timestamp: "00:03:45" }
    ]
  },
  {
    id: "102",
    title: "PBR Discussion - Jan 8",
    date: "2025-01-08",
    type: "PBR",
    summary: {
      overview: "Product backlog refinement session focusing on upcoming features. Discussed technical debt items and clarified requirements for the notification service.",
      action_items: [
        "Break down notification service epic into stories",
        "Research push notification providers",
        "Update priority of token refresh bug"
      ]
    },
    transcript: [
      { speaker: "Mike (Tech Lead)", text: "Today we need to refine the notification service epic.", timestamp: "00:00:08" },
      { speaker: "Sarah (PM)", text: "Let me share the requirements doc. We need email, push, and in-app notifications.", timestamp: "00:00:45" },
      { speaker: "Alex (Dev)", text: "Should we consider a third-party service like Firebase or build in-house?", timestamp: "00:02:10" },
      { speaker: "Mike (Tech Lead)", text: "Let's research both options. Also, AUTH-22 needs higher priority.", timestamp: "00:03:20" }
    ]
  },
  {
    id: "103",
    title: "Infra Weekly Sync",
    date: "2025-01-07",
    type: "Other",
    summary: {
      overview: "Infrastructure team sync covering deployment pipeline improvements and monitoring setup.",
      action_items: [
        "Implement automated rollback mechanism",
        "Set up alerting for API latency",
        "Document deployment process"
      ]
    },
    transcript: [
      { speaker: "Chris (DevOps)", text: "Let's review the deployment pipeline updates.", timestamp: "00:00:05" },
      { speaker: "Pat (SRE)", text: "We've had three incidents this week related to manual deployments.", timestamp: "00:01:20" },
      { speaker: "Chris (DevOps)", text: "We should automate the rollback process to prevent downtime.", timestamp: "00:02:15" }
    ]
  },
  {
    id: "104",
    title: "Sprint Retro - Dec 28",
    date: "2024-12-28",
    type: "Other",
    summary: {
      overview: "Team retrospective for the previous sprint. Discussed what went well and areas for improvement.",
      action_items: [
        "Reduce meeting overhead",
        "Improve code review turnaround time",
        "Set up pair programming sessions"
      ]
    },
    transcript: [
      { speaker: "Sarah (PM)", text: "What went well this sprint?", timestamp: "00:00:10" },
      { speaker: "Alex (Dev)", text: "We shipped the dashboard on time, and the team collaboration was great.", timestamp: "00:00:45" },
      { speaker: "Jordan (Design)", text: "I felt we had too many meetings. Could we consolidate some?", timestamp: "00:01:30" }
    ]
  },
  {
    id: "105",
    title: "Q1 Planning - Dec 20",
    date: "2024-12-20",
    type: "Sprint Planning",
    summary: {
      overview: "High-level planning for Q1 goals and major initiatives. Discussed resource allocation and roadmap priorities.",
      action_items: [
        "Draft Q1 OKRs",
        "Align team on major milestones",
        "Schedule kick-off meeting"
      ]
    },
    transcript: [
      { speaker: "Sarah (PM)", text: "Let's outline our Q1 objectives.", timestamp: "00:00:15" },
      { speaker: "Mike (Tech Lead)", text: "I think we should focus on platform stability and new user features.", timestamp: "00:01:00" },
      { speaker: "Alex (Dev)", text: "Agreed. We also need to address technical debt from Q4.", timestamp: "00:02:10" }
    ]
  }
];
