export function Field({ label, name, type = "text", autoComplete, required = true }:
  { label: string; name: string; type?: string; autoComplete?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium">{label}
      <input name={name} type={type} autoComplete={autoComplete} required={required} className="input mt-1" />
    </label>
  );
}
export function Alert({ kind, children }: { kind: "error" | "ok"; children: React.ReactNode }) {
  return (
    <p role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl border p-3 text-sm ${kind === "error" ? "border-danger text-danger" : "border-secondary text-secondary"}`}>
      <b>{kind === "error" ? "Problem: " : "Done: "}</b>{children}
    </p>
  );
}
