import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface OnlineUsersProps {
  className?: string;
  showDetails?: boolean;
}

export function OnlineUsers({ className = '', showDetails = false }: OnlineUsersProps) {
  // Realtime functionality removed - show static message
  
  if (!showDetails) {
    // Compact view for header - empty since realtime is removed
    return null;
  }

  // Detailed view - show removal message
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Utenti Online
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Funzionalità rimossa
        </div>
      </CardContent>
    </Card>
  );
}

export default OnlineUsers;