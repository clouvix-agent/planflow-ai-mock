import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CheckSquare } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const onboardingCards = [
    {
      title: "Review Meetings",
      description: "Browse Fireflies transcripts and classify meeting types",
      icon: Calendar,
      action: "View Meetings",
      path: "/meetings",
    },
    {
      title: "Register PRDs",
      description: "Select Confluence docs to use as context for AI actions",
      icon: FileText,
      action: "Manage Context",
      path: "/context",
    },
    {
      title: "Review Sprint Actions",
      description: "Approve or reject AI-generated Jira actions",
      icon: CheckSquare,
      action: "View Actions",
      path: "/actions",
    },
  ];

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Card */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to PlanFlow AI
            </h1>
            <p className="text-lg text-muted-foreground">
              Your AI assistant for Sprint Planning & Product Backlog Refinement
            </p>
          </div>
        </Card>

        {/* Onboarding Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {onboardingCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(card.path)}
                    className="w-full"
                  >
                    {card.action}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
