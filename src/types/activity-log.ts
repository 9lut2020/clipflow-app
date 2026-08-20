export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  meta: {
    clipName?: string;
    projectName?: string;
    targetName?: string;
    newRole?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  actor: { name: string; pictureUrl?: string } | null;
}
