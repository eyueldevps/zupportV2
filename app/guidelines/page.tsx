import { LegalPage } from "@/components/LegalPage";
export const metadata = { title: "Community Guidelines | Zupport" };
export default function Guidelines() {
  return (
    <LegalPage title="Community Guidelines">
      <h2>Be honest</h2>
      <p>Do not mislead supporters about who you are, what you do, or what members will receive. Do not impersonate others.</p>
      <h2>Be respectful</h2>
      <p>No hateful, harassing or abusive content, and no threats.</p>
      <h2>Stay legal</h2>
      <p>No illegal content or activity, and no content you do not have the right to share.</p>
      <h2>Reporting</h2>
      <p>If you see something that breaks these rules, use the Report link on the page or post. We review reports by hand.</p>
      <h2>Verified badge</h2>
      <p>Verified means we checked the identity of the person who runs the page. It does not mean we endorse what they say.</p>
    </LegalPage>
  );
}
