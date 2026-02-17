import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, CheckCircle, Loader2, TicketCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DeactivationResult {
  systemDecision: string;
  eligible: boolean;
  aiExplanation: string;
  jiraStatus: string;
}

const Index = () => {
  const [accountName, setAccountName] = useState("");
  const [inactivityDays, setInactivityDays] = useState("");
  const [activeTickets, setActiveTickets] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeactivationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !inactivityDays) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("validate-deactivation", {
        body: {
          accountName,
          inactivityDays: Number(inactivityDays),
          activeTickets: Number(activeTickets) || 0,
        },
      });

      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to validate deactivation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-4xl mx-auto flex items-center gap-3 py-5 px-4">
          <Shield className="h-6 w-6 text-foreground" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Account Deactivation System
            </h1>
            <p className="text-sm text-muted-foreground">
              Enterprise account lifecycle management — simulation prototype
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Account Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="e.g. Acme Corp"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inactivityDays">Inactivity Days</Label>
                <Input
                  id="inactivityDays"
                  type="number"
                  min={0}
                  placeholder="e.g. 120"
                  value={inactivityDays}
                  onChange={(e) => setInactivityDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activeTickets">Active Tickets</Label>
                <Input
                  id="activeTickets"
                  type="number"
                  min={0}
                  placeholder="e.g. 0"
                  value={activeTickets}
                  onChange={(e) => setActiveTickets(e.target.value)}
                />
              </div>
              <div className="sm:col-span-3">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    "Check Deactivation"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="grid gap-4 sm:grid-cols-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            {/* System Decision */}
            <Card className={`border-2 ${result.eligible ? "border-destructive" : "border-success"}`}>
              <CardContent className="pt-6 text-center space-y-2">
                {result.eligible ? (
                  <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
                ) : (
                  <CheckCircle className="h-8 w-8 mx-auto text-success" />
                )}
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  System Decision
                </p>
                <p className={`text-xl font-bold ${result.eligible ? "text-destructive" : "text-success"}`}>
                  {result.systemDecision}
                </p>
              </CardContent>
            </Card>

            {/* Jira Trigger */}
            <Card>
              <CardContent className="pt-6 text-center space-y-2">
                <TicketCheck className={`h-8 w-8 mx-auto ${result.eligible ? "text-warning" : "text-muted-foreground"}`} />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Jira Trigger
                </p>
                <p className="text-sm font-medium text-foreground">
                  {result.jiraStatus}
                </p>
              </CardContent>
            </Card>

            {/* AI Explanation */}
            <Card className="sm:col-span-3">
              <CardHeader>
                <CardTitle className="text-base font-medium">AI Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
                  {result.aiExplanation}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
