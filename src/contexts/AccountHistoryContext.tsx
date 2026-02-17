import { createContext, useContext, useState, ReactNode } from "react";
import { AccountRecord } from "@/types/account";

interface AccountHistoryContextType {
  records: AccountRecord[];
  addRecord: (record: AccountRecord) => void;
  restoreAccount: (id: string) => void;
}

const AccountHistoryContext = createContext<AccountHistoryContextType>({} as AccountHistoryContextType);

export const useAccountHistory = () => useContext(AccountHistoryContext);

export const AccountHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<AccountRecord[]>([]);

  const addRecord = (record: AccountRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  const restoreAccount = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "active" as const, systemDecision: "Restored" } : r))
    );
  };

  return (
    <AccountHistoryContext.Provider value={{ records, addRecord, restoreAccount }}>
      {children}
    </AccountHistoryContext.Provider>
  );
};
