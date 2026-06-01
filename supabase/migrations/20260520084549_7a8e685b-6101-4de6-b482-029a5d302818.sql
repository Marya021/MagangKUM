
TRUNCATE TABLE
  public.activity_logs,
  public.notifications,
  public.supervisors,
  public.reports,
  public.attendances,
  public.applications,
  public.intern,
  public.positions,
  public.roles,
  public.users
RESTART IDENTITY CASCADE;

DELETE FROM auth.identities;
DELETE FROM auth.users;
