import type { Timestamp } from 'firebase/firestore';

export type Role = 'editor' | 'admin';

/** allowedUsers/{email} */
export interface AllowedUser {
  email: string;
  role: Role;
  addedBy: string;
  addedAt: Timestamp | null;
}
