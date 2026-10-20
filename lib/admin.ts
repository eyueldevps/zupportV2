import { notFound } from "next/navigation";
import { requireUser } from "./session";

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "ADMIN") notFound(); // non-admins can't even tell the page exists
  return u;
}
