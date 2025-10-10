import { db } from "@/db";
import { user, account, repository } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { scrypt, timingSafeEqual, type ScryptOptions } from "crypto";

// Custom promisified scrypt that properly handles options
const scryptAsync = (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: ScryptOptions
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    if (options) {
      scrypt(password, salt, keylen, options, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    } else {
      scrypt(password, salt, keylen, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    }
  });
};

interface AuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    username: string | null;
    email: string;
  };
}

/**
 * Parse HTTP Basic Auth header
 */
export function parseBasicAuth(authHeader: string | null): {
  username: string;
  password: string;
} | null {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return null;
  }

  try {
    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const [username, password] = credentials.split(":");

    if (!username || !password) {
      return null;
    }

    return { username, password };
  } catch {
    return null;
  }
}

/**
 * Verify password against better-auth's scrypt hash
 * Better-auth stores passwords in format: salt:hash
 * Uses scrypt with parameters: N=16384, r=16, p=1, dkLen=64
 */
async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Better-auth format is salt:hash (salt comes first!)
    const [salt, hash] = storedHash.split(":");

    if (!salt || !hash) {
      return false;
    }

    // Normalize password using NFKC (same as better-auth)
    const normalizedPassword = password.normalize("NFKC");

    const hashBuffer = Buffer.from(hash, "hex");

    // Important: Better-auth passes salt as a HEX STRING, not as bytes
    // The @noble/hashes library UTF-8 encodes the string
    // So we pass the hex string directly, not the decoded bytes
    const saltString = salt;

    // Derive key using scrypt with same parameters as better-auth
    // N=16384, r=16, p=1, dkLen=64
    // maxmem is calculated as: 128 * N * r * 2
    const derivedKey = await scryptAsync(normalizedPassword, saltString, 64, {
      N: 16384,
      r: 16,
      p: 1,
      maxmem: 128 * 16384 * 16 * 2,
    });

    // Compare using timing-safe comparison
    return (
      hashBuffer.length === derivedKey.length &&
      timingSafeEqual(hashBuffer, derivedKey)
    );
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Authenticate user via HTTP Basic Auth
 */
export async function authenticateBasicAuth(
  authHeader: string | null
): Promise<AuthResult> {
  const credentials = parseBasicAuth(authHeader);

  if (!credentials) {
    return { authenticated: false };
  }

  try {
    // Find user by username or email
    const foundUser = await db
      .select({
        id: user.id,
        username: user.username,
        email: user.email,
      })
      .from(user)
      .where(
        credentials.username.includes("@")
          ? eq(user.email, credentials.username)
          : eq(user.username, credentials.username)
      )
      .limit(1);

    if (foundUser.length === 0) {
      return { authenticated: false };
    }

    // Get user's password hash from account table
    const userAccount = await db
      .select({
        password: account.password,
      })
      .from(account)
      .where(
        and(
          eq(account.userId, foundUser[0].id),
          eq(account.providerId, "credential")
        )
      )
      .limit(1);

    if (userAccount.length === 0 || !userAccount[0].password) {
      return { authenticated: false };
    }

    // Verify password
    const isValid = await verifyPassword(
      credentials.password,
      userAccount[0].password
    );

    if (!isValid) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: foundUser[0],
    };
  } catch {
    return { authenticated: false };
  }
}

/**
 * Check if user has access to a repository
 */
export async function checkRepositoryAccess(
  owner: string,
  repoName: string,
  userId: string | undefined,
  operation: "read" | "write"
): Promise<boolean> {
  try {
    // First, find the owner user
    const ownerUser = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(
        owner.includes("@") ? eq(user.email, owner) : eq(user.username, owner)
      )
      .limit(1);

    if (ownerUser.length === 0) {
      return false;
    }

    // Now find the repository by name and owner
    const repo = await db
      .select({
        id: repository.id,
        visibility: repository.visibility,
        userId: repository.userId,
        organizationId: repository.organizationId,
      })
      .from(repository)
      .where(
        and(
          eq(repository.name, repoName),
          eq(repository.userId, ownerUser[0].id)
        )
      )
      .limit(1);

    if (repo.length === 0) {
      return false;
    }

    const repoData = repo[0];

    // Public repositories allow read access to anyone
    if (operation === "read" && repoData.visibility === "public") {
      return true;
    }

    // For write operations or private repositories, user must be authenticated
    if (!userId) {
      return false;
    }

    // Check if user owns the repository
    if (repoData.userId === userId) {
      return true;
    }

    // TODO: Check organization membership for organization-owned repositories
    // This would require querying the member table

    return false;
  } catch (error) {
    console.error("Repository access check error:", error);
    return false;
  }
}
