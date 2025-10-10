import { CommonHeader } from "@/components/common-header";
import { SignInForm } from "@/components/sign-in-form";

export const dynamic = 'force-dynamic';

export default function SignIn() {
  return (
    <>
      <CommonHeader />
      <SignInForm />
    </>
  );
}
