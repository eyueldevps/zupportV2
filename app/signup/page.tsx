import Link from "next/link";
import { signup } from "../actions/auth";
import { Alert, Field } from "@/components/forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <form action={signup} className="card mt-6 space-y-4 p-6">
        {error && <Alert kind="error">{error}</Alert>}
        <Field label="Name" name="name" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
        <Field label="Password (8+ characters)" name="password" type="password" autoComplete="new-password" />
        <button className="btn w-full">Create account</button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-link">Log in</Link></p>
    </div>
  );
}
