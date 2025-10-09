"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranchIcon, LockIcon, GlobeIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRepository } from "@/app/repositories/actions";

export function RepositoryForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  function validateRepositoryName(name: string): boolean {
    // Git repository name validation rules:
    // - Only lowercase letters, numbers, hyphens, underscores, and dots
    // - Cannot start or end with a dot
    // - Cannot have consecutive dots
    // - Cannot be empty
    // - Cannot contain spaces
    // - Cannot end with .git
    // - Cannot be . or ..

    if (!name) {
      setNameError("Repository name is required");
      return false;
    }

    if (name !== name.toLowerCase()) {
      setNameError("Repository name must be lowercase");
      return false;
    }

    if (!/^[a-z0-9._-]+$/.test(name)) {
      setNameError(
        "Only lowercase letters, numbers, dots, hyphens, and underscores are allowed"
      );
      return false;
    }

    if (name.startsWith(".") || name.endsWith(".")) {
      setNameError("Repository name cannot start or end with a dot");
      return false;
    }

    if (name.includes("..")) {
      setNameError("Repository name cannot contain consecutive dots");
      return false;
    }

    if (name.endsWith(".git")) {
      setNameError("Repository name cannot end with .git");
      return false;
    }

    if (name === "." || name === "..") {
      setNameError("Invalid repository name");
      return false;
    }

    if (name.length > 100) {
      setNameError("Repository name must be 100 characters or less");
      return false;
    }

    setNameError(null);
    return true;
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
    e.target.value = value;
    if (value) {
      validateRepositoryName(value);
    } else {
      setNameError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!validateRepositoryName(name)) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await createRepository(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.username) {
        toast.success("Repository created successfully!");
        router.push(`/${result.username}/${name}`);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center w-full mx-auto max-w-md space-y-6 py-6 px-4">
      <h2 className="font-medium text-xl text-center">
        Create a new repository
      </h2>
      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Repository name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="my-awesome-project"
            required
            disabled={isLoading}
            onChange={handleNameChange}
            aria-invalid={nameError ? true : false}
          />
          {nameError && (
            <p className="text-sm text-destructive">{nameError}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultBranch">Default branch</Label>
          <Input
            id="defaultBranch"
            name="defaultBranch"
            type="text"
            placeholder="master"
            defaultValue="master"
            required
            disabled={isLoading}
            icon={<GitBranchIcon className="h-4 w-4" />}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            name="visibility"
            value={visibility}
            onValueChange={(value) => setVisibility(value as "public" | "private")}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Public</div>
                    <div className="text-xs text-muted-foreground">
                      Anyone can see this repository
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <LockIcon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Private</div>
                    <div className="text-xs text-muted-foreground">
                      Only you can see this repository
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={isLoading || nameError !== null}
        >
          {isLoading ? "Creating repository..." : "Create repository"}
        </Button>
      </form>
    </main>
  );
}
