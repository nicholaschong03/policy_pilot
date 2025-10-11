import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  onSearch: (q: string) => void;
  onFilterChange: (f: { category?: string; sla?: string; from?: string; to?: string }) => void;
};

export default function TicketSearchPanel({ onSearch, onFilterChange }: Props) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [sla, setSla] = useState<string | undefined>();

  return (
    <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center">
      <Input
        placeholder="Search by ID, keyword..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch(q);
        }}
        className="input-glass md:flex-1"
      />
      <Select onValueChange={(v) => { setCategory(v); onFilterChange({ category: v, sla, }); }}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Technical">Technical</SelectItem>
          <SelectItem value="Billing">Billing</SelectItem>
          <SelectItem value="Account">Account</SelectItem>
          <SelectItem value="General">General</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(v) => { setSla(v); onFilterChange({ category, sla: v }); }}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="SLA" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="on_track">On Track</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="breached">Breached</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}


