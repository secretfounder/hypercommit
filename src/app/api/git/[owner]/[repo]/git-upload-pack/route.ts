import { NextRequest, NextResponse } from "next/server";
import { authenticateBasicAuth, checkRepositoryAccess } from "@/lib/git-auth";
import { spawn } from "child_process";
import { join } from "path";

const GIT_REPOS_PATH = process.env.GIT_REPOS_PATH || "/tmp/repositories";

interface RouteContext {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const params = await context.params;
  const { owner, repo } = params;

  // Construct repository path
  const repoPath = join(GIT_REPOS_PATH, owner, `${repo}.git`);

  // Authenticate user
  const authHeader = request.headers.get("authorization");
  const authResult = await authenticateBasicAuth(authHeader);

  // Check repository access (read operation)
  const hasAccess = await checkRepositoryAccess(
    owner,
    repo,
    authResult.user?.id,
    "read"
  );

  if (!hasAccess) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Git"',
      },
    });
  }

  // Get request body
  const body = await request.arrayBuffer();

  // Execute git command
  return new Promise((resolve) => {
    const git = spawn("git", ["upload-pack", "--stateless-rpc", repoPath]);

    const chunks: Buffer[] = [];
    let errorOutput = "";

    // Write request body to git process
    if (body.byteLength > 0) {
      git.stdin.write(Buffer.from(body));
    }
    git.stdin.end();

    git.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    git.stderr.on("data", (chunk: Buffer) => {
      errorOutput += chunk.toString();
    });

    git.on("close", (code) => {
      if (code !== 0) {
        console.error("git upload-pack failed:", errorOutput);
        resolve(
          new NextResponse("Git command failed", { status: 500 })
        );
        return;
      }

      const output = Buffer.concat(chunks);
      resolve(
        new NextResponse(output, {
          headers: {
            "Content-Type": "application/x-git-upload-pack-result",
            "Cache-Control": "no-cache",
          },
        })
      );
    });

    git.on("error", (error) => {
      console.error("Failed to spawn git:", error);
      resolve(
        new NextResponse("Failed to execute git command", { status: 500 })
      );
    });
  });
}
