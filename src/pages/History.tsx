import { useAccountHistory } from "@/contexts/AccountHistoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

const statusColor = (status: string) => {
  if (status === "deactivated") return "bg-destructive text-destructive-foreground";
  if (status === "active") return "bg-success text-success-foreground";
  return "bg-warning text-warning-foreground";
};

const History = () => {
  const { records, restoreAccount } = useAccountHistory();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleRestore = (id: string, name: string) => {
    restoreAccount(id);
    toast.success(`Account "${name}" restored.`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Account History</h1>
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">No evaluations yet.</p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Inactivity</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.accountName}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell>{r.inactivityDays}d</TableCell>
                  <TableCell>{r.activeTickets}</TableCell>
                  <TableCell>{r.systemDecision}</TableCell>
                  <TableCell>
                    <Badge className={statusColor(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(r.evaluatedAt).toLocaleString()}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      {r.status === "deactivated" && (
                        <Button size="sm" variant="outline" onClick={() => handleRestore(r.id, r.accountName)}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Restore
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default History;
