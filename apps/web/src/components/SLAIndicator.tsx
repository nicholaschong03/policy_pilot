import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Props = {
  firstResponseDueAt?: string; // ISO datetime
  resolutionDueAt?: string; // ISO datetime
};

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0m";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function SLAIndicator({ firstResponseDueAt, resolutionDueAt }: Props) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const firstResponseMs = useMemo(() => (firstResponseDueAt ? new Date(firstResponseDueAt).getTime() - now : undefined), [firstResponseDueAt, now]);
  const resolutionMs = useMemo(() => (resolutionDueAt ? new Date(resolutionDueAt).getTime() - now : undefined), [resolutionDueAt, now]);

  const status = useMemo(() => {
    const ms = Math.min(
      firstResponseMs ?? Number.POSITIVE_INFINITY,
      resolutionMs ?? Number.POSITIVE_INFINITY
    );
    if (!isFinite(ms)) return { label: "No SLA", className: "bg-muted/20 text-muted-foreground border-muted/30" };
    if (ms <= 0) return { label: "Breached", className: "bg-red-500/20 text-red-400 border-red-500/30" };
    if (ms < 60 * 60 * 1000) return { label: "Warning", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    return { label: "On Track", className: "bg-green-500/20 text-green-400 border-green-500/30" };
  }, [firstResponseMs, resolutionMs]);

  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge className={status.className}>{status.label}</Badge>
      {firstResponseMs !== undefined && (
        <span>1st resp: {formatRemaining(firstResponseMs)}</span>
      )}
      {resolutionMs !== undefined && (
        <span>• resolve: {formatRemaining(resolutionMs)}</span>
      )}
    </div>
  );
}


