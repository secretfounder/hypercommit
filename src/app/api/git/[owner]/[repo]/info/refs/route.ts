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

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const params = await context.params;
  const { owner, repo } = params;
  const service = request.nextUrl.searchParams.get("service");

  if (!service || !["git-upload-pack", "git-receive-pack"].includes(service)) {
    return new NextResponse("Invalid service", { status: 400 });
  }

  // Construct repository path
  const repoPath = join(GIT_REPOS_PATH, owner, `${repo}.git`);

  // Determine operation type
  const operation = service === "git-upload-pack" ? "read" : "write";

  // Authenticate user
  const authHeader = request.headers.get("authorization");
  const authResult = await authenticateBasicAuth(authHeader);

  // Check repository access
  const hasAccess = await checkRepositoryAccess(
    owner,
    repo,
    authResult.user?.id,
    operation
  );

  if (!hasAccess) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Git"',
      },
    });
  }

  // Execute git command
  return new Promise((resolve) => {
    const git = spawn("git", [service.replace("git-", ""), "--stateless-rpc", "--advertise-refs", repoPath]);

    const chunks: Buffer[] = [];
    let errorOutput = "";

    git.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    git.stderr.on("data", (chunk: Buffer) => {
      errorOutput += chunk.toString();
    });

    git.on("close", (code) => {
      if (code !== 0) {
        console.error(`git ${service} failed:`, errorOutput);
        resolve(
          new NextResponse("Git command failed", { status: 500 })
        );
        return;
      }

      const output = Buffer.concat(chunks);
      const packetLine = `# service=${service}\n`;
      const length = (packetLine.length + 4).toString(16).padStart(4, "0");
      const header = `${length}${packetLine}0000`;

      resolve(
        new NextResponse(Buffer.concat([Buffer.from(header), output]), {
          headers: {
            "Content-Type": `application/x-${service}-advertisement`,
            "Cache-Control": "no-cache",
          },
        })
      );
    });

    git.on("error", (error) => {
      console.error(`Failed to spawn git:`, error);
      resolve(
        new NextResponse("Failed to execute git command", { status: 500 })
      );
    });
  });
}
