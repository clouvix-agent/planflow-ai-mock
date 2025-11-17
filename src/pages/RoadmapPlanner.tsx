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
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
  sprint_name?: string;
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

  const [projects, setProjects] = useState<Array<{ id: string; key: string; name: string }>>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>("");
  const [boards, setBoards] = useState<Array<{ id: number; name: string; type: string }>>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [roadmapPages, setRoadmapPages] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedRoadmapPageId, setSelectedRoadmapPageId] = useState<string>("");
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>(["Q1"]);
  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [expandedQuarters, setExpandedQuarters] = useState<Record<string, boolean>>({});
  const [expandedEpicIds, setExpandedEpicIds] = useState<Record<string, boolean>>({});
  const [editingEpics, setEditingEpics] = useState<Record<string, boolean>>({});
  const [editingStories, setEditingStories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (mode === "real") {
      fetch("http://localhost:8000/jira/projects")
        .then((res) => res.json())
        .then((data) => {
          setProjects(data.values || []);
          if (data.values?.length > 0) setSelectedProjectKey(data.values[0].key);
        })
        .catch((err) => console.error("Failed to fetch projects:", err));
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "real" && selectedProjectKey) {
      fetch(`http://localhost:8000/jira/boards?project_key=${selectedProjectKey}`)
        .then((res) => res.json())
        .then((data) => {
          setBoards(data.values || []);
          if (data.values?.length > 0) setSelectedBoardId(data.values[0].id);
        })
        .catch((err) => console.error("Failed to fetch boards:", err));
    }
  }, [selectedProjectKey, mode]);

  useEffect(() => {
    if (mode === "real") {
      fetch("http://localhost:8000/confluence/pages?limit=50")
        .then((res) => res.json())
        .then((data) => setRoadmapPages(data.results || []))
        .catch((err) => console.error("Failed to fetch Confluence pages:", err));
    }
  }, [mode]);

  const handleGeneratePlan = async () => {
    if (!selectedRoadmapPageId) return;
    setGenerating(true);
    
    try {
      if (mode === "demo") {
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
                    epic_acceptance_criteria: ["Users can sign up with email", "OAuth integration for Google and GitHub", "Session management with JWT"],
                    jira_issue_key: null,
                    status: "pending",
                    stories: [
                      {
                        action_type: "create",
                        jira_issue_key: null,
                        summary: "Implement email/password authentication",
                        description: "As a user, I want to sign up and log in with email and password so that I can access the application.\n\nContext Links:\n- https://confluence.example.com/auth-requirements",
                        acceptance_criteria: ["Sign up form validation", "Password hashing with bcrypt", "JWT token generation on login"],
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
          toast({ title: "Plan Generated", description: "AI has broken down your roadmap into epics and sprint stories." });
        }, 1500);
        return;
      }

      const response = await fetch("http://localhost:8000/ai/generate_roadmap_plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmap_page_id: selectedRoadmapPageId,
          project_key: selectedProjectKey || null,
          sprints_per_quarter: 6,
          quarters_to_include: selectedQuarters,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");
      const data: RoadmapPlan = await response.json();
      
      data.quarters.forEach((quarter) => {
        quarter.epics.forEach((epic) => {
          if (!epic.status) epic.status = "pending";
          epic.stories.forEach((story) => { if (!story.status) story.status = "pending"; });
        });
      });

      setRoadmapPlan(data);
      setGenerating(false);
      toast({ title: "Plan Generated", description: "AI has broken down your roadmap into epics and sprint stories." });
    } catch (error) {
      console.error("Failed to generate plan:", error);
      setGenerating(false);
      toast({ title: "Plan generation failed", description: "Could not analyze the roadmap page. Please try again.", variant: "destructive" });
    }
  };

  const handleApproveEpic = async (quarterIdx: number, epicIdx: number) => {
    if (!roadmapPlan) return;
    const epic = roadmapPlan.quarters[quarterIdx].epics[epicIdx];

    try {
      const description = `${epic.epic_description}\n\nEpic Acceptance Criteria:\n${epic.epic_acceptance_criteria.map((ac) => `- ${ac}`).join("\n")}`;

      if (mode === "demo") {
        setTimeout(() => {
          const newKey = `DEMO-EPIC-${Date.now()}`;
          const updated = { ...roadmapPlan };
          updated.quarters[quarterIdx].epics[epicIdx].jira_issue_key = newKey;
          updated.quarters[quarterIdx].epics[epicIdx].status = "approved";
          setRoadmapPlan(updated);
          toast({ title: "Epic created (Demo)", description: `Epic created in Jira — ${newKey}` });
        }, 500);
        return;
      }

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

      if (!response.ok) throw new Error("Failed to create epic");
      const result = await response.json();

      const updated = { ...roadmapPlan };
      updated.quarters[quarterIdx].epics[epicIdx].jira_issue_key = result.key;
      updated.quarters[quarterIdx].epics[epicIdx].status = "approved";
      setRoadmapPlan(updated);
      toast({ title: "Epic created in Jira", description: `Epic created — ${result.key}` });
    } catch (error) {
      console.error("Failed to create epic:", error);
      toast({ title: "Jira update failed", description: "Please check configuration or try again.", variant: "destructive" });
    }
  };

  const handleRejectEpic = (quarterIdx: number, epicIdx: number) => {
    if (!roadmapPlan) return;
    const updated = { ...roadmapPlan };
    updated.quarters[quarterIdx].epics[epicIdx].status = "rejected";
    setRoadmapPlan(updated);
    toast({ title: "Epic rejected", description: "Epic has been marked as rejected." });
  };

  const handleApproveStory = async (quarterIdx: number, epicIdx: number, storyIdx: number) => {
    if (!roadmapPlan) return;
    const quarter = roadmapPlan.quarters[quarterIdx];
    const epic = quarter.epics[epicIdx];
    const story = epic.stories[storyIdx];

    if (!epic.jira_issue_key) {
      toast({ title: "Epic not created", description: "Please approve and create the epic in Jira before creating stories under it.", variant: "destructive" });
      return;
    }

    if (!selectedProjectKey || !selectedBoardId) {
      toast({ title: "Configuration required", description: "Please select a Jira project and board before creating stories.", variant: "destructive" });
      return;
    }

    try {
      if (mode === "demo") {
        setTimeout(() => {
          const newKey = `DEMO-${Date.now()}`;
          const sprintName = `${quarter.quarter} - Sprint ${story.target_sprint_index}`;
          const updated = { ...roadmapPlan };
          updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].jira_issue_key = newKey;
          updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].status = "approved";
          updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].sprint_name = sprintName;
          setRoadmapPlan(updated);
          toast({ title: "Story created (Demo)", description: `Created ${newKey} in ${sprintName}` });
        }, 500);
        return;
      }

      const response = await fetch("http://localhost:8000/roadmap/create_story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_key: selectedProjectKey || "SCRUM",
          board_id: selectedBoardId,
          quarter: quarter.quarter,
          target_sprint_index: story.target_sprint_index,
          summary: story.summary,
          description: story.description,
          acceptance_criteria: story.acceptance_criteria,
          labels: ["planflow-roadmap-story", "from-roadmap"],
          priority: "Medium",
        }),
      });

      if (!response.ok) throw new Error("Failed to create story");
      const result = await response.json();

      const updated = { ...roadmapPlan };
      updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].jira_issue_key = result.issue.key;
      updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].status = "approved";
      updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].sprint_name = result.sprint_name;
      setRoadmapPlan(updated);

      await fetch("http://localhost:8000/jira/issue-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inward_issue_key: epic.jira_issue_key, outward_issue_key: result.issue.key, link_type: "Relates" }),
      }).catch(console.error);

      if (story.dependencies?.length > 0) {
        for (const depKey of story.dependencies) {
          if (depKey.trim()) {
            await fetch("http://localhost:8000/jira/issue-link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ inward_issue_key: depKey.trim(), outward_issue_key: result.issue.key, link_type: "Relates" }),
            }).catch(console.error);
          }
        }
      }

      toast({ title: "Story created", description: `Created ${result.issue.key} in ${result.sprint_name}` });
    } catch (error) {
      console.error("Failed to create story:", error);
      toast({ title: "Jira update failed", description: "Please check configuration or try again.", variant: "destructive" });
    }
  };

  const handleRejectStory = (quarterIdx: number, epicIdx: number, storyIdx: number) => {
    if (!roadmapPlan) return;
    const updated = { ...roadmapPlan };
    updated.quarters[quarterIdx].epics[epicIdx].stories[storyIdx].status = "rejected";
    setRoadmapPlan(updated);
    toast({ title: "Story rejected", description: "Story has been marked as rejected." });
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

  const toggleQuarter = (quarter: string) => {
    setSelectedQuarters((prev) => {
      if (prev.includes(quarter)) {
        if (prev.length === 1) return prev;
        return prev.filter((q) => q !== quarter);
      }
      return [...prev, quarter].sort();
    });
  };

  const quarterBgClass = (quarter: string) => ({
    Q1: "bg-sky-50 dark:bg-sky-950/20",
    Q2: "bg-emerald-50 dark:bg-emerald-950/20",
    Q3: "bg-amber-50 dark:bg-amber-950/20",
    Q4: "bg-rose-50 dark:bg-rose-950/20",
  }[quarter] || "bg-muted");

  return (
    <AppLayout pageTitle="Roadmap Sprint Planner">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select Jira project and Confluence roadmap page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((proj) => <SelectItem key={proj.id} value={proj.key}>{proj.key} – {proj.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Board</label>
                <Select value={selectedBoardId?.toString() || ""} onValueChange={(val) => setSelectedBoardId(parseInt(val))}>
                  <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => <SelectItem key={board.id} value={board.id.toString()}>{board.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedProjectKey && selectedBoardId && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  Sprints will be auto-created per quarter (e.g. Q1 - Sprint 1, Q1 - Sprint 2) based on your roadmap. 
                  Approved stories are added to the appropriate sprint automatically.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Roadmap Source (Confluence Page)</label>
              <Select value={selectedRoadmapPageId} onValueChange={setSelectedRoadmapPageId}>
                <SelectTrigger><SelectValue placeholder="Select roadmap page" /></SelectTrigger>
                <SelectContent>
                  {roadmapPages.map((page) => <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quarters to Generate</label>
              <div className="flex gap-2">
                {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                  <Button key={quarter} variant={selectedQuarters.includes(quarter) ? "default" : "outline"} size="sm" onClick={() => toggleQuarter(quarter)} className="min-w-[60px]">
                    {quarter}
                  </Button>
                ))}
              </div>
              {selectedQuarters.length === 0 && <p className="text-xs text-destructive">At least one quarter must be selected</p>}
            </div>

            <Button onClick={handleGeneratePlan} disabled={!selectedRoadmapPageId || generating || selectedQuarters.length === 0} className="w-full">
              {generating ? "Generating..." : "Generate Epics & Sprint Plan"}
            </Button>
          </CardContent>
        </Card>

        {generating && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Generating roadmap plan with AI...</p>
            </CardContent>
          </Card>
        )}

        {!roadmapPlan && !generating && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Select a roadmap page from Confluence, then click 'Generate Epics & Sprint Plan'.</p>
            </CardContent>
          </Card>
        )}

        {roadmapPlan && !generating && (
          <div className="space-y-6">
            {roadmapPlan.quarters.map((quarter, qIdx) => (
              <Card key={quarter.quarter} className={cn("overflow-hidden border rounded-xl", quarterBgClass(quarter.quarter))}>
                <CardHeader className="cursor-pointer" onClick={() => setExpandedQuarters((prev) => ({ ...prev, [quarter.quarter]: !(prev[quarter.quarter] ?? false) }))}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{quarter.quarter}</CardTitle>
                      <CardDescription className="mt-1">{quarter.quarter_goal}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      {(expandedQuarters[quarter.quarter] ?? false) ? <ChevronDown /> : <ChevronRight />}
                    </Button>
                  </div>
                </CardHeader>

                {(expandedQuarters[quarter.quarter] ?? false) && (
                  <CardContent className="space-y-4">
                    {quarter.epics.map((epic, eIdx) => {
                      const epicKey = epic.epic_temp_id;
                      const isEditing = editingEpics[epicKey];
                      const isRejected = epic.status === "rejected";
                      const isApproved = epic.status === "approved";
                      const isExpanded = expandedEpicIds[epicKey] ?? false;

                      return (
                        <Card key={epic.epic_temp_id} className={cn("rounded-xl bg-white/80 dark:bg-slate-900/80 border shadow-sm", isApproved && "border-l-4 border-l-emerald-400", isRejected && "opacity-50")}>
                          <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpandedEpicIds((prev) => ({ ...prev, [epicKey]: !isExpanded }))}>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge>Epic</Badge>
                                {epic.jira_issue_key && <Badge variant="secondary">{epic.jira_issue_key}</Badge>}
                                {isApproved && <Badge variant="default">Approved</Badge>}
                                {isRejected && <Badge variant="destructive">Rejected</Badge>}
                              </div>
                              <p className="font-semibold text-lg">{epic.epic_summary}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedEpicIds((prev) => ({ ...prev, [epicKey]: !isExpanded })); }}>
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-4">
                              <div className="space-y-2">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-sm font-medium">Epic Summary</label>
                                      <Input value={epic.epic_summary} onChange={(e) => updateEpicField(qIdx, eIdx, "epic_summary", e.target.value)} />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Epic Description</label>
                                      <Textarea value={epic.epic_description} onChange={(e) => updateEpicField(qIdx, eIdx, "epic_description", e.target.value)} rows={3} />
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Epic Acceptance Criteria</label>
                                      <Textarea value={epic.epic_acceptance_criteria.join("\n")} onChange={(e) => updateEpicField(qIdx, eIdx, "epic_acceptance_criteria", e.target.value.split("\n"))} rows={3} />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="text-sm whitespace-pre-wrap">{epic.epic_description}</p>
                                    <div>
                                      <p className="text-sm font-medium">Epic Acceptance Criteria:</p>
                                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                                        {epic.epic_acceptance_criteria.map((ac, idx) => <li key={idx}>{ac}</li>)}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                {!isApproved && !isRejected && (
                                  <>
                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditingEpics((prev) => ({ ...prev, [epicKey]: !prev[epicKey] })); }}>
                                      {isEditing ? "Done" : "Edit"}
                                    </Button>
                                    <Button variant="default" size="sm" onClick={(e) => { e.stopPropagation(); handleApproveEpic(qIdx, eIdx); }}>Approve</Button>
                                    <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleRejectEpic(qIdx, eIdx); }}>Reject</Button>
                                  </>
                                )}
                              </div>

                              {epic.stories.length > 0 && (
                                <div className="space-y-3 pt-4 border-t">
                                  <p className="text-sm font-medium">Stories (Sprint Backlog):</p>
                                  {epic.stories.map((story, sIdx) => {
                                    const storyKey = `${epicKey}-story-${sIdx}`;
                                    const storyEditing = editingStories[storyKey];
                                    const storyRejected = story.status === "rejected";
                                    const storyApproved = story.status === "approved";

                                    if (storyRejected) return null;

                                    return (
                                      <Card key={sIdx} className={cn("p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700", storyApproved && "border-l-4 border-l-blue-400")}>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline">Story</Badge>
                                            {story.jira_issue_key && <Badge variant="secondary">{story.jira_issue_key}</Badge>}
                                            {storyApproved && <Badge variant="default">Approved</Badge>}
                                            {story.sprint_name && <Badge variant="outline" className="ml-auto">{story.sprint_name}</Badge>}
                                          </div>

                                          {storyEditing ? (
                                            <div className="space-y-2">
                                              <div><label className="text-sm font-medium">Summary</label><Input value={story.summary} onChange={(e) => updateStoryField(qIdx, eIdx, sIdx, "summary", e.target.value)} /></div>
                                              <div><label className="text-sm font-medium">Description</label><Textarea value={story.description} onChange={(e) => updateStoryField(qIdx, eIdx, sIdx, "description", e.target.value)} rows={3} /></div>
                                              <div><label className="text-sm font-medium">Acceptance Criteria</label><Textarea value={story.acceptance_criteria.join("\n")} onChange={(e) => updateStoryField(qIdx, eIdx, sIdx, "acceptance_criteria", e.target.value.split("\n"))} rows={3} /></div>
                                              <div><label className="text-sm font-medium">Target Sprint Index</label><Input type="number" value={story.target_sprint_index} onChange={(e) => updateStoryField(qIdx, eIdx, sIdx, "target_sprint_index", parseInt(e.target.value))} /></div>
                                              <div><label className="text-sm font-medium">Dependencies</label><Input value={story.dependencies.join(", ")} onChange={(e) => updateStoryField(qIdx, eIdx, sIdx, "dependencies", e.target.value.split(",").map((d) => d.trim()))} /></div>
                                              <div><label className="text-sm font-medium">Assignee</label><Input value={story.assignee || ""} onChange={(e) => updateStoryField(qIdx, eIdx, sIdx, "assignee", e.target.value)} /></div>
                                            </div>
                                          ) : (
                                            <div className="space-y-1">
                                              <p className="font-medium">{story.summary}</p>
                                              <p className="text-sm text-muted-foreground">Target Sprint: Sprint {story.target_sprint_index}</p>
                                              <p className="text-sm whitespace-pre-wrap">{story.description}</p>
                                              <div>
                                                <p className="text-sm font-medium">Acceptance Criteria:</p>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                  {story.acceptance_criteria.map((ac, idx) => <li key={idx}>{ac}</li>)}
                                                </ul>
                                              </div>
                                              {story.assignee && <p className="text-sm"><span className="font-medium">Assignee:</span> {story.assignee}</p>}
                                              {story.dependencies.length > 0 && <p className="text-sm"><span className="font-medium">Dependencies:</span> {story.dependencies.join(", ")}</p>}
                                            </div>
                                          )}

                                          <div className="flex gap-2 mt-3">
                                            {!storyApproved && (
                                              <>
                                                <Button variant="outline" size="sm" onClick={() => setEditingStories((prev) => ({ ...prev, [storyKey]: !prev[storyKey] }))}>
                                                  {storyEditing ? "Done" : "Edit"}
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleApproveStory(qIdx, eIdx, sIdx)}>Approve</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleRejectStory(qIdx, eIdx, sIdx)}>Reject</Button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </Card>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
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
