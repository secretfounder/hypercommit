import { mkdir, access } from "fs/promises";
import { join, resolve } from "path";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

// Resolve to absolute path to avoid issues with relative paths
const GIT_REPOS_PATH = resolve(process.env.GIT_REPOS_PATH || "/tmp/repositories");

interface CreateRepositoryOptions {
  owner: string;
  repoName: string;
  defaultBranch?: string;
}

/**
 * Initialize a bare git repository on disk
 */
export async function createGitRepository({
  owner,
  repoName,
  defaultBranch = "main",
}: CreateRepositoryOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Create owner directory if it doesn't exist
    const ownerPath = join(GIT_REPOS_PATH, owner);
    await mkdir(ownerPath, { recursive: true });

    // Create repository directory
    const repoPath = join(ownerPath, `${repoName}.git`);

    // Check if repository already exists
    try {
      await access(repoPath);
      return { success: false, error: "Repository already exists" };
    } catch {
      // Repository doesn't exist, proceed with creation
    }

    // Initialize bare git repository
    await execAsync(`git init --bare --initial-branch=${defaultBranch} "${repoPath}"`);

    // Configure repository to allow pushes over HTTP
    await execAsync(`git -C "${repoPath}" config http.receivepack true`);

    return { success: true };
  } catch (error) {
    console.error("Failed to create git repository:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if a git repository exists on disk
 */
export async function gitRepositoryExists(
  owner: string,
  repoName: string
): Promise<boolean> {
  try {
    const repoPath = join(GIT_REPOS_PATH, owner, `${repoName}.git`);
    await access(repoPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a git repository from disk
 */
export async function deleteGitRepository(
  owner: string,
  repoName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const repoPath = join(GIT_REPOS_PATH, owner, `${repoName}.git`);
    await execAsync(`rm -rf "${repoPath}"`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete git repository:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
