import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Jira() {
  const { mode } = useAuth();
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [createForm, setCreateForm] = useState({
    projectKey: "",
    issueType: "Story",
    summary: "",
    description: "",
    labels: "",
    priority: "Medium",
  });
  const [issueKey, setIssueKey] = useState("");
  const [fetchedIssue, setFetchedIssue] = useState<any>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'demo') {
      setProjects(["PROJ", "AUTH", "UI"]);
      setSelectedProject("PROJ");
      setCreateForm(prev => ({ ...prev, projectKey: "PROJ" }));
    } else if (mode === 'real') {
      fetchProjects();
    }
  }, [mode]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/jira/projects');
      const json = await response.json();
      const projectKeys = json.values.map((p: any) => p.key);
      setProjects(projectKeys);
      if (projectKeys.length > 0) {
        setSelectedProject(projectKeys[0]);
        setCreateForm(prev => ({ ...prev, projectKey: projectKeys[0] }));
      }
    } catch (err) {
      setError('Failed to fetch Jira projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (mode === 'demo') {
      setCreateSuccess(`PROJ-142`);
      setTimeout(() => setCreateSuccess(null), 3000);
    } else if (mode === 'real') {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8000/jira/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: createForm.summary,
            description: createForm.description,
            issue_type: createForm.issueType,
            project_key: createForm.projectKey,
            labels: createForm.labels.split(',').map(l => l.trim()).filter(Boolean),
            priority: createForm.priority
          })
        });
        const json = await response.json();
        setCreateSuccess(json.key);
        setTimeout(() => setCreateSuccess(null), 3000);
      } catch (err) {
        setError('Failed to create issue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFetchIssue = async () => {
    if (mode === 'demo') {
      setFetchedIssue({
        key: issueKey,
        fields: {
          summary: "Example task summary",
          description: "This is a mock description.",
          labels: ["backend", "urgent"],
          priority: { name: "High" },
        },
      });
    } else if (mode === 'real') {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/jira/issue/${issueKey}`);
        const json = await response.json();
        setFetchedIssue(json);
      } catch (err) {
        setError('Failed to fetch issue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateIssue = async () => {
    if (mode === 'demo') {
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } else if (mode === 'real') {
      setLoading(true);
      setError(null);
      try {
        await fetch(`http://localhost:8000/jira/issue/${fetchedIssue.key}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: fetchedIssue.fields.summary,
            description: fetchedIssue.fields.description,
            labels: fetchedIssue.fields.labels,
            priority: fetchedIssue.fields.priority.name
          })
        });
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (err) {
        setError('Failed to update issue');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AppLayout pageTitle="Jira Console">
      <div className="space-y-6">
        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        {/* Create Issue Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Jira Issue</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Project Key</Label>
                <Select
                  value={createForm.projectKey}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, projectKey: value })
                  }
                >
                  <SelectTrigger id="project" className="mt-2">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="issueType">Issue Type</Label>
                <Select
                  value={createForm.issueType}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, issueType: value })
                  }
                >
                  <SelectTrigger id="issueType" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                className="mt-2"
                value={createForm.summary}
                onChange={(e) =>
                  setCreateForm({ ...createForm, summary: e.target.value })
                }
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="mt-2"
                rows={4}
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="Detailed description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="labels">Labels (comma-separated)</Label>
                <Input
                  id="labels"
                  className="mt-2"
                  value={createForm.labels}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, labels: e.target.value })
                  }
                  placeholder="e.g., backend, urgent"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={createForm.priority}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, priority: value })
                  }
                >
                  <SelectTrigger id="priority" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCreateIssue}>Create Issue</Button>

            {createSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Issue created successfully: <strong>{createSuccess}</strong>
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Fetch & Update Issue */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fetch & Update Issue</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="issueKey">Issue Key</Label>
                <Input
                  id="issueKey"
                  className="mt-2"
                  value={issueKey}
                  onChange={(e) => setIssueKey(e.target.value)}
                  placeholder="e.g., PROJ-123"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleFetchIssue}>Fetch Issue</Button>
              </div>
            </div>

            {fetchedIssue && (
              <div className="space-y-4 border-t pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground">
                    {fetchedIssue.key}
                  </h4>
                  <Badge variant="outline">
                    {fetchedIssue.fields.priority.name}
                  </Badge>
                </div>

                <div>
                  <Label htmlFor="editSummary">Summary</Label>
                  <Input
                    id="editSummary"
                    className="mt-2"
                    value={fetchedIssue.fields.summary}
                    onChange={(e) =>
                      setFetchedIssue({
                        ...fetchedIssue,
                        fields: {
                          ...fetchedIssue.fields,
                          summary: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    className="mt-2"
                    rows={4}
                    value={fetchedIssue.fields.description || ""}
                    onChange={(e) =>
                      setFetchedIssue({
                        ...fetchedIssue,
                        fields: {
                          ...fetchedIssue.fields,
                          description: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Labels</Label>
                  <div className="flex gap-2 mt-2">
                    {fetchedIssue.fields.labels?.map((label: string) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleUpdateIssue}>Update Issue</Button>

                {updateSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      ✓ Issue updated successfully
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
