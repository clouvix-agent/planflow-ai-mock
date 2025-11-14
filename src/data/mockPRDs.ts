export interface PRD {
  id: string;
  title: string;
  labels: string[];
  content?: string;
}

export const mockPRDs: PRD[] = [
  {
    id: "2001",
    title: "Login Module PRD",
    labels: ["auth", "v1"],
    content: `
      <div class="prd-content">
        <h2>Login Module - Product Requirements</h2>
        <p><strong>Status:</strong> In Progress | <strong>Owner:</strong> Sarah Chen</p>
        
        <h3>Overview</h3>
        <p>This document outlines the requirements for implementing a secure and user-friendly authentication system for PlanFlow AI.</p>
        
        <h3>Goals</h3>
        <ul>
          <li>Enable users to securely log in with email and password</li>
          <li>Implement OAuth 2.0 for Google and GitHub sign-in</li>
          <li>Provide password reset functionality</li>
          <li>Support multi-factor authentication (MFA)</li>
        </ul>
        
        <h3>User Stories</h3>
        <ul>
          <li>As a user, I want to log in with my email and password so I can access my account</li>
          <li>As a user, I want to sign in with Google/GitHub for faster access</li>
          <li>As a user, I want to reset my password if I forget it</li>
          <li>As a security-conscious user, I want to enable MFA for added protection</li>
        </ul>
        
        <h3>Technical Requirements</h3>
        <ul>
          <li>JWT-based session management</li>
          <li>bcrypt for password hashing</li>
          <li>Rate limiting to prevent brute force attacks</li>
          <li>HTTPS enforcement</li>
        </ul>
        
        <h3>Out of Scope</h3>
        <ul>
          <li>Biometric authentication (planned for v2)</li>
          <li>SAML/SSO integration (planned for enterprise tier)</li>
        </ul>
      </div>
    `
  },
  {
    id: "2002",
    title: "Dashboard Revamp",
    labels: ["ui", "q1"],
    content: `
      <div class="prd-content">
        <h2>Dashboard Revamp - Product Requirements</h2>
        <p><strong>Status:</strong> Planning | <strong>Owner:</strong> Jordan Lee</p>
        
        <h3>Overview</h3>
        <p>Redesign the main dashboard to improve usability, highlight key metrics, and provide quick access to common actions.</p>
        
        <h3>Goals</h3>
        <ul>
          <li>Improve information hierarchy and visual design</li>
          <li>Add customizable widgets for different user roles</li>
          <li>Enhance mobile responsiveness</li>
          <li>Reduce time to key actions by 30%</li>
        </ul>
        
        <h3>Key Features</h3>
        <ul>
          <li>Drag-and-drop widget customization</li>
          <li>Real-time activity feed</li>
          <li>Quick action shortcuts</li>
          <li>Sprint progress visualization</li>
        </ul>
        
        <h3>Design Principles</h3>
        <ul>
          <li>Clean, minimal interface</li>
          <li>Consistent color palette (teal accents)</li>
          <li>Generous whitespace</li>
          <li>Accessible contrast ratios (WCAG AA compliant)</li>
        </ul>
        
        <h3>Success Metrics</h3>
        <ul>
          <li>User engagement increase by 25%</li>
          <li>Reduced clicks to common actions</li>
          <li>Positive user feedback (NPS > 8)</li>
        </ul>
      </div>
    `
  },
  {
    id: "2003",
    title: "Notification Service",
    labels: [],
    content: `
      <div class="prd-content">
        <h2>Notification Service - Product Requirements</h2>
        <p><strong>Status:</strong> Draft | <strong>Owner:</strong> Mike Rodriguez</p>
        
        <h3>Overview</h3>
        <p>Build a comprehensive notification system supporting email, push, and in-app notifications to keep users informed of important events.</p>
        
        <h3>Goals</h3>
        <ul>
          <li>Notify users of sprint updates and action items</li>
          <li>Allow users to customize notification preferences</li>
          <li>Support multiple delivery channels</li>
          <li>Ensure reliable delivery with retry logic</li>
        </ul>
        
        <h3>Notification Types</h3>
        <ul>
          <li><strong>Sprint Events:</strong> Planning sessions, retrospectives, etc.</li>
          <li><strong>Action Items:</strong> New tasks assigned, updates required</li>
          <li><strong>Integrations:</strong> Fireflies transcript available, Jira updates</li>
          <li><strong>System:</strong> Maintenance windows, feature releases</li>
        </ul>
        
        <h3>Channels</h3>
        <ul>
          <li><strong>Email:</strong> Sendgrid/AWS SES</li>
          <li><strong>Push:</strong> Firebase Cloud Messaging</li>
          <li><strong>In-app:</strong> Real-time via WebSocket</li>
        </ul>
        
        <h3>User Preferences</h3>
        <ul>
          <li>Opt-in/out per notification type</li>
          <li>Quiet hours configuration</li>
          <li>Digest mode (daily/weekly summaries)</li>
        </ul>
        
        <h3>Technical Considerations</h3>
        <ul>
          <li>Queue-based architecture for reliability</li>
          <li>Rate limiting per user</li>
          <li>Template management system</li>
          <li>Analytics and delivery tracking</li>
        </ul>
      </div>
    `
  },
  {
    id: "2004",
    title: "AI Action Generation",
    labels: ["ai", "core"],
    content: `
      <div class="prd-content">
        <h2>AI Action Generation - Product Requirements</h2>
        <p><strong>Status:</strong> In Progress | <strong>Owner:</strong> Alex Thompson</p>
        
        <h3>Overview</h3>
        <p>Leverage AI to automatically generate actionable tasks from meeting transcripts and PRDs, reducing manual work for teams.</p>
        
        <h3>Goals</h3>
        <ul>
          <li>Extract action items from Fireflies transcripts</li>
          <li>Suggest Jira ticket creation/updates</li>
          <li>Link actions to relevant PRDs</li>
          <li>Achieve 85%+ accuracy in action detection</li>
        </ul>
        
        <h3>Input Sources</h3>
        <ul>
          <li>Fireflies meeting transcripts</li>
          <li>Confluence PRDs and documentation</li>
          <li>Existing Jira context</li>
        </ul>
        
        <h3>Action Types</h3>
        <ul>
          <li><strong>Create Ticket:</strong> New Jira issues with summary, description, priority</li>
          <li><strong>Update Ticket:</strong> Changes to existing issues (priority, assignee, etc.)</li>
          <li><strong>Link Items:</strong> Connect related issues or docs</li>
          <li><strong>Flag Blockers:</strong> Identify dependencies or risks</li>
        </ul>
        
        <h3>AI Model</h3>
        <ul>
          <li>GPT-4 for natural language understanding</li>
          <li>Custom prompt engineering for domain-specific extraction</li>
          <li>Fine-tuning with team-specific examples</li>
        </ul>
        
        <h3>User Experience</h3>
        <ul>
          <li>Review and approve actions before applying</li>
          <li>Edit AI-generated content</li>
          <li>Provide feedback to improve accuracy</li>
        </ul>
      </div>
    `
  },
  {
    id: "2005",
    title: "Jira Bidirectional Sync",
    labels: ["integration", "jira"],
    content: `
      <div class="prd-content">
        <h2>Jira Bidirectional Sync - Product Requirements</h2>
        <p><strong>Status:</strong> Planning | <strong>Owner:</strong> Chris Patel</p>
        
        <h3>Overview</h3>
        <p>Enable seamless synchronization between PlanFlow AI and Jira, allowing actions taken in either system to reflect in the other.</p>
        
        <h3>Goals</h3>
        <ul>
          <li>Sync issues created/updated in PlanFlow to Jira</li>
          <li>Pull Jira updates into PlanFlow context</li>
          <li>Maintain data consistency</li>
          <li>Handle conflicts gracefully</li>
        </ul>
        
        <h3>Sync Scenarios</h3>
        <ul>
          <li><strong>Create:</strong> New issue in PlanFlow → Jira</li>
          <li><strong>Update:</strong> Changes in PlanFlow → Jira (and vice versa)</li>
          <li><strong>Status Changes:</strong> Workflow transitions synced</li>
          <li><strong>Comments:</strong> Activity feed mirrored</li>
        </ul>
        
        <h3>Technical Approach</h3>
        <ul>
          <li>Jira REST API v3</li>
          <li>Webhook listeners for real-time updates</li>
          <li>Conflict resolution strategy (last-write-wins with user notification)</li>
          <li>Batch sync for initial setup</li>
        </ul>
        
        <h3>Edge Cases</h3>
        <ul>
          <li>Jira connectivity loss</li>
          <li>Permission mismatches</li>
          <li>Custom field mappings</li>
          <li>Rate limiting</li>
        </ul>
      </div>
    `
  }
];
