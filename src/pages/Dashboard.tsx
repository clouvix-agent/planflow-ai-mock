import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { Calendar, FileText, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface JiraProject {
  key: string;
  name: string;
}

interface JiraBoard {
  id: number;
  name: string;
}

interface SprintIssue {
  key: string;
  summary: string;
  status: string;
  statusCategory: string;
}

interface CurrentSprintData {
  sprint_name: string;
  start_date: string;
  end_date: string;
  completion_percent: number;
  total_issues: number;
  completed_issues: number;
  issues: SprintIssue[];
}

interface EpicProgress {
  epic_key: string;
  epic_name: string;
  completion_percent: number;
  total_stories: number;
  completed_stories: number;
}

interface EpicIssue {
  key: string;
  summary: string;
  status: string;
  status_name: string;
  status_category_key: string;
  issue_type: string;
  assignee: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();

  // Jira config state
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState<string>("");
  const [boards, setBoards] = useState<JiraBoard[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);

  // Analytics data
  const [sprintData, setSprintData] = useState<CurrentSprintData | null>(null);
  const [epicData, setEpicData] = useState<EpicProgress[]>([]);
  const [loadingSprint, setLoadingSprint] = useState(false);
  const [loadingEpics, setLoadingEpics] = useState(false);

  // Expanded epics state
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [epicIssues, setEpicIssues] = useState<Record<string, EpicIssue[]>>({});
  const [loadingEpicIssues, setLoadingEpicIssues] = useState<Record<string, boolean>>({});
  const [isSprintIssuesExpanded, setIsSprintIssuesExpanded] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch boards when project changes
  useEffect(() => {
    if (selectedProjectKey) {
      fetchBoards(selectedProjectKey);
    }
  }, [selectedProjectKey]);

  // Fetch analytics when board changes
  useEffect(() => {
    if (selectedBoardId && selectedProjectKey) {
      fetchSprintData();
      fetchEpicData();
    }
  }, [selectedBoardId, selectedProjectKey]);

  const fetchProjects = async () => {
    try {
      console.log("Fetching projects from: http://localhost:8000/jira/projects");
      const resp = await fetch("http://localhost:8000/jira/projects");
      console.log("Projects response status:", resp.status);
      if (!resp.ok) throw new Error("Failed to fetch projects");
      const data = await resp.json();
      console.log("Projects data:", data);
      const values = data.values || [];
      setProjects(values);
      if (values.length > 0) {
        setSelectedProjectKey(values[0].key);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch Jira projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const fetchBoards = async (projectKey: string) => {
    try {
      console.log(`Fetching boards for project: ${projectKey}`);
      const resp = await fetch(`http://localhost:8000/jira/boards?project_key=${projectKey}`);
      console.log("Boards response status:", resp.status);
      if (!resp.ok) throw new Error("Failed to fetch boards");
      const data = await resp.json();
      console.log("Boards data:", data);
      const values = data.values || [];
      setBoards(values);
      if (values.length > 0) {
        setSelectedBoardId(values[0].id);
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch Jira boards: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const fetchSprintData = async () => {
    if (!selectedBoardId || !selectedProjectKey) return;
    setLoadingSprint(true);
    try {
      console.log(`Fetching sprint data: board_id=${selectedBoardId}, project_key=${selectedProjectKey}`);
      const resp = await fetch(
        `http://localhost:8000/dashboard/overview?board_id=${selectedBoardId}&project_key=${selectedProjectKey}`
      );
      console.log("Sprint data response status:", resp.status);
      if (!resp.ok) throw new Error("Failed to fetch sprint data");
      const data = await resp.json();
      console.log("Dashboard overview:", data);
      
      // Normalize sprint data from /dashboard/overview response
      const normalizedSprintData: CurrentSprintData = {
        sprint_name: data.current_sprint?.name ?? "",
        start_date: data.current_sprint?.start_date ?? "",
        end_date: data.current_sprint?.end_date ?? "",
        completion_percent: data.current_sprint?.completion_percent ?? 0,
        completed_issues: data.current_sprint?.completed_issues ?? 0,
        total_issues: data.current_sprint?.total_issues ?? (data.current_sprint?.issues?.length ?? 0),
        issues: data.current_sprint?.issues ?? [],
      };
      
      setSprintData(normalizedSprintData);
    } catch (error) {
      console.error("Error fetching sprint data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch current sprint data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      setSprintData(null);
    } finally {
      setLoadingSprint(false);
    }
  };

  const fetchEpicData = async () => {
    if (!selectedProjectKey) return;
    setLoadingEpics(true);
    try {
      console.log(`Fetching epic data for project: ${selectedProjectKey}`);
      const resp = await fetch(`http://localhost:8000/dashboard/epic_progress?project_key=${selectedProjectKey}`);
      console.log("Epic data response status:", resp.status);
      if (!resp.ok) throw new Error("Failed to fetch epic data");
      const data = await resp.json();
      console.log("Epic data:", data);
      setEpicData(data.epics || []);
    } catch (error) {
      console.error("Error fetching epic data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch epic progress data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      setEpicData([]);
    } finally {
      setLoadingEpics(false);
    }
  };

  const toggleEpic = async (epicKey: string) => {
    const isCurrentlyExpanded = expandedEpics[epicKey];
    
    setExpandedEpics((prev) => ({
      ...prev,
      [epicKey]: !prev[epicKey],
    }));

    // Fetch issues when expanding and they haven't been loaded yet
    if (!isCurrentlyExpanded && !epicIssues[epicKey]) {
      await fetchEpicIssues(epicKey);
    }
  };

  const fetchEpicIssues = async (epicKey: string) => {
    setLoadingEpicIssues((prev) => ({ ...prev, [epicKey]: true }));
    try {
      const resp = await fetch(`http://localhost:8000/dashboard/epic_issues?epic_key=${epicKey}`);
      if (!resp.ok) throw new Error("Failed to fetch epic issues");
      const data = await resp.json();
      
      setEpicIssues((prev) => ({
        ...prev,
        [epicKey]: data.issues || [],
      }));
    } catch (error) {
      console.error(`Error fetching issues for epic ${epicKey}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not fetch issues for ${epicKey}`,
      });
      setEpicIssues((prev) => ({
        ...prev,
        [epicKey]: [],
      }));
    } finally {
      setLoadingEpicIssues((prev) => ({ ...prev, [epicKey]: false }));
    }
  };

  const epicColors = [
    "bg-blue-50 border-blue-200",
    "bg-purple-50 border-purple-200",
    "bg-teal-50 border-teal-200",
    "bg-amber-50 border-amber-200",
    "bg-rose-50 border-rose-200",
    "bg-emerald-50 border-emerald-200",
  ];

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Jira Config */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Sprint Selection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project</label>
                <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((proj) => (
                      <SelectItem key={proj.key} value={proj.key}>
                        {proj.name} ({proj.key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Board</label>
                <Select
                  value={selectedBoardId?.toString() || ""}
                  onValueChange={(val) => setSelectedBoardId(Number(val))}
                >
                  <SelectTrigger className="bg-background">
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
            </div>
          </div>
        </Card>

        {/* Current Sprint Section */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-2xl text-foreground">Current Sprint</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {loadingSprint ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : sprintData ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{sprintData.sprint_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(sprintData.start_date).toLocaleDateString()} →{" "}
                    {new Date(sprintData.end_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                      Progress: {sprintData.completion_percent ?? 0}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {sprintData.completed_issues ?? 0}/{sprintData.total_issues ?? 0} issues
                    </span>
                  </div>
                  <Progress value={sprintData.completion_percent ?? 0} className="h-2" />
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => setIsSprintIssuesExpanded(!isSprintIssuesExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-200"
                  >
                    <h4 className="text-sm font-semibold text-foreground">Sprint Issues ({sprintData.issues.length})</h4>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-300",
                        isSprintIssuesExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  
                  <div
                    className={cn(
                      "space-y-2 overflow-hidden transition-all duration-300",
                      isSprintIssuesExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {sprintData.issues.map((issue) => (
                        <Card
                          key={issue.key}
                          className="p-4 bg-background hover:shadow-premium transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <a
                                href={`https://your-domain.atlassian.net/browse/${issue.key}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                {issue.key}
                              </a>
                              <p className="text-sm text-foreground mt-1 line-clamp-2">{issue.summary}</p>
                            </div>
                            <StatusBadge status={issue.status} statusCategory={issue.statusCategory} />
                          </div>
                        </Card>
                      ))}
                     </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No active sprint data available</p>
            )}
          </CardContent>
        </Card>

        {/* Epic Progress Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Epic Progress</h2>
          {loadingEpics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </Card>
              ))}
            </div>
          ) : epicData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {epicData.map((epic) => {
                const isExpanded = expandedEpics[epic.epic_key];
                return (
                  <Card
                    key={epic.epic_key}
                    className="p-6 transition-all duration-200 cursor-pointer hover:shadow-premium-lg"
                    onClick={() => toggleEpic(epic.epic_key)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{epic.epic_key}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{epic.epic_name}</h3>
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                          {epic.completion_percent}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>
                            {epic.completed_stories} / {epic.total_stories} stories completed
                          </span>
                        </div>
                        <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                            style={{ width: `${epic.completion_percent}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="pt-4 border-t border-border space-y-3 animate-fade-in">
                          {loadingEpicIssues[epic.epic_key] ? (
                            <div className="space-y-2">
                              <Skeleton className="h-16 w-full" />
                              <Skeleton className="h-16 w-full" />
                            </div>
                          ) : epicIssues[epic.epic_key]?.length > 0 ? (
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                              {epicIssues[epic.epic_key].map((issue) => (
                                <Card
                                  key={issue.key}
                                  className="p-3 bg-background hover:shadow-premium transition-all duration-200"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <a
                                        href={`https://your-domain.atlassian.net/browse/${issue.key}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-primary hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {issue.key}
                                      </a>
                                      <p className="text-sm text-foreground mt-1 line-clamp-2">{issue.summary}</p>
                                      {issue.assignee && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Assignee: {issue.assignee}
                                        </p>
                                      )}
                                    </div>
                                    <StatusBadge 
                                      status={issue.status_name} 
                                      statusCategory={issue.status_category_key}
                                      className="flex-shrink-0"
                                    />
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              No issues linked to this epic
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No epic data available</p>
            </Card>
          )}
        </div>

        {/* Navigation Shortcuts */}
        <Card className="p-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button
              onClick={() => navigate("/roadmap")}
              size="lg"
              className="h-28 flex flex-col gap-3 text-base font-semibold shadow-premium hover:shadow-premium-lg"
            >
              <Calendar className="h-7 w-7" />
              Roadmap Sprint Planner
            </Button>
            <Button
              onClick={() => navigate("/context")}
              size="lg"
              variant="secondary"
              className="h-28 flex flex-col gap-3 text-base font-semibold"
            >
              <FileText className="h-7 w-7" />
              Register Context
            </Button>
            <Button
              onClick={() => navigate("/meetings")}
              size="lg"
              variant="outline"
              className="h-28 flex flex-col gap-3 text-base font-semibold"
            >
              <Lightbulb className="h-7 w-7" />
              Meeting Insights
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
