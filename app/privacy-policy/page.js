import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="landing-layout">
      <nav className="landing-nav surface">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="brand-icon">⌂</span>
            <strong>HomeRental</strong>
          </div>
          <div className="nav-links">
            <Link href="/">Back to Home</Link>
          </div>
        </div>
      </nav>

      <main className="legal-container">
        <article className="legal-document surface">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to HomeRental. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our mobile application and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2>2. The data we collect about you</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul>
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
              <li><strong>Financial Data</strong> includes bank account and payment card details.</li>
              <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
            </ul>
          </section>

          <section>
            <h2>3. How we use your personal data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul>
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2>5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> support@homerental.com<br />
              <strong>Phone:</strong> +1 (234) 567-890
            </p>
          </section>
        </article>
      </main>

      <footer className="landing-footer" style={{ marginTop: "0" }}>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HomeRental. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
