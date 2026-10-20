import { LegalPage } from "@/components/LegalPage";
export const metadata = { title: "Privacy Policy | Zupport" };
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>What we collect</h2>
      <p>Your name, email address and password (stored only as a one-way hash). When you pay, the Telebirr transaction ID and the receipt screenshot you upload. Creators who ask for verification also send a photo of an ID and a selfie.</p>
      <h2>How we use it</h2>
      <p>To run your account, check and approve payments, keep the platform safe, and contact you about your account. We do not sell your data.</p>
      <h2>Who can see it</h2>
      <p>Payment screenshots and verification photos are visible only to Zupport staff. Verification photos are deleted as soon as a decision is made. Creators can see the names of people who support them, but not your email or payment details.</p>
      <h2>Cookies and third parties</h2>
      <p>We use a cookie to keep you logged in and one to remember light or dark mode. Videos are embedded from YouTube using its privacy-enhanced mode.</p>
      <h2>Your choices</h2>
      <p>You can ask us to correct or delete your account data. Some payment records must be kept for accounting.</p>
    </LegalPage>
  );
}
