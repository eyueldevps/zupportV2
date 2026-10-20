import { LegalPage } from "@/components/LegalPage";
export const metadata = { title: "Refund Policy | Zupport" };
export default function Refunds() {
  return (
    <LegalPage title="Refund Policy">
      <h2>Memberships and tips</h2>
      <p>Support is given freely, so memberships and tips are generally not refundable once approved.</p>
      <h2>When we will help</h2>
      <p>If you paid the wrong amount, paid twice, or a creator did not deliver what their membership promised, contact us with your payment reference. We will review each case and may refund or correct it.</p>
      <h2>Rejected payments</h2>
      <p>If a payment cannot be matched to our Telebirr records it will be rejected with a reason. Contact us with your receipt and we will look again.</p>
    </LegalPage>
  );
}
