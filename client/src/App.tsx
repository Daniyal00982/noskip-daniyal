import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SetupGoal from "@/pages/setup-goal";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/setup", label: "Setup" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="card-minimal sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold text-gold hover:opacity-80 transition-opacity"
              data-testid="link-home"
            >
              MOTIVATE
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                data-testid={`link-${item.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${
                  location === item.path
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/setup" component={SetupGoal} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
