"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { repository } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createGitRepository } from "@/lib/git-repository";

export async function getRepositories() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  try {
    const repositories = await db
      .select()
      .from(repository)
      .where(eq(repository.userId, session.user.id))
      .orderBy(repository.createdAt);

    return repositories.map((repo) => ({
      ...repo,
      owner: session.user.username || session.user.name,
    }));
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

export async function createRepository(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const defaultBranch = formData.get("defaultBranch") as string;
  const visibility = (formData.get("visibility") as string) || "public";

  if (!name || !defaultBranch) {
    return { error: "Missing required fields" };
  }

  const owner = session.user.username || session.user.name;

  try {
    // Create database entry
    const newRepository = await db
      .insert(repository)
      .values({
        id: crypto.randomUUID(),
        name,
        defaultBranch,
        visibility,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create git repository on disk
    const gitResult = await createGitRepository({
      owner,
      repoName: name,
      defaultBranch,
    });

    if (!gitResult.success) {
      // Rollback database entry if git creation fails
      await db.delete(repository).where(eq(repository.id, newRepository[0].id));

      return { error: `Failed to create git repository: ${gitResult.error}` };
    }

    revalidatePath("/");
    revalidatePath("/repositories");

    return {
      success: true,
      repository: newRepository[0],
      username: owner,
    };
  } catch (error) {
    console.error("Error creating repository:", error);
    return { error: "Failed to create repository" };
  }
}
