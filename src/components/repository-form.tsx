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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRepository } from "@/app/repositories/actions";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const repositorySchema = z.object({
  name: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name must be 100 characters or less")
    .refine((val) => val === val.toLowerCase(), {
      message: "Repository name must be lowercase",
    })
    .refine((val) => /^[a-z0-9._-]+$/.test(val), {
      message: "Only lowercase letters, numbers, dots, hyphens, and underscores are allowed",
    })
    .refine((val) => !val.startsWith(".") && !val.endsWith("."), {
      message: "Repository name cannot start or end with a dot",
    })
    .refine((val) => !val.includes(".."), {
      message: "Repository name cannot contain consecutive dots",
    })
    .refine((val) => !val.endsWith(".git"), {
      message: "Repository name cannot end with .git",
    })
    .refine((val) => val !== "." && val !== "..", {
      message: "Invalid repository name",
    }),
  defaultBranch: z
    .string()
    .min(1, "Default branch is required")
    .max(255, "Branch name is too long"),
  visibility: z.enum(["public", "private"]),
});

type RepositoryFormData = z.infer<typeof repositorySchema>;

export function RepositoryForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RepositoryFormData>({
    resolver: zodResolver(repositorySchema),
    defaultValues: {
      name: "",
      defaultBranch: "master",
      visibility: "public",
    },
  });

  async function onSubmit(data: RepositoryFormData) {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("defaultBranch", data.defaultBranch);
      formData.append("visibility", data.visibility);

      const result = await createRepository(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.username) {
        toast.success("Repository created successfully!");
        router.push(`/${result.username}/${data.name}`);
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <main className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center w-full mx-auto max-w-md space-y-6 py-6 px-4">
      <h2 className="font-medium text-xl text-center">
        Create a new repository
      </h2>
      <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Repository name</Label>
          <Input
            id="name"
            type="text"
            placeholder="my-awesome-project"
            disabled={isSubmitting}
            {...register("name", {
              onChange: (e) => {
                // Auto-convert to lowercase and replace spaces with hyphens
                const value = e.target.value.toLowerCase().replace(/\s+/g, "-");
                e.target.value = value;
              },
            })}
            aria-invalid={errors.name ? true : false}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultBranch">Default branch</Label>
          <Input
            id="defaultBranch"
            type="text"
            placeholder="master"
            disabled={isSubmitting}
            icon={<GitBranchIcon className="h-4 w-4" />}
            {...register("defaultBranch")}
          />
          {errors.defaultBranch && (
            <p className="text-sm text-red-500">{errors.defaultBranch.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <GlobeIcon className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <LockIcon className="h-4 w-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.visibility && (
            <p className="text-sm text-red-500">{errors.visibility.message}</p>
          )}
        </div>
        <Button
          className="w-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating repository..." : "Create repository"}
        </Button>
      </form>
    </main>
  );
}
