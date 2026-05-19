"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [message, setMessage] = useState({ name: "", email: "", text: "" });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setMessage({ name: "", email: "", text: "" });
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  return (
    <div className="landing-layout">

      {/* ── Navigation ── */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo-card">
            <span className="brand-logo-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c00b4c"/>
                <path d="M10 11h4v5h-4z" fill="white"/>
                <path d="M8 11l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="brand-logo-text">
              <span className="brand-primary">HomeGo</span>
              <span className="brand-domain">BNB</span>
            </div>
          </div>

          <div className="nav-links">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#destinations" className="nav-link">Destinations</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="list-room-btn">Contact</a>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#destinations" onClick={() => setMobileMenuOpen(false)}>Destinations</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#contact" className="mobile-host-btn" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <header className="landing-hero">
        <div className="hero-background-overlay" />
        <div className="hero-wrapper">
          <p className="hero-eyebrow">Authentic · Local · Sri Lankan</p>
          <h1 className="hero-title">Discover Sri Lanka<br />Like a Local</h1>
          <p className="hero-subtitle">
            Stay in curated homestays across Sri Lanka's most beautiful destinations. From misty hills to golden beaches — experience the island through its people.
          </p>
          <div className="hero-cta-wrapper">
            <a href="#destinations" className="hero-explore-btn">Explore Stays</a>
            <a href="#host" className="hero-host-btn">Become a Host</a>
          </div>
        </div>
      </header>

      {/* ── Stats Strip ── */}
      <section className="stats-strip">
        <div className="stats-inner">
          <div className="stat-item">
            <strong>2,500+</strong>
            <span>Verified Homes</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <strong>9</strong>
            <span>Provinces</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <strong>4.9 ★</strong>
            <span>Avg. Guest Rating</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <strong>24/7</strong>
            <span>Host Support</span>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="landing-section how-section">
        <div className="section-container">
          <div className="section-heading centered">
            <h2>How HomeGoBNB Works</h2>
            <p>A simple three-step journey from search to stay — fully managed for hosts and guests across Sri Lanka.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#c00b4c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <span className="step-num">01</span>
              <h3>Search & Discover</h3>
              <p>Browse verified homestays across Sri Lanka — filter by city, budget, host language, and amenities to find your perfect stay.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#c00b4c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="step-num">02</span>
              <h3>Book Instantly</h3>
              <p>Secure your stay with encrypted payments. Manage dates, special requests, and host communication — all in one place.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#c00b4c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span className="step-num">03</span>
              <h3>Live Like a Local</h3>
              <p>Arrive, connect with your host, and experience authentic Sri Lankan culture — home-cooked meals, local tips, and warm hospitality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ── */}
      <section id="destinations" className="landing-section destinations-section alt-bg">
        <div className="section-container">
          <div className="section-heading centered">
            <h2>Explore Sri Lanka</h2>
            <p>From ancient cities to coastal gems — find authentic homestays across the island's most stunning locations.</p>
          </div>
          <div className="destinations-grid">
            <div className="destination-card large-card">
              <div className="card-image-wrap">
                <img src="/images/dest-sigiriya.jpg" alt="London" />
                <div className="card-overlay" />
                <div className="card-content">
                  <h3>Sigiriya</h3>
                  <span>180 Homestays</span>
                </div>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-wrap">
                <img src="/images/dest-kandy.jpg" alt="Paris" />
                <div className="card-overlay" />
                <div className="card-content">
                  <h3>Kandy</h3>
                  <span>340 Homestays</span>
                </div>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-wrap">
                <img src="/images/dest-galle.jpg" alt="Tokyo" />
                <div className="card-overlay" />
                <div className="card-content">
                  <h3>Galle</h3>
                  <span>290 Homestays</span>
                </div>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-wrap">
                <img src="/images/dest-ella.jpg" alt="Barcelona" />
                <div className="card-overlay" />
                <div className="card-content">
                  <h3>Ella</h3>
                  <span>220 Homestays</span>
                </div>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-wrap">
                <img src="/images/dest-colombo.jpg" alt="New York" />
                <div className="card-overlay" />
                <div className="card-content">
                  <h3>Colombo</h3>
                  <span>520 Homestays</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Become a Host CTA ── */}
      <section id="host" className="host-cta-banner">
        <div className="banner-bg-overlay" />
        <div className="banner-content">
          <span className="badge">For Property Owners</span>
          <h2>Turn Your Home into Income</h2>
          <p>
            Join thousands of Sri Lankan hosts earning extra income by welcoming travelers. HomeGoBNB handles bookings, payments, guest communication, and property services — so you can focus on hospitality.
          </p>
          <div className="banner-ctas">
            <a href="#contact" className="cta-action-btn">Start Hosting Today</a>
            <a href="#how-it-works" className="cta-outline-btn">Learn More</a>
          </div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section id="features" className="landing-section features-section">
        <div className="section-container">
          <div className="section-heading centered">
            <h2>A Platform Built for Both Sides</h2>
            <p>HomeGoBNB powers the full rental lifecycle — from discovery to departure — with intelligent tools for hosts and guests.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>Smart Booking Engine</h3>
              <p>Automated reservation flows, real-time calendar sync, secure deposit handling, and instant confirmation for every stay.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <h3>Host & Guest Profiles</h3>
              <p>Verified identities, review histories, and preference matching help both hosts and travelers build trust before arrival.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h3>Service Dispatch</h3>
              <p>Schedule cleaning, maintenance, and welcome packs through our local supplier network across Sri Lanka.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Secure Payments</h3>
              <p>End-to-end encrypted transactions with LKR and multi-currency support, flexible payouts, and built-in dispute resolution.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <h3>Real-Time Messaging</h3>
              <p>In-platform chat between hosts and guests with Sinhala, Tamil, and English support, read receipts, and notifications.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Rich insights on occupancy rates, revenue trends, guest demographics, and listing performance for every host.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="landing-section about-section alt-bg">
        <div className="section-container about-layout">
          <div className="about-image-col">
            <div className="about-img-wrap">
              <img src="/images/about-1.jpg" alt="Comfortable home living" />
            </div>
            <div className="about-img-float">
              <img src="/images/about-2-hero.jpg" alt="Local neighborhood" />
            </div>
          </div>
          <div className="about-text-col">
            <span className="section-eyebrow">Our Mission</span>
            <h2>Connecting Travelers with Sri Lankan Homes</h2>
            <p>
              HomeGoBNB was built on a simple belief: travel in Sri Lanka is richer when you're welcomed as a neighbor, not a tourist. We connect property owners across the island with independent travelers seeking genuine local experiences.
            </p>
            <p>
              Our platform supports hosts with automated workflows, real-time guest management, and a professional service network — while giving travelers authentic Sri Lankan immersion at every destination, from the cultural triangle to the southern coast.
            </p>
            <div className="about-highlights">
              <div className="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c00b4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Verified hosts across all 9 provinces</span>
              </div>
              <div className="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c00b4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Automated property management for owners</span>
              </div>
              <div className="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c00b4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Sinhala, Tamil & English language support</span>
              </div>
              <div className="highlight-item">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#c00b4c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Mobile apps for hosts and travelers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="landing-section contact-section">
        <div className="section-container">
          <div className="section-heading centered">
            <h2>Get in Touch</h2>
            <p>Questions about listing your property or planning a stay in Sri Lanka? We'd love to hear from you.</p>
          </div>
          <div className="contact-layout">
            <form className="contact-form surface" onSubmit={handleContactSubmit}>
              <h3>Send a Message</h3>
              {contactSubmitted && (
                <div className="form-success-banner">
                  ✓ Message received! Our team will reply within 24 hours.
                </div>
              )}
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your full name" value={message.name} onChange={(e) => setMessage({ ...message, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" value={message.email} onChange={(e) => setMessage({ ...message, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" placeholder="How can we help you?" value={message.text} onChange={(e) => setMessage({ ...message, text: e.target.value })} required></textarea>
              </div>
              <button type="submit" className="primary-button submit-contact-btn">Send Message</button>
            </form>
            <div className="contact-map surface">
              <h3>Our Location</h3>
              <div className="map-wrapper">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.62280669396!2d79.7861!3d6.9271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1650000000000!5m2!1sen!2slk"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="contact-details">
                <p><strong>Email:</strong> <a href="mailto:support@homegobnb.com">support@homegobnb.com</a></p>
                <p><strong>Phone:</strong> <a href="tel:+94112345678">+94 11 234 5678</a></p>
                <p><strong>Address:</strong> Colombo 03, Sri Lanka</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="brand-logo-text white-text">
              <span className="brand-primary">HomeGo</span>
              <span className="brand-domain">BNB</span>
            </div>
            <p className="footer-desc">
              Connecting local Sri Lankan hosts with travelers from around the world. We make homestay rentals simple, safe, and meaningful — for everyone.
            </p>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#host">Become a Host</a>
            </div>
            <div className="link-group">
              <h4>Support</h4>
              <a href="#contact">Contact Us</a>
              <a href="mailto:support@homegobnb.com">Email Support</a>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} HomeGoBNB. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
