import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
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
  const { mode } = useAuth();
  const [prds, setPrds] = useState<PRD[]>([]);
  const [selectedPRDs, setSelectedPRDs] = useState<Set<string>>(new Set());
  const [previewPRD, setPreviewPRD] = useState<PRD | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'demo') {
      setPrds(mockPRDs);
    } else if (mode === 'real') {
      fetchPages();
    }
  }, [mode]);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/confluence/pages');
      const json = await response.json();
      const pages = json.results.map((p: any) => ({
        id: p.id,
        title: p.title,
        labels: p.metadata?.labels?.results?.map((l: any) => l.name) || [],
        content: null
      }));
      setPrds(pages);
    } catch (err) {
      setError('Failed to fetch Confluence pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePreview = async (prd: PRD) => {
    if (mode === 'demo') {
      setPreviewPRD(prd);
    } else if (mode === 'real') {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/confluence/page/${prd.id}`);
        const json = await response.json();
        setPreviewPRD({
          id: json.id,
          title: json.title,
          labels: json.metadata?.labels?.results?.map((l: any) => l.name) || [],
          content: json.body?.storage?.value || ''
        });
      } catch (err) {
        console.error('Failed to fetch page details', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AppLayout pageTitle="Context (PRDs)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PRD Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confluence Documents</h3>
          {loading && <div className="text-sm text-muted-foreground mb-4">Loading...</div>}
          {error && <div className="text-sm text-destructive mb-4">{error}</div>}
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
              {prds.map((prd) => (
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
