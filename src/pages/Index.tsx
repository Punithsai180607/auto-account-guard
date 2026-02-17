import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, Loader2, TicketCheck, SendHorizonal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountHistory } from "@/contexts/AccountHistoryContext";
import { AccountRecord } from "@/types/account";

interface DeactivationResult {
  systemDecision: string;
  eligible: boolean;
  aiExplanation: string;
  jiraStatus: string;
}

const departments = ["Engineering", "Sales", "Marketing", "Finance", "HR", "Operations", "Support"];

const Index = () => {
  const { user } = useAuth();
  const { addRecord } = useAccountHistory();
  const isAdmin = user?.role === "admin";

  const [accountName, setAccountName] = useState("");
  const [inactivityDays, setInactivityDays] = useState("");
  const [activeTickets, setActiveTickets] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeactivationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName || !inactivityDays || !department) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isAdmin) {
      // Manager: simulate send for approval
      toast.info("Sent for admin approval.");
      const record: AccountRecord = {
        id: crypto.randomUUID(),
        accountName,
        department,
        inactivityDays: Number(inactivityDays),
        activeTickets: Number(activeTickets) || 0,
        systemDecision: "Pending Approval",
        aiExplanation: "Awaiting admin review.",
        jiraStatus: "No Jira action — pending approval.",
        eligible: false,
        status: "pending",
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: user?.email || "",
      };
      addRecord(record);
      setResult(null);
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

      const record: AccountRecord = {
        id: crypto.randomUUID(),
        accountName,
        department,
        inactivityDays: Number(inactivityDays),
        activeTickets: Number(activeTickets) || 0,
        systemDecision: data.systemDecision,
        aiExplanation: data.aiExplanation,
        jiraStatus: data.jiraStatus,
        eligible: data.eligible,
        status: data.eligible ? "deactivated" : "active",
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: user?.email || "",
      };
      addRecord(record);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to validate deactivation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Automatic Account Deactivation System</h1>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Account Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input id="accountName" placeholder="e.g. Acme Corp" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inactivityDays">Inactivity Days</Label>
              <Input id="inactivityDays" type="number" min={0} placeholder="e.g. 120" value={inactivityDays} onChange={(e) => setInactivityDays(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activeTickets">Active Tickets</Label>
              <Input id="activeTickets" type="number" min={0} placeholder="e.g. 0" value={activeTickets} onChange={(e) => setActiveTickets(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dept" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : isAdmin ? (
                  "Evaluate Account"
                ) : (
                  <>
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Send for Approval
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results (Admin only) */}
      {result && (
        <div className="grid gap-4 sm:grid-cols-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Card className={`border-2 ${result.eligible ? "border-destructive" : "border-success"}`}>
            <CardContent className="pt-6 text-center space-y-2">
              {result.eligible ? (
                <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
              ) : (
                <CheckCircle className="h-8 w-8 mx-auto text-success" />
              )}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Decision</p>
              <p className={`text-xl font-bold ${result.eligible ? "text-destructive" : "text-success"}`}>
                {result.systemDecision}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <TicketCheck className={`h-8 w-8 mx-auto ${result.eligible ? "text-warning" : "text-muted-foreground"}`} />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jira Trigger</p>
              <p className="text-sm font-medium text-foreground">{result.jiraStatus}</p>
            </CardContent>
          </Card>

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
    </div>
  );
};

export default Index;
