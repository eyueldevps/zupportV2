import "./globals.css";
import { cookies } from "next/headers";
import Link from "next/link";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getLocale, getT } from "@/lib/i18n";
import { currentUser } from "@/lib/session";
import { logout } from "./actions/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], variable: "--font-ethiopic" });

export const metadata = {
  title: "Zupport: Support What Matters",
  description: "Support creators and communities in Birr.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const dark = (await cookies()).get("theme")?.value === "dark";
  const t = await getT();
  const user = await currentUser();
  return (
    <html lang={await getLocale()} className={`${inter.variable} ${ethiopic.variable} ${dark ? "dark" : ""}`}>
      <body className="font-sans">
        <header className="border-b border-border bg-card">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3" aria-label="Main">
            <Link href="/" aria-label="Zupport home"><Logo size={44} /></Link>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <Link href="/explore">{t("nav.explore")}</Link>
              <Link href="/#how" className="hidden sm:inline">{t("nav.how")}</Link>
              <Link href="/#faq" className="hidden sm:inline">{t("nav.faq")}</Link>
              {user ? (<>
                <Link href="/memberships">My support</Link>
                <Link href="/account">Account</Link>
                {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
                <form action={logout}><button className="text-muted-foreground hover:text-foreground">Log out</button></form>
              </>) : (<>
                <Link href="/login">Log in</Link>
                <Link href="/signup" className="btn !py-1.5">Sign up</Link>
              </>)}
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <Logo size={48} />
            <nav aria-label="Legal" className="flex flex-wrap gap-4">
              <Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link>
              <Link href="/refunds">Refunds</Link><Link href="/guidelines">Guidelines</Link>
            </nav>
            <div>© {new Date().getFullYear()} Zupport. {t("footer.rights")}</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
