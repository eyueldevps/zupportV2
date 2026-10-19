import { cookies } from "next/headers";
import en from "@/messages/en.json";
import am from "@/messages/am.json";

const dict: Record<string, Record<string, string>> = { en, am };
export type Key = keyof typeof en;

export async function getLocale() {
  const l = (await cookies()).get("lang")?.value;
  return l && l in dict ? l : "en";
}
export async function getT() {
  const l = await getLocale();
  return (k: Key) => dict[l][k] ?? en[k];
}
