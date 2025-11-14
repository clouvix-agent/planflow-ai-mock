import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
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
  const [createForm, setCreateForm] = useState({
    project: "",
    issueType: "",
    summary: "",
    description: "",
    labels: "",
    priority: "",
  });
  const [fetchKey, setFetchKey] = useState("");
  const [fetchedIssue, setFetchedIssue] = useState<any>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleCreateIssue = () => {
    // Mock success
    const mockKey = `${createForm.project}-${Math.floor(Math.random() * 1000)}`;
    setCreateSuccess(mockKey);
    // Reset form
    setCreateForm({
      project: "",
      issueType: "",
      summary: "",
      description: "",
      labels: "",
      priority: "",
    });
    setTimeout(() => setCreateSuccess(null), 5000);
  };

  const handleFetchIssue = () => {
    // Mock fetched issue
    setFetchedIssue({
      key: fetchKey,
      fields: {
        summary: "Implement user authentication",
        description: "Add OAuth 2.0 support for Google and GitHub sign-in.",
        issuetype: { name: "Story" },
        priority: { name: "High" },
        status: { name: "In Progress" },
        labels: ["auth", "security"],
        assignee: { displayName: "Alex Thompson" },
      },
    });
  };

  const handleUpdateIssue = () => {
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  return (
    <AppLayout pageTitle="Jira Console">
      <div className="space-y-6 max-w-4xl">
        {/* Create Issue Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create Jira Issue</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Project Key</Label>
                <Select
                  value={createForm.project}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, project: value })
                  }
                >
                  <SelectTrigger id="project" className="mt-2">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROJ">PROJ</SelectItem>
                    <SelectItem value="AUTH">AUTH</SelectItem>
                    <SelectItem value="UI">UI</SelectItem>
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
                    <SelectValue placeholder="Select type" />
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
                value={createForm.summary}
                onChange={(e) =>
                  setCreateForm({ ...createForm, summary: e.target.value })
                }
                placeholder="Brief description of the issue"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="Detailed description"
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="labels">Labels (comma-separated)</Label>
                <Input
                  id="labels"
                  value={createForm.labels}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, labels: e.target.value })
                  }
                  placeholder="auth, api, urgent"
                  className="mt-2"
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
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleCreateIssue} className="w-full">
              Create Issue
            </Button>

            {createSuccess && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">
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
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="fetchKey">Issue Key</Label>
                <Input
                  id="fetchKey"
                  value={fetchKey}
                  onChange={(e) => setFetchKey(e.target.value)}
                  placeholder="e.g., PROJ-123"
                  className="mt-2"
                />
              </div>
              <div className="self-end">
                <Button onClick={handleFetchIssue}>Fetch Issue</Button>
              </div>
            </div>

            {fetchedIssue && (
              <div className="space-y-4 mt-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold">
                      {fetchedIssue.key}
                    </h4>
                    <Badge variant="outline">
                      {fetchedIssue.fields.issuetype.name}
                    </Badge>
                    <Badge>{fetchedIssue.fields.status.name}</Badge>
                  </div>
                  <Input
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
                    className="font-medium"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={fetchedIssue.fields.description}
                    onChange={(e) =>
                      setFetchedIssue({
                        ...fetchedIssue,
                        fields: {
                          ...fetchedIssue.fields,
                          description: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={fetchedIssue.fields.priority.name}
                      onValueChange={(value) =>
                        setFetchedIssue({
                          ...fetchedIssue,
                          fields: {
                            ...fetchedIssue.fields,
                            priority: { name: value },
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Highest">Highest</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Assignee</Label>
                    <Input
                      value={fetchedIssue.fields.assignee.displayName}
                      disabled
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Labels</Label>
                  <div className="flex gap-2 mt-2">
                    {fetchedIssue.fields.labels.map((label: string) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleUpdateIssue} className="w-full">
                  Update Issue
                </Button>

                {updateSuccess && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
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
