import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";
// ✅ Export route handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
