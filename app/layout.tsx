import "./globals.css";
import { cookies } from "next/headers";
import Link from "next/link";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getLocale, getT } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], variable: "--font-ethiopic" });
export const metadata = { title: "Zupport: Support What Matters", description: "Support creators and communities in Birr." };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const dark = (await cookies()).get("theme")?.value === "dark"; // light unless the user chose dark
  const t = await getT();
  return (
    <html lang={await getLocale()} className={`${inter.variable} ${ethiopic.variable} ${dark ? "dark" : ""}`}>
      <body className="font-sans">
        <header className="border-b border-border bg-card">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3" aria-label="Main">
            <Link href="/" aria-label="Zupport home"><Logo /></Link>
            <div className="flex items-center gap-5 text-sm font-medium">
              <Link href="/explore">{t("nav.explore")}</Link>
              <Link href="/#how" className="hidden sm:inline">{t("nav.how")}</Link>
              <Link href="/#faq" className="hidden sm:inline">{t("nav.faq")}</Link>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-foreground"><Logo size={22} /><span className="text-muted-foreground">{t("footer.tag")}</span></div>
            <div>© {new Date().getFullYear()} Zupport. {t("footer.rights")}</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
