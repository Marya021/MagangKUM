import { supabase } from "@/integrations/supabase/client";

export type ActivityAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "upload";

export type ActivityEntity =
  | "auth"
  | "position"
  | "application"
  | "attendance"
  | "report"
  | "user"
  | "intern"
  | "profile"
  | "supervisor";

export interface LogActivityInput {
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Records an activity log entry. Failures are silenced so logging never breaks user flow.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : null;
    await supabase.rpc("log_activity", {
      _action: input.action,
      _entity: input.entity,
      _entity_id: input.entityId ?? undefined,
      _description: input.description,
      _metadata: (input.metadata ?? undefined) as never,
      _user_agent: ua ?? undefined,
    });
  } catch {
    // intentionally swallowed
  }
}
