import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockActions, SprintAction } from "@/data/mockActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Actions() {
  const [actions, setActions] = useState(mockActions);
  const [editingAction, setEditingAction] = useState<SprintAction | null>(null);
  const [editedSummary, setEditedSummary] = useState("");

  const handleApprove = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Approved" as const } : a))
    );
  };

  const handleReject = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Rejected" as const } : a))
    );
  };

  const handleEdit = (action: SprintAction) => {
    setEditingAction(action);
    setEditedSummary(action.summary);
  };

  const handleSaveEdit = () => {
    if (editingAction) {
      setActions((prev) =>
        prev.map((a) =>
          a.id === editingAction.id ? { ...a, summary: editedSummary } : a
        )
      );
      setEditingAction(null);
    }
  };

  const approvedCount = actions.filter((a) => a.status === "Approved").length;

  const getStatusBadge = (status: SprintAction["status"]) => {
    const variants: Record<SprintAction["status"], "default" | "secondary" | "destructive"> = {
      Pending: "secondary",
      Approved: "default",
      Rejected: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <AppLayout pageTitle="Sprint Actions">
      <div className="space-y-6">
        {/* Actions Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">AI-Generated Actions</h3>
            <Button disabled={approvedCount === 0}>
              Apply Approved Actions ({approvedCount})
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <Badge variant="outline">{action.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{action.summary}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {action.source}
                  </TableCell>
                  <TableCell>{getStatusBadge(action.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {action.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(action.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(action.id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(action)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingAction} onOpenChange={() => setEditingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <div className="mt-2">
                <Badge variant="outline">{editingAction?.type}</Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            {editingAction?.details?.description && (
              <div>
                <Label>Details</Label>
                <p className="text-sm text-muted-foreground mt-2">
                  {editingAction.details.description}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAction(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
