import { createAuthClient } from "better-auth/react";
import { usernameClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [usernameClient(), organizationClient()],
});

export const { signIn, signUp, signOut, useSession, useActiveOrganization } =
  authClient;
