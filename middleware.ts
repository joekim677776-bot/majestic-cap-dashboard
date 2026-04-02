import NextAuth from "next-auth";
import authConfig from "./src/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api/auth|api/webhook|access-denied|_next/static|_next/image|favicon.ico).*)"],
};
