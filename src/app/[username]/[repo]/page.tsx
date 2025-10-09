import { CommonHeader } from "@/components/common-header";
import { CloneInstructions } from "@/components/clone-instructions";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { repository, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LockIcon, GlobeIcon } from "lucide-react";

type RepositoryPageProps = {
  params: Promise<{
    username: string;
    repo: string;
  }>;
};

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { username, repo } = await params;

  const repoData = await db
    .select({
      id: repository.id,
      name: repository.name,
      defaultBranch: repository.defaultBranch,
      visibility: repository.visibility,
      createdAt: repository.createdAt,
      username: user.username,
    })
    .from(repository)
    .innerJoin(user, eq(repository.userId, user.id))
    .where(and(eq(user.username, username), eq(repository.name, repo)))
    .limit(1);

  if (!repoData.length) {
    notFound();
  }

  const { name, visibility } = repoData[0];
  const isPrivate = visibility === "private";

  return (
    <>
      <CommonHeader />
      <main className="min-h-[calc(100vh-61px)] w-full mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-semibold">
              {username}/{name}
            </h1>
            <Badge className="bg-card" variant="outline">
              {isPrivate ? (
                <>
                  <LockIcon className="h-3 w-3 mr-1" />
                  Private
                </>
              ) : (
                <>
                  <GlobeIcon className="h-3 w-3 mr-1" />
                  Public
                </>
              )}
            </Badge>
          </div>

          <CloneInstructions username={username} repo={name} />
        </div>
      </main>
    </>
  );
}
