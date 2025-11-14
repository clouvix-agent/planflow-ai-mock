import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockPRDs, PRD } from "@/data/mockPRDs";

export default function Context() {
  const [selectedPRDs, setSelectedPRDs] = useState<Set<string>>(new Set());
  const [previewPRD, setPreviewPRD] = useState<PRD | null>(null);

  const handleToggleSelection = (id: string) => {
    setSelectedPRDs((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handlePreview = (prd: PRD) => {
    setPreviewPRD(prd);
  };

  return (
    <AppLayout pageTitle="Context (PRDs)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PRD Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confluence Documents</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Use</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPRDs.map((prd) => (
                <TableRow key={prd.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPRDs.has(prd.id)}
                      onCheckedChange={() => handleToggleSelection(prd.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{prd.title}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {prd.labels.map((label) => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(prd)}
                    >
                      Preview
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-sm text-muted-foreground">
            Selected: {selectedPRDs.size} document(s)
          </div>
        </Card>

        {/* Right: PRD Preview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">PRD Preview</h3>
          {previewPRD ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold">{previewPRD.title}</h4>
                {previewPRD.labels.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {previewPRD.labels.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-lg max-h-[600px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewPRD.content || "" }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Select a document to preview
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
