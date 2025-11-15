import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockMeetings, Meeting } from "@/data/mockMeetings";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AIAction {
  action_type: "create" | "update";
  jira_issue_key: string | null;
  summary: string;
  description: string;
  acceptance_criteria: string[];
  target_sprint: string;
  dependencies: string[];
  assignee: string;
  status?: "pending" | "approved" | "rejected";
  jira_created_key?: string;
}

interface AIAnalysis {
  transcript_id: string;
  title: string;
  date: number;
  analysis: {
    actions: AIAction[];
    minutes_of_meeting: string;
    actions_by_member: Array<{
      member: string;
      items: string[];
    }>;
  };
}

const mockAIAnalysis: AIAnalysis = {
  transcript_id: "mock-123",
  title: "Sprint Planning - Jan 10",
  date: Date.now(),
  analysis: {
    actions: [
      {
        action_type: "create",
        jira_issue_key: null,
        summary: "Implement user authentication module",
        description: "Create a complete authentication system with login, logout, and session management",
        acceptance_criteria: [
          "Users can log in with email and password",
          "Session persists across page refreshes",
          "Logout functionality works correctly"
        ],
        target_sprint: "Sprint 21",
        dependencies: [],
        assignee: "Alice",
        status: "pending"
      },
      {
        action_type: "update",
        jira_issue_key: "PROJ-42",
        summary: "Update dashboard with new metrics",
        description: "Add performance metrics and user activity tracking to the main dashboard",
        acceptance_criteria: [
          "All new metrics are displayed correctly",
          "Data updates in real-time"
        ],
        target_sprint: "Sprint 21",
        dependencies: ["PROJ-40"],
        assignee: "Bob",
        status: "pending"
      }
    ],
    minutes_of_meeting: "The team discussed the upcoming sprint goals and prioritized user authentication as the main focus. Dashboard improvements were also discussed as a secondary priority. The team agreed on the acceptance criteria for both items.",
    actions_by_member: [
      {
        member: "Alice",
        items: [
          "Implement authentication backend",
          "Create login UI components",
          "Write unit tests for auth module"
        ]
      },
      {
        member: "Bob",
        items: [
          "Design new dashboard metrics",
          "Integrate real-time data updates",
          "Update documentation"
        ]
      }
    ]
  }
};

export default function Meetings() {
  const { mode } = useAuth();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [sprintName, setSprintName] = useState("Sprint 21");
  const [loading, setLoading] = useState(false);
  const [analyzingLoading, setAnalyzingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'demo') {
      setMeetings(mockMeetings);
    } else if (mode === 'real') {
      fetchMeetings();
    }
  }, [mode]);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/fireflies/meetings');
      const json = await response.json();
      const transcripts = json.data.transcripts.map((t: any) => ({
        id: t.id,
        title: t.title,
        date: new Date(t.date).toLocaleDateString(),
        type: 'Other' as const,
        summary: null,
        transcript: null
      }));
      setMeetings(transcripts);
    } catch (err) {
      setError('Failed to fetch meetings from backend');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (id: string, type: Meeting["type"]) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, type } : m))
    );
  };

  const handleViewDetails = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    
    if (mode === 'demo') {
      setAiAnalysis(mockAIAnalysis);
    } else if (mode === 'real') {
      setAnalyzingLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/ai/analyze_transcript/${meeting.id}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              meeting_type: meeting.type,
              sprint_name: sprintName,
              participants: []
            })
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to analyze transcript');
        }
        
        const data: AIAnalysis = await response.json();
        // Initialize status for all actions
        data.analysis.actions = data.analysis.actions.map(action => ({
          ...action,
          status: action.status || 'pending'
        }));
        setAiAnalysis(data);
        toast({
          title: "Analysis Complete",
          description: "AI has analyzed the meeting transcript."
        });
      } catch (err) {
        console.error('Failed to analyze transcript', err);
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the transcript. Please try again.",
          variant: "destructive"
        });
      } finally {
        setAnalyzingLoading(false);
      }
    }
  };

  const handleApproveAction = async (actionIndex: number) => {
    if (!aiAnalysis) return;
    
    if (mode === 'demo') {
      toast({
        title: "Demo Mode",
        description: "This is a demo in mock mode. No Jira actions will be performed.",
        variant: "destructive"
      });
      return;
    }

    const action = aiAnalysis.analysis.actions[actionIndex];
    setAnalyzingLoading(true);

    try {
      if (action.action_type === 'create' || !action.jira_issue_key) {
        // Create new Jira issue
        const createResponse = await fetch('http://localhost:8000/jira/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: action.summary,
            description: `${action.description}\n\nAcceptance Criteria:\n${action.acceptance_criteria.map(c => `- ${c}`).join('\n')}`,
            issue_type: 'Story',
            project_key: 'PROJ',
            labels: ['planflow-ai', 'from-meeting'],
            priority: 'Medium'
          })
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create Jira issue');
        }

        const createData = await createResponse.json();
        const newKey = createData.key;

        // Link dependencies
        for (const depKey of action.dependencies) {
          await fetch('http://localhost:8000/jira/issue-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inward_issue_key: depKey,
              outward_issue_key: newKey,
              link_type: 'Relates'
            })
          });
        }

        // Update local state
        const updatedAnalysis = { ...aiAnalysis };
        updatedAnalysis.analysis.actions[actionIndex] = {
          ...action,
          jira_created_key: newKey,
          jira_issue_key: newKey,
          status: 'approved'
        };
        setAiAnalysis(updatedAnalysis);

        toast({
          title: "Jira Issue Created",
          description: `Successfully created ${newKey}`
        });
      } else {
        // Update existing Jira issue
        const updateResponse = await fetch(
          `http://localhost:8000/jira/issue/${action.jira_issue_key}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              summary: action.summary,
              description: `${action.description}\n\nAcceptance Criteria:\n${action.acceptance_criteria.map(c => `- ${c}`).join('\n')}`,
              labels: ['planflow-ai', 'updated-from-meeting']
            })
          }
        );

        if (!updateResponse.ok) {
          throw new Error('Failed to update Jira issue');
        }

        // Link dependencies
        for (const depKey of action.dependencies) {
          await fetch('http://localhost:8000/jira/issue-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inward_issue_key: depKey,
              outward_issue_key: action.jira_issue_key,
              link_type: 'Relates'
            })
          });
        }

        // Update local state
        const updatedAnalysis = { ...aiAnalysis };
        updatedAnalysis.analysis.actions[actionIndex] = {
          ...action,
          status: 'approved'
        };
        setAiAnalysis(updatedAnalysis);

        toast({
          title: "Jira Issue Updated",
          description: `Successfully updated ${action.jira_issue_key}`
        });
      }
    } catch (err) {
      console.error('Failed to process Jira action', err);
      toast({
        title: "Jira Action Failed",
        description: "Could not process the Jira action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingLoading(false);
    }
  };

  const handleRejectAction = (actionIndex: number) => {
    if (!aiAnalysis) return;
    const updatedAnalysis = { ...aiAnalysis };
    updatedAnalysis.analysis.actions[actionIndex].status = 'rejected';
    setAiAnalysis(updatedAnalysis);
  };

  const updateActionField = (actionIndex: number, field: keyof AIAction, value: any) => {
    if (!aiAnalysis) return;
    const updatedAnalysis = { ...aiAnalysis };
    (updatedAnalysis.analysis.actions[actionIndex] as any)[field] = value;
    setAiAnalysis(updatedAnalysis);
  };

  return (
    <AppLayout pageTitle="Meetings">
      <div className="space-y-6">
        {/* Meetings Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fireflies Transcripts</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Target Sprint:</label>
              <Input
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                placeholder="Sprint 21"
                className="w-32"
              />
            </div>
          </div>
          {loading && <div className="text-sm text-muted-foreground mb-4">Loading...</div>}
          {error && <div className="text-sm text-destructive mb-4">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Meeting Type</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">{meeting.title}</TableCell>
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>
                    <Select
                      value={meeting.type}
                      onValueChange={(value) =>
                        handleTypeChange(meeting.id, value as Meeting["type"])
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sprint Planning">
                          Sprint Planning
                        </SelectItem>
                        <SelectItem value="PBR">PBR</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(meeting)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Meeting Details Panel */}
        {selectedMeeting && (
          <div className="space-y-6">
            {analyzingLoading && (
              <Card className="p-6">
                <div className="text-center text-muted-foreground">
                  Analyzing transcript with AI...
                </div>
              </Card>
            )}

            {aiAnalysis && (
              <>
                {/* AI Sprint Actions Section */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">AI Sprint Actions</h3>
                  <div className="space-y-4">
                    {aiAnalysis.analysis.actions.map((action, idx) => (
                      <Card key={idx} className="p-4 border-2" style={{
                        borderColor: action.status === 'approved' ? 'hsl(var(--primary))' : 
                                    action.status === 'rejected' ? 'hsl(var(--destructive))' : 
                                    'hsl(var(--border))'
                      }}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={action.action_type === 'create' ? 'default' : 'secondary'}>
                                  {action.action_type === 'create' ? 'Create Ticket' : 'Update Ticket'}
                                </Badge>
                                {action.jira_issue_key && (
                                  <a
                                    href={`https://your-jira-instance.atlassian.net/browse/${action.jira_issue_key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                  >
                                    {action.jira_issue_key}
                                  </a>
                                )}
                                {action.jira_created_key && (
                                  <Badge variant="outline" className="bg-green-50">
                                    Created: {action.jira_created_key}
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {action.status}
                                </Badge>
                              </div>
                              
                              {editingAction === idx ? (
                                <div className="space-y-2">
                                  <Input
                                    value={action.summary}
                                    onChange={(e) => updateActionField(idx, 'summary', e.target.value)}
                                    placeholder="Summary"
                                  />
                                  <Textarea
                                    value={action.description}
                                    onChange={(e) => updateActionField(idx, 'description', e.target.value)}
                                    placeholder="Description"
                                    rows={3}
                                  />
                                  <Textarea
                                    value={action.acceptance_criteria.join('\n')}
                                    onChange={(e) => updateActionField(idx, 'acceptance_criteria', e.target.value.split('\n'))}
                                    placeholder="Acceptance Criteria (one per line)"
                                    rows={3}
                                  />
                                  <Input
                                    value={action.target_sprint}
                                    onChange={(e) => updateActionField(idx, 'target_sprint', e.target.value)}
                                    placeholder="Target Sprint"
                                  />
                                  <Input
                                    value={action.dependencies.join(', ')}
                                    onChange={(e) => updateActionField(idx, 'dependencies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="Dependencies (comma-separated Jira keys)"
                                  />
                                  <Input
                                    value={action.assignee}
                                    onChange={(e) => updateActionField(idx, 'assignee', e.target.value)}
                                    placeholder="Assignee"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <h4 className="font-medium">{action.summary}</h4>
                                  <p className="text-sm text-muted-foreground">{action.description}</p>
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Acceptance Criteria:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                      {action.acceptance_criteria.map((criteria, cidx) => (
                                        <li key={cidx} className="text-sm">{criteria}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span><strong>Sprint:</strong> {action.target_sprint}</span>
                                    <span><strong>Assignee:</strong> {action.assignee}</span>
                                    {action.dependencies.length > 0 && (
                                      <span><strong>Dependencies:</strong> {action.dependencies.join(', ')}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAction(editingAction === idx ? null : idx)}
                            >
                              {editingAction === idx ? 'Save' : 'Edit'}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveAction(idx)}
                              disabled={action.status === 'approved' || analyzingLoading}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectAction(idx)}
                              disabled={action.status === 'rejected'}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Minutes of Meeting Section */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Minutes of Meeting</h3>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {aiAnalysis.analysis.minutes_of_meeting}
                  </p>
                </Card>

                {/* Actions by Member Section */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Actions by Member</h3>
                  <div className="space-y-4">
                    {aiAnalysis.analysis.actions_by_member.map((member, idx) => (
                      <div key={idx}>
                        <h4 className="font-semibold text-sm mb-2">{member.member}</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {member.items.map((item, iidx) => (
                            <li key={iidx} className="text-sm text-muted-foreground">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
