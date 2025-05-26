import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/Common.css';
import '../styles/pages/LandingPage.css';
import useDocumentTitle from '../hooks/useDocumentTitle';

function LandingPage() {
  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });

    // Scroll to top button functionality
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    
    const toggleScrollToTopBtn = () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    };
    
    window.addEventListener('scroll', toggleScrollToTopBtn);
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    return () => {
      window.removeEventListener('scroll', toggleScrollToTopBtn);
      // Clean up anchor event listeners
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', () => {});
      });
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Set title to just "Be Pawsitive" for the landing page
  useDocumentTitle('Be Pawsitive');
  
  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <Link className="navbar-brand fw-bold align-content-center" to="/">
            <img src="/images/bp_logo.png" alt="Be Pawsitive" width="50" height="50" />
            <span className="brand-text">Be Pawsitive</span>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <a className="nav-link" href="#features">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#testimonials">Testimonials</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
              <li className="nav-item ms-3">
                <Link className="btn btn-outline-primary" to="/signup">Sign Up</Link>
              </li>
              <li className="nav-item ms-3">
                <Link className="btn btn-primary" to="/login">Login</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1 className="display-4 fw-bold mb-4">Bringing Furry Friends Back Home</h1>
          <p className="lead mb-4">Join our warm community dedicated to reuniting lost pets with their families and finding loving homes for those in need.</p>
          <div className="hero-buttons">
            <a href="#features" className="btn btn-primary btn-lg me-3">Learn More</a>
            <Link to="/signup" className="btn btn-outline-light btn-lg">Get Started</Link>
          </div>
        </div>
        <div className="overlay"></div>
        <div className="floating-paws">
          <i className="fas fa-paw paw-1"></i>
          <i className="fas fa-paw paw-2"></i>
          <i className="fas fa-paw paw-3"></i>
          <i className="fas fa-paw paw-4"></i>
          <i className="fas fa-paw paw-5"></i>
        </div>
      </header>

      <section id="features" className="py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="fw-bold">Why Choose <span className="highlight">Be Pawsitive</span>?</h2>
            <p className="section-subtitle">Our heartfelt mission is to create a community where every pet finds their way home</p>
          </div>
          <div className="row mt-4 g-4">
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-paw"></i>
                </div>
                <h4>Lost Pet Database</h4>
                <p>Our comprehensive database helps match your missing furry friend with pets that have been found in your area.</p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-bell"></i>
                </div>
                <h4>Real-Time Alerts</h4>
                <p>Receive instant notifications when someone spots a pet matching your missing companion's description.</p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <h4>Community Support</h4>
                <p>Connect with a caring community of pet lovers ready to help you find or rehome your furry friend.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="fw-bold">Heartwarming <span className="highlight">Stories</span></h2>
            <p className="section-subtitle">Real experiences from pet parents in our community</p>
          </div>
          <div className="row testimonial-cards">
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="testimonial-card">
                <div className="testimonial-img">
                  <img src="https://randomuser.me/api/portraits/women/32.jpg" alt="Sarah J." />
                </div>
                <div className="testimonial-content">
                  <p>"Thanks to Be Pawsitive, I found my cat Mittens after she went missing for 2 weeks. The community support was incredible!"</p>
                  <h5>Sarah J.</h5>
                  <span>Cat Parent</span>
                </div>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div className="testimonial-card">
                <div className="testimonial-img">
                  <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="Michael T." />
                </div>
                <div className="testimonial-content">
                  <p>"When my dog Max ran away, I was heartbroken. Be Pawsitive's alert system helped reunite us within days. Forever grateful!"</p>
                  <h5>Michael T.</h5>
                  <span>Dog Parent</span>
                </div>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
              <div className="testimonial-card">
                <div className="testimonial-img">
                  <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Emily R." />
                </div>
                <div className="testimonial-content">
                  <p>"As a shelter volunteer, I've witnessed countless joyful reunions through Be Pawsitive. It truly makes a difference!"</p>
                  <h5>Emily R.</h5>
                  <span>Shelter Volunteer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-5">
        <div className="container">
          <div className="contact-wrapper">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <h2 className="fw-bold mb-4">Let's <span className="highlight">Connect</span></h2>
                <p className="mb-4">Have questions about our platform? Want to volunteer or partner with us? Reach out and join our mission to reunite more pets with their families.</p>
                <div className="contact-info">
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-envelope me-3"></i>
                    <a href="mailto:info@bepawsitive.com">info@bepawsitive.com</a>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-phone me-3"></i>
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="fas fa-map-marker-alt me-3"></i>
                    <span>123 Pet Avenue, Paw City, PC 12345</span>
                  </div>
                </div>
                <div className="social-links mt-4">
                  <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                  <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="contact-form">
                  <form>
                    <div className="mb-3">
                      <input type="text" className="form-control" placeholder="Your Name" required />
                    </div>
                    <div className="mb-3">
                      <input type="email" className="form-control" placeholder="Your Email" required />
                    </div>
                    <div className="mb-3">
                      <textarea className="form-control" rows="4" placeholder="Your Message" required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Send Message</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4 mb-md-0">
              <h5 className="fw-bold mb-3">Be Pawsitive</h5>
              <p>Bringing pets and families together since 2022. Our mission is to create a community where every lost pet finds their way back home.</p>
            </div>
            <div className="col-md-2 mb-4 mb-md-0">
              <h5 className="fw-bold mb-3">Links</h5>
              <ul className="list-unstyled">
                <li><a href="#features">Features</a></li>
                <li><a href="#testimonials">Stories</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4 mb-md-0">
              <h5 className="fw-bold mb-3">Resources</h5>
              <ul className="list-unstyled">
                <li><a href="#">Pet Care Tips</a></li>
                <li><a href="#">Lost Pet Guide</a></li>
                <li><a href="#">Success Stories</a></li>
              </ul>
            </div>
            <div className="col-md-3">
              <h5 className="fw-bold mb-3">Newsletter</h5>
              <p>Join our community updates and pet care tips</p>
              <form className="d-flex">
                <input type="email" className="form-control me-2" placeholder="Your Email" />
                <button className="btn btn-outline-light" type="submit">Join</button>
              </form>
            </div>
          </div>
          <hr className="mt-4 mb-3" />
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0">&copy; {new Date().getFullYear()} Be Pawsitive. All Rights Reserved.</p>
            </div>
            <div className="col-md-6">
              <ul className="list-inline mb-0 text-center text-md-end">
                <li className="list-inline-item"><a href="#">Privacy Policy</a></li>
                <li className="list-inline-item"><a href="#">Terms of Use</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Scroll to Top Button */}
      <button className="scroll-to-top" onClick={scrollToTop}>
        <i className="fas fa-arrow-up"></i>
      </button>
    </>
  );
}

export default LandingPage; 