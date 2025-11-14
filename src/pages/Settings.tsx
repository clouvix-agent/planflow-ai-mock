import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, Box } from "lucide-react";

export default function Settings() {
  const integrations = [
    {
      name: "Fireflies",
      icon: Mic,
      description: "Automatic meeting transcription and recording",
      status: "Connected",
    },
    {
      name: "Confluence",
      icon: FileText,
      description: "Product requirements and documentation",
      status: "Connected",
    },
    {
      name: "Jira",
      icon: Box,
      description: "Project management and issue tracking",
      status: "Connected",
    },
  ];

  return (
    <AppLayout pageTitle="Settings">
      <div className="max-w-3xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Manage your connected services and integrations
          </p>
        </div>

        <div className="grid gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.name} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{integration.name}</h4>
                      <Badge variant="default">{integration.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
