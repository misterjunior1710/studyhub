import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const Refund = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Refund Policy — StudyHub"
        description="StudyHub refund policy for subscriptions and purchases made through Dodo Payments."
        canonical="https://studyhub.world/refund"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-invert max-w-none space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">Refund Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: May 17, 2026</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <p className="text-muted-foreground">
              At StudyHub, we want you to be happy with your purchase. This policy explains when
              you can request a refund for paid plans and one-time purchases made through our
              payment processor, Dodo Payments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Eligibility</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>14-day money-back guarantee:</strong> You may request a full refund within
                14 days of your initial purchase of any paid plan, no questions asked.
              </li>
              <li>
                <strong>Subscription renewals:</strong> Recurring renewal charges are non-refundable
                once processed. Cancel before your next billing date to avoid being charged.
              </li>
              <li>
                <strong>Duplicate or accidental charges:</strong> Always eligible for a full refund.
              </li>
              <li>
                <strong>Service downtime:</strong> If StudyHub experiences extended outages that
                materially impact your access, we may offer a pro-rated refund or credit.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Non-Refundable Items</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>One-time consumable purchases (e.g. coin packs) that have already been used.</li>
              <li>Charges older than 14 days outside of the situations listed above.</li>
              <li>Accounts terminated for violating our Terms &amp; Conditions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">How to Request a Refund</h2>
            <p className="text-muted-foreground">
              Email{" "}
              <a href="mailto:studyhub.community.web@gmail.com" className="underline hover:text-primary">
                studyhub.community.web@gmail.com
              </a>{" "}
              from the address associated with your account. Include your order ID or payment
              receipt. We review refund requests within 3 business days, and approved refunds are
              returned to your original payment method within 5–10 business days by Dodo Payments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Relationship to Dodo Payments</h2>
            <p className="text-muted-foreground">
              Payments are processed by Dodo Payments. Where this policy is silent, the{" "}
              <a
                href="https://dodopayments.com/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                Dodo Payments standard refund policy
              </a>{" "}
              applies. Where the two conflict, this StudyHub policy governs your purchase from us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              Questions? Reach us at{" "}
              <a href="mailto:studyhub.community.web@gmail.com" className="underline hover:text-primary">
                studyhub.community.web@gmail.com
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Refund;
