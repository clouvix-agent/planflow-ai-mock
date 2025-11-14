import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Mic, FileText, Box } from "lucide-react";

export default function Settings() {
  const { mode, username } = useAuth();
  const [backendStatus, setBackendStatus] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'real') {
      checkBackendHealth();
    }
  }, [mode]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/');
      const json = await response.json();
      setBackendStatus(json.status);
      setBackendMessage(json.message);
    } catch (err) {
      setBackendStatus('offline');
      setBackendMessage('Backend Offline');
      console.error(err);
    }
  };

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
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Username:</span>
              <span className="text-sm font-medium">{username}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mode:</span>
              <Badge variant={mode === 'real' ? 'default' : 'secondary'}>
                {mode === 'real' ? 'Real Mode' : 'Demo Mode'}
              </Badge>
            </div>
            {mode === 'real' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Backend Status:</span>
                <Badge variant={backendStatus === 'ok' ? 'default' : 'destructive'}>
                  {backendStatus === 'ok' ? 'Online' : 'Offline'}
                </Badge>
                {backendMessage && (
                  <span className="text-xs text-muted-foreground">
                    {backendMessage}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

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
