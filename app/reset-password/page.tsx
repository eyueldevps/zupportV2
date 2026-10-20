import { resetPassword } from "../actions/auth";
import { Alert, Field } from "@/components/forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token = "", error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold">Choose a new password</h1>
      <form action={resetPassword} className="card mt-6 space-y-4 p-6">
        {error && <Alert kind="error">{error}</Alert>}
        <input type="hidden" name="token" value={token} />
        <Field label="New password (8+ characters)" name="password" type="password" autoComplete="new-password" />
        <button className="btn w-full">Save new password</button>
      </form>
    </div>
  );
}
