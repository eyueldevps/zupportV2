import Link from "next/link";
import { login } from "../actions/auth";
import { Alert, Field } from "@/components/forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const { error, reset } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold">Log in</h1>
      <form action={login} className="card mt-6 space-y-4 p-6">
        {error && <Alert kind="error">{error}</Alert>}
        {reset && <Alert kind="ok">Password changed. Log in with your new password.</Alert>}
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        <button className="btn w-full">Log in</button>
        <Link href="/forgot-password" className="block text-sm font-medium text-link">Forgot your password?</Link>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">New here? <Link href="/signup" className="font-medium text-link">Create an account</Link></p>
    </div>
  );
}
