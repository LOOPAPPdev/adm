/**
 * Roles and permissions. One place decides who can do what; services call `can()` before acting.
 * owner / consultant = LOOP team; client_admin / client_member / viewer = client organization.
 */
export const ROLES = ['owner', 'consultant', 'client_admin', 'client_member', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export type Action =
  | 'project.read' | 'project.create' | 'project.edit' | 'project.delete' | 'project.history'
  | 'project.portal_review' | 'org.read' | 'member.add';

const MATRIX: Record<Role, Action[]> = {
  owner: ['project.read', 'project.create', 'project.edit', 'project.delete', 'project.history', 'project.portal_review', 'org.read', 'member.add'],
  consultant: ['project.read', 'project.create', 'project.edit', 'project.history', 'project.portal_review', 'org.read', 'member.add'],
  client_admin: ['project.read', 'project.history', 'project.portal_review', 'org.read', 'member.add'],
  client_member: ['project.read', 'project.portal_review', 'org.read'],
  viewer: ['project.read', 'org.read']
};

export function can(role: Role | null | undefined, action: Action, platformAdmin = false): boolean {
  if (platformAdmin) return true;
  return !!role && MATRIX[role].includes(action);
}

/** Roles a member may grant: the LOOP owner grants any role; consultants and client admins grant client roles. */
export function grantable(role: Role | null, platformAdmin: boolean): Role[] {
  if (platformAdmin || role === 'owner') return [...ROLES];
  if (role === 'consultant') return ['client_admin', 'client_member', 'viewer'];
  if (role === 'client_admin') return ['client_member', 'viewer'];
  return [];
}

export const isClientRole = (r: Role) => r === 'client_admin' || r === 'client_member' || r === 'viewer';
