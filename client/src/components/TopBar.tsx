import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
}

export default function TopBar({ 
  onNotificationClick, 
  onProfileClick,
  notificationCount = 0 
}: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-card-border">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary" data-testid="text-brand">
            EQUIALERT
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost"
                className="relative"
                data-testid="button-notifications"
                onClick={onNotificationClick}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-negative rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3">
                <h3 className="font-semibold mb-2">Notifications</h3>
                {notificationCount === 0 ? (
                  <p className="text-sm text-muted-foreground">No new notifications</p>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm p-2 rounded bg-positive/10 border-l-2 border-positive">
                      <p className="font-medium text-positive">HDFC Bank +2.5%</p>
                      <p className="text-muted-foreground text-xs">Price alert triggered</p>
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            size="icon" 
            variant="ghost"
            data-testid="button-profile"
            onClick={onProfileClick}
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
