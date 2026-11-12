import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  role: 'user' | 'caregiver' = 'user'
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('getOrCreateUser database error:', error);
    // Sanitize error
    throw new Error('Database operation failed for user record.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const records = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return records[0] || null;
  } catch (error) {
    console.error('getUserByUid error:', error);
    throw new Error('Failed to query user.', { cause: error });
  }
}

export async function updateUserRole(uid: string, role: 'user' | 'caregiver') {
  try {
    const result = await db
      .update(users)
      .set({ role })
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('updateUserRole error:', error);
    throw new Error('Failed to update user role.', { cause: error });
  }
}
