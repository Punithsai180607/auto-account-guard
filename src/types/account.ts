export interface AccountRecord {
  id: string;
  accountName: string;
  department: string;
  inactivityDays: number;
  activeTickets: number;
  systemDecision: string;
  aiExplanation: string;
  jiraStatus: string;
  eligible: boolean;
  status: "deactivated" | "active" | "pending";
  evaluatedAt: string;
  evaluatedBy: string;
}
