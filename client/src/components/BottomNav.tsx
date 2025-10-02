import { Home, Newspaper, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/news", icon: Newspaper, label: "News" },
    { path: "/stocks", icon: TrendingUp, label: "Stocks" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card border-t border-card-border">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-colors hover-elevate ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-b" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
