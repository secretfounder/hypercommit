import { CommonHeader } from "@/components/common-header";
import { RepositoryCard } from "@/components/repository-card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { GitBranchIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getRepositories } from "@/app/repositories/actions";

export default async function Home() {
  const session = await getSession();
  const repositories = session?.user ? await getRepositories() : [];

  const hasRepositories = repositories.length > 0;

  return (
    <>
      <CommonHeader />
      <main className="w-full mx-auto max-w-7xl px-4 py-8">
        {hasRepositories ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold">My repositories</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repositories.map((repo) => (
                <RepositoryCard
                  key={repo.id}
                  owner={repo.owner}
                  name={repo.name}
                  defaultBranch={repo.defaultBranch}
                  createdAt={new Date(repo.createdAt)}
                />
              ))}
            </div>
          </div>
        ) : (
          <Empty className="min-h-[calc(100vh-61px-4rem)]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GitBranchIcon />
              </EmptyMedia>
              <EmptyTitle>No repositories yet</EmptyTitle>
              <EmptyDescription>
                {session?.user
                  ? "Get started by creating your first repository."
                  : "Sign up to create and manage your repositories."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href={session?.user ? "/repositories/new" : "/sign-up"}>
                  <PlusIcon className="h-4 w-4" />
                  {session?.user ? "Create repository" : "Sign up"}
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </main>
    </>
  );
}
