import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { userTable } from "../db/schema.js";
import type { InferSelectModel } from "drizzle-orm";

class UserService {
  async findOrCreateUser(email: string, uid: string): Promise<InferSelectModel<typeof userTable>[]> {
    const userRecord = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);
    if (userRecord.length > 0) return userRecord;
    const newUser = await db
      .insert(userTable)
      .values({ email, firebaseUid: uid })
      .returning();
    return newUser;
  }
}

const userService = new UserService();
export default userService;
