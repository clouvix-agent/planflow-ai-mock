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
import { ChevronDown } from "lucide-react";
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
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string | null>(null);

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

  const filteredPrds = selectedLabelFilter
    ? prds.filter(prd => prd.labels.some(label => 
        label.toLowerCase().includes(selectedLabelFilter.toLowerCase()) ||
        selectedLabelFilter === "Others"
      ))
    : prds;

  return (
    <AppLayout pageTitle="Context (PRDs)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: PRD Table */}
        <Card className="p-6" style={{ gridColumn: previewPRD ? '1' : '1 / -1' }}>
          <h3 className="text-lg font-semibold mb-4">Confluence Documents</h3>
          {selectedContextPages.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-1">
                Selected context pages (used in meeting analysis):
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedContextPages.map(p => p.title).join(', ')}
              </p>
            </div>
          )}
          {loading && <div className="text-sm text-muted-foreground mb-4">Loading...</div>}
          {error && <div className="text-sm text-destructive mb-4">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Use</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <span>Labels</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setSelectedLabelFilter(null)}>
                          <span className={!selectedLabelFilter ? "font-semibold" : ""}>All</span>
                        </DropdownMenuItem>
                        {LABEL_OPTIONS.map((label) => (
                          <DropdownMenuItem key={label} onClick={() => setSelectedLabelFilter(label)}>
                            <span className={selectedLabelFilter === label ? "font-semibold" : ""}>{label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrds.map((prd) => (
                <TableRow key={prd.id}>
                  <TableCell>
                    <Checkbox
                      checked={isPageSelected(prd.id)}
                      onCheckedChange={() => togglePageSelection({ id: prd.id, title: prd.title })}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{prd.title}</TableCell>
                  <TableCell>
                    {prd.labels.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            {prd.labels.length} {prd.labels.length === 1 ? 'Label' : 'Labels'}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {prd.labels.map((label) => (
                            <DropdownMenuItem key={label}>
                              <Badge variant="secondary">{label}</Badge>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-muted-foreground text-sm">No labels</span>
                    )}
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
            Selected: {selectedContextPages.length} document(s)
          </div>
        </Card>

        {/* Right: Preview */}
        {previewPRD && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
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
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
