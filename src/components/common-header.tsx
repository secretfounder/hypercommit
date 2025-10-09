import { buttonVariants } from "./ui/button";
import { ExternalLinkIcon } from "lucide-react";
import { Header } from "./header";

export function CommonHeader() {
  return (
    <Header>
      <a
        className={buttonVariants({ variant: "ghost", className: "mx-2" })}
        href="https://blog.hypercommit.com"
        target="_blank"
      >
        Blog
        <ExternalLinkIcon className="h-4 w-4" />
      </a>
    </Header>
  );
}
