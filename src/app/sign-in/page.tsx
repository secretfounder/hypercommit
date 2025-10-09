"use client";

import { CommonHeader } from "@/components/common-header";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoIcon, MailIcon, LockIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to sign in");
        return;
      }

      if (data) {
        toast.success("Signed in successfully!");
        router.push("/");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <CommonHeader />
      <main className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center w-full mx-auto max-w-xs space-y-6 py-6">
        <h2 className="font-medium text-xl text-center">Sign in</h2>
        <Alert>
          <InfoIcon />
          <AlertTitle>Hypercommit is in early development.</AlertTitle>
          <AlertDescription className="text-pretty">
            Please reach out to the team if you encounter any issues.
          </AlertDescription>
        </Alert>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@doe.com"
              required
              disabled={isLoading}
              icon={<MailIcon className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••••••"
              required
              disabled={isLoading}
              icon={<LockIcon className="h-4 w-4" />}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Submit"}
          </Button>
        </form>
      </main>
    </>
  );
}
