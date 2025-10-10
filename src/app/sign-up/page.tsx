import { CommonHeader } from "@/components/common-header";
import { SignUpForm } from "@/components/sign-up-form";

export const dynamic = 'force-dynamic';

export default function SignUp() {
  return (
    <>
      <CommonHeader />
      <SignUpForm />
    </>
  );
}
