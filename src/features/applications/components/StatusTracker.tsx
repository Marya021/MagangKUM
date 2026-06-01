import { statusSteps, statusConfig } from "../constants";

export function StatusTracker({ currentStatus }: { currentStatus: string }) {
  return (
    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-3">
      <div
        className="hidden md:block pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border"
        style={{ zIndex: 0 }}
      />
      <div
        className="md:hidden pointer-events-none absolute top-0 bottom-0 left-[13px] w-0.5 bg-border"
        style={{ zIndex: 0 }}
      />
      {statusSteps.map((step) => {
        const isActive = step === currentStatus;
        const config = statusConfig[step];
        const Icon = config.icon;
        return (
          <div key={step} className="relative shrink-0 rounded-full bg-background p-0.5" style={{ zIndex: 1 }}>
            <div
              className={`flex items-center justify-center gap-1 text-[10px] font-medium rounded-full px-4 py-2 whitespace-nowrap ${isActive ? config.color : "bg-muted text-muted-foreground"}`}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span>{config.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
