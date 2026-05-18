import Link from "next/link";

export default function HomePage() {
  return (
    <div className="landing-layout">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="brand-icon">⌂</span>
            <strong>HomeRental</strong>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content">
          <span className="eyebrow">Smart Property Management</span>
          <h1 className="hero-title">
            The effortless way to manage <span className="text-highlight">premium</span> rentals.
          </h1>
          <p className="hero-subtitle">
            Experience next-generation tenant management, automated service requests, and intelligent booking flows—all from one unified platform.
          </p>
          <div className="hero-actions">
            <a href="#features" className="primary-button hero-btn">Explore Features</a>
            <a href="#contact" className="ghost-button hero-btn">Get in Touch</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card surface">
            <div className="visual-header">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
            <div className="visual-body">
              <div className="skeleton-line" />
              <div className="skeleton-block" />
              <div className="skeleton-line short" />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="section-container">
          <div className="section-heading">
            <h2>Designed for modern landlords</h2>
            <p>Everything you need to scale your property portfolio without the operational headache.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card surface">
              <div className="feature-icon">📊</div>
              <h3>Intelligent Bookings</h3>
              <p>Automate reservation flows, handle deposit processing securely, and keep your calendar perfectly synced.</p>
            </div>
            <div className="feature-card surface">
              <div className="feature-icon">🛠️</div>
              <h3>Service Flow Engine</h3>
              <p>Seamlessly dispatch maintenance and add-on services directly to drivers and commercial suppliers.</p>
            </div>
            <div className="feature-card surface">
              <div className="feature-icon">📱</div>
              <h3>Tenant Experience</h3>
              <p>Give your tenants a world-class mobile interface for managing their stay and requesting assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="landing-section alt-bg">
        <div className="section-container about-layout">
          <div className="about-text">
            <h2>About Us</h2>
            <p>
              At HomeRental, we believe that property management shouldn't mean drowning in spreadsheets and fragmented communication. We set out to build an ecosystem that connects property owners, tenants, and service providers in real time.
            </p>
            <p>
              By leveraging modern automation and a beautifully crafted interface, we turn the complexities of real estate operations into a smooth, delightful experience.
            </p>
          </div>
          <div className="about-stats">
            <div className="stat-box surface stat-primary">
              <strong>99%</strong>
              <span>System Uptime</span>
              <p>Reliable infrastructure for your properties.</p>
            </div>
            <div className="stat-box surface stat-secondary">
              <strong>24/7</strong>
              <span>Priority Support</span>
              <p>We are always here when you need us.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-section">
        <div className="section-container">
          <div className="section-heading">
            <h2>Get in Touch</h2>
            <p>Ready to modernize your property operations? Send us a message or visit our headquarters.</p>
          </div>
          <div className="contact-layout">
            <form className="contact-form surface">
              <h3>Send a Message</h3>
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="primary-button">Send Message</button>
            </form>
            <div className="contact-map surface">
              <h3>Our Location</h3>
              <div className="map-wrapper">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0673752535035!2d-122.39572418468165!3d37.78851397975661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064bf350e9d%3A0x6a0ed7d01306b997!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus" 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <strong>HomeRental</strong>
            <p className="footer-desc">
              Elevating property management through intelligent automation, seamless tenant experiences, and robust service provider integration. We are building the future of real estate operations, ensuring owners maximize yield while minimizing operational friction.
            </p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Contact Us</h4>
              <a href="mailto:support@homerental.com">support@homerental.com</a>
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HomeRental. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
