import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useContextPages } from "@/contexts/ContextPagesContext";
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
  const { selectedContextPages } = useContextPages();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [sprintName, setSprintName] = useState("Sprint 21");
  const [loading, setLoading] = useState(false);
  const [analyzingLoading, setAnalyzingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<number | null>(null);
  
  // Jira configuration state
  const [projects, setProjects] = useState<Array<{ id: string; key: string; name: string }>>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>("");
  const [boards, setBoards] = useState<Array<{ id: number; name: string; type: string }>>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [sprints, setSprints] = useState<Array<{ id: number; name: string; state: string }>>([]);
  const [selectedSprintName, setSelectedSprintName] = useState<string>("");
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);

  // Fetch Jira projects on mount
  useEffect(() => {
    if (mode === 'real') {
      fetchProjects();
    }
  }, [mode]);

  // Fetch boards when project changes
  useEffect(() => {
    if (mode === 'real' && selectedProjectKey) {
      fetchBoards(selectedProjectKey);
    } else {
      setBoards([]);
      setSelectedBoardId(null);
    }
  }, [selectedProjectKey, mode]);

  // Fetch sprints when board changes
  useEffect(() => {
    if (mode === 'real' && selectedBoardId) {
      fetchSprints(selectedBoardId);
    } else {
      setSprints([]);
      setSelectedSprintName("");
      setSelectedSprintId(null);
    }
  }, [selectedBoardId, mode]);

  useEffect(() => {
    if (mode === 'demo') {
      setMeetings(mockMeetings);
    } else if (mode === 'real') {
      fetchMeetings();
    }
  }, [mode]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:8000/jira/projects');
      const data = await response.json();
      setProjects(data.values || []);
      // Auto-select first project if available
      if (data.values && data.values.length > 0) {
        setSelectedProjectKey(data.values[0].key);
      }
    } catch (err) {
      console.error('Failed to fetch Jira projects', err);
      toast({
        title: "Failed to fetch projects",
        description: "Could not load Jira projects.",
        variant: "destructive"
      });
    }
  };

  const fetchBoards = async (projectKey: string) => {
    try {
      const response = await fetch(`http://localhost:8000/jira/boards?project_key=${projectKey}`);
      const data = await response.json();
      setBoards(data.values || []);
      // Auto-select first board if available
      if (data.values && data.values.length > 0) {
        setSelectedBoardId(data.values[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch Jira boards', err);
      toast({
        title: "Failed to fetch boards",
        description: "Could not load Jira boards for this project.",
        variant: "destructive"
      });
    }
  };

  const fetchSprints = async (boardId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/jira/sprints?board_id=${boardId}&state=active,future`);
      const data = await response.json();
      setSprints(data.values || []);
      // Auto-select first active sprint if available
      if (data.values && data.values.length > 0) {
        const activeSprint = data.values.find((s: any) => s.state === 'active') || data.values[0];
        setSelectedSprintName(activeSprint.name);
        setSelectedSprintId(activeSprint.id);
      }
    } catch (err) {
      console.error('Failed to fetch Jira sprints', err);
      toast({
        title: "Failed to fetch sprints",
        description: "Could not load sprints for this board.",
        variant: "destructive"
      });
    }
  };

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
              sprint_name: selectedSprintName || null,
              participants: [],
              context_page_ids: selectedContextPages.map(p => p.id)
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
      // Simulate success in demo mode
      const updatedAnalysis = { ...aiAnalysis };
      updatedAnalysis.analysis.actions[actionIndex] = {
        ...updatedAnalysis.analysis.actions[actionIndex],
        status: 'approved',
        jira_created_key: 'DEMO-123'
      };
      setAiAnalysis(updatedAnalysis);
      toast({
        title: "Demo Mode",
        description: "Simulated Jira creation: DEMO-123",
      });
      return;
    }

    const action = aiAnalysis.analysis.actions[actionIndex];
    setAnalyzingLoading(true);

    try {
      if (action.action_type === 'create' || !action.jira_issue_key) {
        // Create new Jira issue
        const description = `${action.description}\n\nAcceptance Criteria:\n${action.acceptance_criteria.map(c => `- ${c}`).join('\n')}`;
        
        const createResponse = await fetch('http://localhost:8000/jira/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: action.summary,
            description: description,
            issue_type: 'Story',
            project_key: selectedProjectKey || 'PROJ',
            labels: ['planflow-ai', 'from-meeting'],
            priority: 'Medium'
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create Jira issue');
        }

        const createData = await createResponse.json();
        const newKey = createData.key;

        // Link dependencies
        if (action.dependencies.length > 0) {
          for (const depKey of action.dependencies) {
            try {
              await fetch('http://localhost:8000/jira/issue-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  inward_issue_key: depKey,
                  outward_issue_key: newKey,
                  link_type: 'Relates'
                })
              });
            } catch (linkErr) {
              console.warn(`Failed to link dependency ${depKey}:`, linkErr);
            }
          }
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
        const description = `${action.description}\n\nAcceptance Criteria:\n${action.acceptance_criteria.map(c => `- ${c}`).join('\n')}`;
        
        const updateResponse = await fetch(
          `http://localhost:8000/jira/issue/${action.jira_issue_key}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              summary: action.summary,
              description: description,
              labels: ['planflow-ai', 'updated-from-meeting'],
              priority: 'Medium'
            })
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update Jira issue');
        }

        // Link dependencies
        if (action.dependencies.length > 0) {
          for (const depKey of action.dependencies) {
            try {
              await fetch('http://localhost:8000/jira/issue-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  inward_issue_key: depKey,
                  outward_issue_key: action.jira_issue_key,
                  link_type: 'Relates'
                })
              });
            } catch (linkErr) {
              console.warn(`Failed to link dependency ${depKey}:`, linkErr);
            }
          }
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
        description: err instanceof Error ? err.message : "Could not process the Jira action. Please try again.",
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
    toast({
      title: "Action Rejected",
      description: "This action has been rejected and will not be sent to Jira."
    });
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
        {/* Jira Configuration Section */}
        {mode === 'real' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Jira Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Project Dropdown */}
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.key}>
                        {project.key} – {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Board Dropdown */}
              <div>
                <label className="text-sm font-medium mb-2 block">Board</label>
                <Select 
                  value={selectedBoardId?.toString() || ""} 
                  onValueChange={(val) => setSelectedBoardId(parseInt(val))}
                  disabled={!selectedProjectKey || boards.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map(board => (
                      <SelectItem key={board.id} value={board.id.toString()}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sprint Dropdown */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sprint</label>
                <Select 
                  value={selectedSprintId?.toString() || ""} 
                  onValueChange={(val) => {
                    const sprintId = parseInt(val);
                    const sprint = sprints.find(s => s.id === sprintId);
                    if (sprint) {
                      setSelectedSprintId(sprintId);
                      setSelectedSprintName(sprint.name);
                    }
                  }}
                  disabled={!selectedBoardId || sprints.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.map(sprint => (
                      <SelectItem key={sprint.id} value={sprint.id.toString()}>
                        {sprint.name} ({sprint.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Text */}
            {selectedProjectKey && selectedBoardId && selectedSprintName && (
              <div className="mt-4 text-sm text-muted-foreground">
                Using Jira project: <span className="font-medium text-foreground">{selectedProjectKey}</span>, 
                board: <span className="font-medium text-foreground">{boards.find(b => b.id === selectedBoardId)?.name}</span>, 
                sprint: <span className="font-medium text-foreground">{selectedSprintName}</span>
              </div>
            )}
            
            {!selectedSprintName && selectedProjectKey && (
              <div className="mt-4 text-sm text-amber-600">
                ⚠️ No sprint selected – AI will not tag actions to a sprint.
              </div>
            )}
          </Card>
        )}
        
        {/* Meetings Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fireflies Transcripts</h3>
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
                    {aiAnalysis.analysis.actions.filter(a => a.status !== 'rejected').map((action, idx) => (
                      <Card key={idx} className="p-4 border-2" style={{
                        borderColor: action.status === 'approved' ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                        opacity: action.status === 'rejected' ? 0.5 : 1
                      }}>
                        <div className="space-y-4">
                          {/* Header with badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={action.action_type === 'create' ? 'default' : 'secondary'}>
                              {action.action_type === 'create' ? 'Create Ticket' : 'Update Existing Ticket'}
                            </Badge>
                            {action.jira_issue_key && !action.jira_created_key && (
                              <span className="text-sm text-muted-foreground">
                                Issue: <a
                                  href={`https://your-jira-instance.atlassian.net/browse/${action.jira_issue_key}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {action.jira_issue_key}
                                </a>
                              </span>
                            )}
                            {action.jira_created_key && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                Approved – Created {action.jira_created_key}
                              </Badge>
                            )}
                            {action.status === 'approved' && !action.jira_created_key && action.jira_issue_key && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                Approved – Updated {action.jira_issue_key}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Form fields */}
                          {editingAction === idx ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium mb-1 block">Summary</label>
                                <Input
                                  value={action.summary}
                                  onChange={(e) => updateActionField(idx, 'summary', e.target.value)}
                                  placeholder="Enter summary"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <Textarea
                                  value={action.description}
                                  onChange={(e) => updateActionField(idx, 'description', e.target.value)}
                                  placeholder="Enter description"
                                  rows={3}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Acceptance Criteria</label>
                                <Textarea
                                  value={action.acceptance_criteria.join('\n')}
                                  onChange={(e) => updateActionField(idx, 'acceptance_criteria', e.target.value.split('\n').filter(Boolean))}
                                  placeholder="One criterion per line"
                                  rows={4}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Target Sprint</label>
                                <Input
                                  value={action.target_sprint}
                                  onChange={(e) => updateActionField(idx, 'target_sprint', e.target.value)}
                                  placeholder="e.g., Sprint 21"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Dependencies</label>
                                <Input
                                  value={action.dependencies.join(', ')}
                                  onChange={(e) => updateActionField(idx, 'dependencies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  placeholder="Comma-separated Jira keys (e.g., PROJ-1, PROJ-2)"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Assignee</label>
                                <Input
                                  value={action.assignee}
                                  onChange={(e) => updateActionField(idx, 'assignee', e.target.value)}
                                  placeholder="Enter assignee name"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground">Summary</label>
                                <p className="text-sm font-medium mt-0.5">{action.summary}</p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                                <p className="text-sm mt-0.5">{action.description}</p>
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-muted-foreground">Acceptance Criteria</label>
                                <ul className="list-disc list-inside space-y-1 mt-0.5">
                                  {action.acceptance_criteria.map((criteria, cidx) => (
                                    <li key={cidx} className="text-sm">{criteria}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-semibold text-muted-foreground">Target Sprint</label>
                                  <p className="text-sm mt-0.5">{action.target_sprint}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-muted-foreground">Assignee</label>
                                  <p className="text-sm mt-0.5">{action.assignee}</p>
                                </div>
                              </div>
                              {action.dependencies.length > 0 && (
                                <div>
                                  <label className="text-xs font-semibold text-muted-foreground">Dependencies</label>
                                  <p className="text-sm mt-0.5">{action.dependencies.join(', ')}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAction(editingAction === idx ? null : idx)}
                              disabled={action.status === 'approved'}
                            >
                              {editingAction === idx ? 'Done Editing' : 'Edit'}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveAction(idx)}
                              disabled={action.status === 'approved' || analyzingLoading}
                            >
                              {analyzingLoading ? 'Applying...' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectAction(idx)}
                              disabled={action.status === 'approved'}
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
