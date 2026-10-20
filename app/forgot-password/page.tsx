import { forgotPassword } from "../actions/auth";
import { Alert, Field } from "@/components/forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const { error, sent } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <form action={forgotPassword} className="card mt-6 space-y-4 p-6">
        {error && <Alert kind="error">{error}</Alert>}
        {sent && <Alert kind="ok">If that email has an account, a reset link is on its way.</Alert>}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <button className="btn w-full">Send reset link</button>
      </form>
    </div>
  );
}
