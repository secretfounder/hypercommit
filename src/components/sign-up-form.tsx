"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InfoIcon,
  UserIcon,
  AtSignIcon,
  MailIcon,
  LockIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(1, "Display name is required").max(100, "Display name is too long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpFormData) {
    try {
      const { data: authData, error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        username: data.username,
      });

      if (error) {
        // Log the full error for debugging
        console.error("Sign up error:", error);

        // Check for specific error messages
        let errorMessage: string;
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else {
          errorMessage = JSON.stringify(error) || "Failed to create account";
        }

        // Display user-friendly error messages and set field-specific errors
        if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("already")) {
          setError("email", {
            type: "server",
            message: "This email is already registered",
          });
          toast.error("This email is already registered. Please sign in or use a different email.");
        } else if (errorMessage.toLowerCase().includes("username") && errorMessage.toLowerCase().includes("already")) {
          setError("username", {
            type: "server",
            message: "This username is already taken",
          });
          toast.error("This username is already taken. Please choose a different username.");
        } else {
          toast.error(errorMessage);
        }
        return;
      }

      if (authData) {
        toast.success("Account created successfully!");
        router.push("/");
      }
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center w-full mx-auto max-w-xs space-y-6 py-6">
      <h2 className="font-medium text-xl text-center">Create an account</h2>
      <Alert>
        <InfoIcon />
        <AlertTitle>Hypercommit is in early development.</AlertTitle>
        <AlertDescription className="text-pretty">
          Please reach out to the team if you encounter any issues.
        </AlertDescription>
      </Alert>
      <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={isSubmitting}
            icon={<UserIcon className="h-4 w-4" />}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="johndoe"
            disabled={isSubmitting}
            icon={<AtSignIcon className="h-4 w-4" />}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@doe.com"
            disabled={isSubmitting}
            icon={<MailIcon className="h-4 w-4" />}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••••••"
            disabled={isSubmitting}
            icon={<LockIcon className="h-4 w-4" />}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Submit"}
        </Button>
      </form>
    </main>
  );
}
