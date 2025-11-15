import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface StoryPlan {
  action_type: "create";
  jira_issue_key: string | null;
  summary: string;
  description: string;
  acceptance_criteria: string[];
  target_sprint_index: number;
  dependencies: string[];
  assignee: string | null;
  status?: "pending" | "approved" | "rejected";
}

interface EpicPlan {
  epic_temp_id: string;
  epic_summary: string;
  epic_description: string;
  epic_acceptance_criteria: string[];
  jira_issue_key: string | null;
  status?: "pending" | "approved" | "rejected";
  stories: StoryPlan[];
}

interface QuarterPlan {
  quarter: string;
  quarter_goal: string;
  epics: EpicPlan[];
}

interface RoadmapPlan {
  project_key: string | null;
  sprints_per_quarter: number;
  quarters: QuarterPlan[];
}

export default function RoadmapPlanner() {
  const { mode } = useAuth();
  const { toast } = useToast();

  // Jira configuration
  const [projects, setProjects] = useState<Array<{ id: string; key: string; name: string }>>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>("");
  const [boards, setBoards] = useState<Array<{ id: number; name: string; type: string }>>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [sprints, setSprints] = useState<Array<{ id: number; name: string; state: string }>>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null);
  const [selectedSprintName, setSelectedSprintName] = useState<string>("");

  // Confluence pages
  const [roadmapPages, setRoadmapPages] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedRoadmapPageId, setSelectedRoadmapPageId] = useState<string>("");

  // Roadmap plan
  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  // Expanded states
  const [expandedQuarters, setExpandedQuarters] = useState<Record<string, boolean>>({});
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [editingEpics, setEditingEpics] = useState<Record<string, boolean>>({});
  const [editingStories, setEditingStories] = useState<Record<string, boolean>>({});

  // Fetch Jira projects on mount
  useEffect(() => {
    if (mode === "real") {
      fetch("http://localhost:8000/jira/projects")
        .then((res) => res.json())
        .then((data) => {
          setProjects(data.values || []);
          if (data.values?.length > 0) {
            setSelectedProjectKey(data.values[0].key);
          }
        })
        .catch((err) => console.error("Failed to fetch projects:", err));
    }
  }, [mode]);

  // Fetch boards when project changes
  useEffect(() => {
    if (mode === "real" && selectedProjectKey) {
      fetch(`http://localhost:8000/jira/boards?project_key=${selectedProjectKey}`)
        .then((res) => res.json())
        .then((data) => {
          setBoards(data.values || []);
          if (data.values?.length > 0) {
            setSelectedBoardId(data.values[0].id);
          }
        })
        .catch((err) => console.error("Failed to fetch boards:", err));
    }
  }, [selectedProjectKey, mode]);

  // Fetch sprints when board changes
  useEffect(() => {
    if (mode === "real" && selectedBoardId) {
      fetch(`http://localhost:8000/jira/sprints?board_id=${selectedBoardId}&state=active,future`)
        .then((res) => res.json())
        .then((data) => {
          setSprints(data.values || []);
          if (data.values?.length > 0) {
            setSelectedSprintId(data.values[0].id);
            setSelectedSprintName(data.values[0].name);
          }
        })
        .catch((err) => console.error("Failed to fetch sprints:", err));
    }
  }, [selectedBoardId, mode]);

  // Fetch Confluence pages on mount
  useEffect(() => {
    if (mode === "real") {
      fetch("http://localhost:8000/confluence/pages?limit=50")
        .then((res) => res.json())
        .then((data) => {
          setRoadmapPages(data.results || []);
        })
        .catch((err) => console.error("Failed to fetch Confluence pages:", err));
    }
  }, [mode]);

  const handleGeneratePlan = async () => {
    if (!selectedRoadmapPageId) return;

    setGenerating(true);
    try {
      if (mode === "demo") {
        // Demo mode mock response
        setTimeout(() => {
          setRoadmapPlan({
            project_key: selectedProjectKey || null,
            sprints_per_quarter: 6,
            quarters: [
              {
                quarter: "Q1",
                quarter_goal: "Establish MVP and core infrastructure",
                epics: [
                  {
                    epic_temp_id: "Q1-EPIC-1",
                    epic_summary: "User Authentication System",
                    epic_description: "Build complete authentication system with OAuth support",
                    epic_acceptance_criteria: [
                      "Users can sign up with email",
                      "OAuth integration for Google and GitHub",
                      "Session management with JWT"
                    ],
                    jira_issue_key: null,
                    status: "pending",
                    stories: [
                      {
                        action_type: "create",
                        jira_issue_key: null,
                        summary: "Implement email/password authentication",
                        description: "As a user, I want to sign up and log in with email and password so that I can access the application.\n\nContext Links:\n- https://confluence.example.com/auth-requirements",
                        acceptance_criteria: [
                          "Sign up form validation",
                          "Password hashing with bcrypt",
                          "JWT token generation on login"
                        ],
                        target_sprint_index: 1,
                        dependencies: [],
                        assignee: "Alice",
                        status: "pending"
                      }
                    ]
                  }
                ]
              }
            ]
          });
          setGenerating(false);
          toast({
            title: "Plan Generated",
            description: "AI has broken down your roadmap into epics and sprint stories.",
          });
        }, 1500);
        return;
      }

      // Real mode
      const response = await fetch("http://localhost:8000/ai/generate_roadmap_plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmap_page_id: selectedRoadmapPageId,
          project_key: selectedProjectKey || null,
          sprints_per_quarter: 6,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data: RoadmapPlan = await response.json();
      
      // Initialize status fields
      data.quarters.forEach((quarter) => {
        quarter.epics.forEach((epic) => {
          if (!epic.status) epic.status = "pending";
          epic.stories.forEach((story) => {
            if (!story.status) story.status = "pending";
          });
        });
      });

      setRoadmapPlan(data);
      toast({
        title: "Plan Generated",
        description: "AI has broken down your roadmap into epics and sprint stories.",
      });
    } catch (error) {
      console.error("Plan generation failed:", error);
      toast({
        title: "Plan generation failed",
        description: "Could not analyze the roadmap page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveEpic = async (quarterIdx: number, epicIdx: number) => {
    if (!roadmapPlan) return;

    const epic = roadmapPlan.quarters[quarterIdx].epics[epicIdx];
    if (epic.jira_issue_key) {
      toast({
        title: "Epic already created",
        description: `Epic ${epic.jira_issue_key} already exists in Jira.`,
      });
      return;
    }

    try {
      const description = `${epic.epic_description}\n\nEpic Acceptance Criteria:\n${epic.epic_acceptance_criteria.map(ac => `- ${ac}`).join('\n')}`;

      if (mode === "demo") {
        // Demo mode
        setTimeout(() => {
          const newKey = `DEMO-EPIC-${Date.now()}`;
          const updated = { ...roadmapPlan };
          updated.quarters[quarterIdx].epics[epicIdx].jira_issue_key = newKey;
          updated.quarters[quarterIdx].epics[epicIdx].status = "approved";
          setRoadmapPlan(updated);
          toast({
            title: "Epic created (Demo)",
            description: `Epic created in Jira — ${newKey}`,
          });
        }, 500);
        return;
      }

      // Real mode
      const response = await fetch("http://localhost:8000/jira/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: epic.epic_summary,
          description: description,
          issue_type: "Epic",
          project_key: selectedProjectKey || "SCRUM",
          labels: ["planflow-roadmap", "from-roadmap"],
          priority: "Medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create epic");
      }

      const result = await response.json();
      const newKey = result.key;

      const updated = { ...roadmapPlan };
      updated.quarters[quarterIdx].epics[epicIdx].jira_issue_key = newKey;
      updated.quarters[quarterIdx].epics[epicIdx].status = "approved";
      setRoadmapPlan(updated);

      toast({
        title: "Epic created in Jira",
        description: `Epic created — ${newKey}`,
      });
    } catch (error) {
      console.error("Failed to create epic:", error);
      toast({
        title: "Jira update failed",
        description: "Please check configuration or try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectEpic = (quarterIdx: number, epicIdx: number) => {
    if (!roadmapPlan) return;
    const updated = { ...roadmapPlan };
    updated.quarters[quarterIdx].epics[epicIdx].status = "rejected";
    setRoadmapPlan(updated);
    toast({
      title: "Epic rejected",
      description: "Epic has been marked as rejected.",
    });
  };

  const handleApproveStory = async (quarterIdx: number, epicIdx: number, storyIdx: number) => {
    if (!roadmapPlan) return;

    const epic = roadmapPlan.quarters[quarterIdx].epics[epicIdx];
    const story = epic.stories[storyIdx];

    if (!epic.jira_issue_key) {
      toast({
        title: "Epic not created",
        description: "Please approve and create the epic in Jira before creating stories under it.",
        variant: "destructive",
      });
      return;
    }

    if (story.jira_issue_key) {
      toast({
        title: "Story already created",
        description: `Story ${story.jira_issue_key} already exists in Jira.`,
      });
      return;
    }

    try {
      const description = `${story.description}\n\nAcceptance Criteria:\n${story.acceptance_criteria.map(ac => `- ${ac}`).join('\n')}`;

      if (mode === "demo") {
        // Demo mode
        setTimeout(() => {
          const newKey = `DEMO-${Date.now()}`;
          const updated = { ...roadmapPlan };
          updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].jira_issue_key = newKey;
          updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].status = "approved";
          setRoadmapPlan(updated);
          toast({
            title: "Story created (Demo)",
            description: `Story created in Jira — ${newKey}`,
          });
        }, 500);
        return;
      }

      // Real mode
      const response = await fetch("http://localhost:8000/jira/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: story.summary,
          description: description,
          issue_type: "Story",
          project_key: selectedProjectKey || "SCRUM",
          labels: ["planflow-roadmap-story", "from-roadmap"],
          priority: "Medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create story");
      }

      const result = await response.json();
      const newKey = result.key;

      const updated = { ...roadmapPlan };
      updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].jira_issue_key = newKey;
      updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].status = "approved";
      setRoadmapPlan(updated);

      // Link story to epic
      try {
        await fetch("http://localhost:8000/jira/issue-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inward_issue_key: epic.jira_issue_key,
            outward_issue_key: newKey,
            link_type: "Relates",
          }),
        });
      } catch (linkError) {
        console.error("Failed to link story to epic:", linkError);
      }

      // Link dependencies
      if (story.dependencies && story.dependencies.length > 0) {
        for (const depKey of story.dependencies) {
          if (depKey.trim()) {
            try {
              await fetch("http://localhost:8000/jira/issue-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  inward_issue_key: depKey.trim(),
                  outward_issue_key: newKey,
                  link_type: "Relates",
                }),
              });
            } catch (depError) {
              console.error(`Failed to link dependency ${depKey}:`, depError);
            }
          }
        }
      }

      toast({
        title: "Story created in Jira",
        description: `Story created — ${newKey}`,
      });
    } catch (error) {
      console.error("Failed to create story:", error);
      toast({
        title: "Jira update failed",
        description: "Please check configuration or try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectStory = (quarterIdx: number, epicIdx: number, storyIdx: number) => {
    if (!roadmapPlan) return;
    const updated = { ...roadmapPlan };
    updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].status = "rejected";
    setRoadmapPlan(updated);
    toast({
      title: "Story rejected",
      description: "Story has been marked as rejected.",
    });
  };

  const updateEpicField = (quarterIdx: number, epicIdx: number, field: string, value: any) => {
    if (!roadmapPlan) return;
    const updated = { ...roadmapPlan };
    (updated.quarters[quarterIdx].epics[epicIdx] as any)[field] = value;
    setRoadmapPlan(updated);
  };

  const updateStoryField = (quarterIdx: number, epicIdx: number, storyIdx: number, field: string, value: any) => {
    if (!roadmapPlan) return;
    const updated = { ...roadmapPlan };
    (updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx] as any)[field] = value;
    setRoadmapPlan(updated);
  };

  return (
    <AppLayout pageTitle="Roadmap Sprint Planner">
      <div className="space-y-6">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select Jira project and Confluence roadmap page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Jira Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((proj) => (
                      <SelectItem key={proj.id} value={proj.key}>
                        {proj.key} – {proj.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Board</label>
                <Select
                  value={selectedBoardId?.toString() || ""}
                  onValueChange={(val) => setSelectedBoardId(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id.toString()}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sprint</label>
                <Select
                  value={selectedSprintId?.toString() || ""}
                  onValueChange={(val) => {
                    const sprint = sprints.find((s) => s.id === parseInt(val));
                    if (sprint) {
                      setSelectedSprintId(sprint.id);
                      setSelectedSprintName(sprint.name);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id.toString()}>
                        {sprint.name} ({sprint.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedProjectKey && selectedBoardId && selectedSprintName && (
              <p className="text-sm text-muted-foreground">
                Using Jira project: {selectedProjectKey}, board: {boards.find(b => b.id === selectedBoardId)?.name}, sprint: {selectedSprintName}
              </p>
            )}

            {/* Confluence Roadmap Page */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Roadmap Source (Confluence Page)</label>
              <Select value={selectedRoadmapPageId} onValueChange={setSelectedRoadmapPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select roadmap page" />
                </SelectTrigger>
                <SelectContent>
                  {roadmapPages.map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGeneratePlan}
              disabled={!selectedRoadmapPageId || generating}
            >
              {generating ? "Generating roadmap plan with AI..." : "Generate Epics & Sprint Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* Roadmap Plan Display */}
        {!roadmapPlan && !generating && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Select a roadmap page from Confluence, then click 'Generate Epics & Sprint Plan'.
            </CardContent>
          </Card>
        )}

        {generating && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium">Generating roadmap plan with AI...</p>
            </CardContent>
          </Card>
        )}

        {/* Quarters Display */}
        {roadmapPlan && (
          <div className="space-y-6">
            {roadmapPlan.quarters.map((quarter, qIdx) => (
              <Card key={quarter.quarter}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">{quarter.quarter}</Badge>
                        {quarter.quarter_goal}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedQuarters((prev) => ({
                          ...prev,
                          [quarter.quarter]: !prev[quarter.quarter],
                        }))
                      }
                    >
                      {expandedQuarters[quarter.quarter] ? <ChevronDown /> : <ChevronRight />}
                    </Button>
                  </div>
                </CardHeader>

                {(expandedQuarters[quarter.quarter] ?? true) && (
                  <CardContent className="space-y-4">
                    {/* Epics */}
                    {quarter.epics.map((epic, eIdx) => {
                      const epicKey = `${quarter.quarter}-${epic.epic_temp_id}`;
                      const isEditing = editingEpics[epicKey];
                      const isRejected = epic.status === "rejected";
                      const isApproved = epic.status === "approved";

                      return (
                        <Card key={epic.epic_temp_id} className={isRejected ? "opacity-50" : ""}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge>Epic</Badge>
                                  {epic.jira_issue_key && (
                                    <Badge variant="secondary">{epic.jira_issue_key}</Badge>
                                  )}
                                  {isApproved && <Badge variant="default">Approved</Badge>}
                                  {isRejected && <Badge variant="destructive">Rejected</Badge>}
                                </div>

                                {isEditing ? (
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Epic Summary</label>
                                      <Input
                                        value={epic.epic_summary}
                                        onChange={(e) =>
                                          updateEpicField(qIdx, eIdx, "epic_summary", e.target.value)
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Epic Description</label>
                                      <Textarea
                                        value={epic.epic_description}
                                        onChange={(e) =>
                                          updateEpicField(qIdx, eIdx, "epic_description", e.target.value)
                                        }
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Epic Acceptance Criteria</label>
                                      <Textarea
                                        value={epic.epic_acceptance_criteria.join("\n")}
                                        onChange={(e) =>
                                          updateEpicField(
                                            qIdx,
                                            eIdx,
                                            "epic_acceptance_criteria",
                                            e.target.value.split("\n")
                                          )
                                        }
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <CardTitle className="text-lg">{epic.epic_summary}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{epic.epic_description}</p>
                                    <div>
                                      <p className="text-sm font-medium">Epic Acceptance Criteria:</p>
                                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {epic.epic_acceptance_criteria.map((ac, idx) => (
                                          <li key={idx}>{ac}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                {!isApproved && !isRejected && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setEditingEpics((prev) => ({
                                          ...prev,
                                          [epicKey]: !prev[epicKey],
                                        }))
                                      }
                                    >
                                      {isEditing ? "Done" : "Edit"}
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleApproveEpic(qIdx, eIdx)}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleRejectEpic(qIdx, eIdx)}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          {/* Stories under Epic */}
                          {epic.stories.length > 0 && (
                            <CardContent>
                              <div className="space-y-4">
                                <p className="text-sm font-medium">Stories (Sprint Backlog):</p>
                                {epic.stories.map((story, sIdx) => {
                                  const storyKey = `${epicKey}-story-${sIdx}`;
                                  const storyEditing = editingStories[storyKey];
                                  const storyRejected = story.status === "rejected";
                                  const storyApproved = story.status === "approved";

                                  if (storyRejected) return null;

                                  return (
                                    <Card key={sIdx} className="bg-muted/30">
                                      <CardContent className="pt-4 space-y-2">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline">Story</Badge>
                                              {story.jira_issue_key && (
                                                <Badge variant="secondary">{story.jira_issue_key}</Badge>
                                              )}
                                              {storyApproved && <Badge variant="default">Approved</Badge>}
                                            </div>

                                            {storyEditing ? (
                                              <div className="space-y-2">
                                                <div>
                                                  <label className="text-sm font-medium">Summary</label>
                                                  <Input
                                                    value={story.summary}
                                                    onChange={(e) =>
                                                      updateStoryField(qIdx, eIdx, sIdx, "summary", e.target.value)
                                                    }
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Description</label>
                                                  <Textarea
                                                    value={story.description}
                                                    onChange={(e) =>
                                                      updateStoryField(qIdx, eIdx, sIdx, "description", e.target.value)
                                                    }
                                                    rows={3}
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Acceptance Criteria</label>
                                                  <Textarea
                                                    value={story.acceptance_criteria.join("\n")}
                                                    onChange={(e) =>
                                                      updateStoryField(
                                                        qIdx,
                                                        eIdx,
                                                        sIdx,
                                                        "acceptance_criteria",
                                                        e.target.value.split("\n")
                                                      )
                                                    }
                                                    rows={3}
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Target Sprint Index</label>
                                                  <Input
                                                    type="number"
                                                    value={story.target_sprint_index}
                                                    onChange={(e) =>
                                                      updateStoryField(
                                                        qIdx,
                                                        eIdx,
                                                        sIdx,
                                                        "target_sprint_index",
                                                        parseInt(e.target.value)
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Dependencies</label>
                                                  <Input
                                                    value={story.dependencies.join(", ")}
                                                    onChange={(e) =>
                                                      updateStoryField(
                                                        qIdx,
                                                        eIdx,
                                                        sIdx,
                                                        "dependencies",
                                                        e.target.value.split(",").map((d) => d.trim())
                                                      )
                                                    }
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Assignee</label>
                                                  <Input
                                                    value={story.assignee || ""}
                                                    onChange={(e) =>
                                                      updateStoryField(qIdx, eIdx, sIdx, "assignee", e.target.value)
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="space-y-1">
                                                <p className="font-medium">{story.summary}</p>
                                                <p className="text-sm text-muted-foreground">
                                                  Target Sprint: Sprint {story.target_sprint_index}
                                                </p>
                                                <p className="text-sm whitespace-pre-wrap">{story.description}</p>
                                                <div>
                                                  <p className="text-sm font-medium">Acceptance Criteria:</p>
                                                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                    {story.acceptance_criteria.map((ac, idx) => (
                                                      <li key={idx}>{ac}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                                {story.assignee && (
                                                  <p className="text-sm">
                                                    <span className="font-medium">Assignee:</span> {story.assignee}
                                                  </p>
                                                )}
                                                {story.dependencies.length > 0 && (
                                                  <p className="text-sm">
                                                    <span className="font-medium">Dependencies:</span>{" "}
                                                    {story.dependencies.join(", ")}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex gap-2">
                                            {!storyApproved && (
                                              <>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    setEditingStories((prev) => ({
                                                      ...prev,
                                                      [storyKey]: !prev[storyKey],
                                                    }))
                                                  }
                                                >
                                                  {storyEditing ? "Done" : "Edit"}
                                                </Button>
                                                <Button
                                                  variant="default"
                                                  size="sm"
                                                  onClick={() => handleApproveStory(qIdx, eIdx, sIdx)}
                                                >
                                                  Approve
                                                </Button>
                                                <Button
                                                  variant="destructive"
                                                  size="sm"
                                                  onClick={() => handleRejectStory(qIdx, eIdx, sIdx)}
                                                >
                                                  Reject
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
