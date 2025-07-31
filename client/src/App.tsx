import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SetupGoal from "@/pages/setup-goal";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { Github, Linkedin, User } from "lucide-react";

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/setup", label: "Setup" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="card-premium sticky top-0 z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="text-lg font-bold text-foreground hover:opacity-80 transition-opacity tracking-tight"
              data-testid="link-home"
            >
              NOSKIP
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                data-testid={`link-${item.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors tracking-wide ${
                  location === item.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-border">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                by Daniyal
              </span>
              <a 
                href="https://github.com/Daniyal00982" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/ansaridaniyal" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
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
  const [location] = useLocation();
  const isSetupPage = location === '/setup';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          {!isSetupPage && <Navigation />}
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
