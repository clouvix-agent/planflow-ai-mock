import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  statusCategory?: string;
  className?: string;
}

export const StatusBadge = ({ status, statusCategory, className }: StatusBadgeProps) => {
  const getStatusVariant = (status: string, category?: string) => {
    const lowerStatus = status.toLowerCase();
    const lowerCategory = category?.toLowerCase();

    // Based on Jira status categories
    if (lowerCategory === "done" || lowerStatus.includes("done") || lowerStatus.includes("closed") || lowerStatus.includes("resolved")) {
      return "success";
    }
    
    if (lowerCategory === "indeterminate" || lowerStatus.includes("progress") || lowerStatus.includes("review")) {
      return "info";
    }
    
    if (lowerStatus.includes("todo") || lowerStatus.includes("to do") || lowerStatus.includes("backlog") || lowerCategory === "new") {
      return "secondary";
    }
    
    if (lowerStatus.includes("blocked") || lowerStatus.includes("failed")) {
      return "destructive";
    }

    return "secondary";
  };

  const variant = getStatusVariant(status, statusCategory);

  return (
    <Badge variant={variant} className={cn("font-medium", className)}>
      {status}
    </Badge>
  );
};
