import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useContextPages } from "@/contexts/ContextPagesContext";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";
import { mockPRDs, PRD } from "@/data/mockPRDs";

const LABEL_OPTIONS = [
  "Product Requirements Document (PRD)",
  "Roadmap",
  "Feature Details",
  "Customer Interviews",
  "User Journey Flows",
  "Others"
];

export default function Context() {
  const { mode } = useAuth();
  const { selectedContextPages, togglePageSelection, isPageSelected } = useContextPages();
  const [prds, setPrds] = useState<PRD[]>([]);
  const [previewPRD, setPreviewPRD] = useState<PRD | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prdLabels, setPrdLabels] = useState<Record<string, string>>({});

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

  const handleLabelChange = (prdId: string, label: string) => {
    setPrdLabels(prev => ({ ...prev, [prdId]: label }));
  };

  return (
    <AppLayout pageTitle="Context (PRDs)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PRD Table */}
        <Card className="p-6" style={{ gridColumn: previewPRD ? '1' : '1 / -1' }}>
          <h3 className="text-xl font-semibold mb-4">Confluence Documents</h3>
          {selectedContextPages.length > 0 && (
            <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-semibold mb-2 text-foreground">
                Selected context pages (used in meeting analysis):
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedContextPages.map(p => p.title).join(', ')}
              </p>
            </div>
          )}
          {loading && <div className="text-sm text-muted-foreground mb-4">Loading...</div>}
          {error && <div className="text-sm text-destructive mb-4">{error}</div>}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">Use</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Labels</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prds.map((prd) => (
                  <TableRow key={prd.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={isPageSelected(prd.id)}
                        onCheckedChange={() => togglePageSelection({ id: prd.id, title: prd.title })}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{prd.title}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 w-full justify-between hover:shadow-premium-sm transition-all">
                            <span className="truncate">
                              {prdLabels[prd.id] || "Select label"}
                            </span>
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[280px]">
                          {LABEL_OPTIONS.map((label) => (
                            <DropdownMenuItem 
                              key={label} 
                              onClick={() => handleLabelChange(prd.id, label)}
                              className="cursor-pointer"
                            >
                              <span className={prdLabels[prd.id] === label ? "font-semibold" : ""}>
                                {label}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(prd)}
                        className="hover:shadow-premium-sm transition-all"
                      >
                        Preview
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Selected: <span className="font-semibold text-foreground">{selectedContextPages.length}</span> document(s)
          </div>
        </Card>

        {/* Right: Preview */}
        {previewPRD && (
          <Card className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewPRD(null)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-2xl font-bold text-foreground">{previewPRD.title}</h4>
                {previewPRD.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {previewPRD.labels.map((label) => (
                      <Badge key={label} variant="secondary">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="prose prose-sm max-w-none bg-muted/30 p-6 rounded-lg max-h-[600px] overflow-y-auto border border-border"
                dangerouslySetInnerHTML={{ __html: previewPRD.content || "" }}
              />
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
