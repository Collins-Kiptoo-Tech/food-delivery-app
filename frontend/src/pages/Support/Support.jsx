import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Support.css";
import { 
  FiHelpCircle, 
  FiMail, 
  FiPhone, 
  FiMessageCircle,
  FiSearch,
  FiChevronRight,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiClock,
  FiBookOpen,
  FiCreditCard,
  FiTruck,
  FiUser,
  FiPackage
} from "react-icons/fi";

const Support = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: user.name || "",
    email: user.email || "",
    subject: "",
    message: ""
  });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // FAQ Data
  const faqs = [
    {
      id: 1,
      category: "orders",
      question: "How do I track my order?",
      answer: "Go to 'My Orders' and click on 'Track Order' next to your order. You'll see a real-time map showing your order status and delivery location."
    },
    {
      id: 2,
      category: "orders",
      question: "How long does delivery take?",
      answer: "Delivery typically takes 30-45 minutes, depending on your location and restaurant preparation time."
    },
    {
      id: 3,
      category: "payment",
      question: "What payment methods do you accept?",
      answer: "We accept PayPal and Cash on Delivery. PayPal payments are processed instantly, while Cash on Delivery requires payment at your doorstep with a KES 50 handling fee."
    },
    {
      id: 4,
      category: "payment",
      question: "Is my payment information secure?",
      answer: "Yes! All payments are processed through secure gateways. PayPal uses industry-standard encryption, and we never store your payment details."
    },
    {
      id: 5,
      category: "account",
      question: "How do I reset my password?",
      answer: "Go to Settings > Change Password. Enter your current password and new password to update your account credentials."
    },
    {
      id: 6,
      category: "account",
      question: "How do I update my profile information?",
      answer: "Click on 'My Profile' in the dropdown menu. You can update your name, email, and other details there."
    },
    {
      id: 7,
      category: "delivery",
      question: "What is the delivery fee?",
      answer: "Delivery fee is KES 75 for all orders. Cash on Delivery orders have an additional KES 50 handling fee."
    },
    {
      id: 8,
      category: "delivery",
      question: "Do you deliver to my area?",
      answer: "We currently deliver within Chuka Town and surrounding areas. Enter your address during checkout to check delivery availability."
    },
    {
      id: 9,
      category: "cancellation",
      question: "Can I cancel my order?",
      answer: "Orders can be cancelled within 5 minutes of placement. After that, the kitchen starts preparing your food and cannot be cancelled."
    },
    {
      id: 10,
      category: "refund",
      question: "What is your refund policy?",
      answer: "If your order is cancelled before preparation, you'll receive a full refund. For quality issues, contact support within 30 minutes of delivery."
    }
  ];

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setFormStatus({ type: "error", message: "Please fill in all fields" });
      return;
    }
    
    setLoading(true);
    setFormStatus({ type: "", message: "" });
    
    try {
      // Send support email
      const response = await axios.post(
        "http://localhost:4000/api/support/contact",
        {
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setFormStatus({ type: "success", message: "Message sent successfully! We'll get back to you within 24 hours." });
        setContactForm({ ...contactForm, subject: "", message: "" });
      } else {
        setFormStatus({ type: "error", message: response.data.message || "Failed to send message" });
      }
    } catch (error) {
      setFormStatus({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-container">
        {/* Header */}
        <div className="support-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <h1>Help & Support</h1>
        </div>
        
        {/* Search Bar */}
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tabs */}
        <div className="support-tabs">
          <button 
            className={`tab ${activeTab === "faq" ? "active" : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            <FiHelpCircle />
            FAQ
          </button>
          <button 
            className={`tab ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <FiMail />
            Contact Us
          </button>
        </div>
        
        {/* FAQ Section */}
        {activeTab === "faq" && (
          <div className="faq-section">
            {Object.keys(groupedFaqs).length === 0 ? (
              <div className="no-results">
                <FiSearch size={48} />
                <h3>No results found</h3>
                <p>Try searching with different keywords</p>
              </div>
            ) : (
              Object.keys(groupedFaqs).map((category) => (
                <div key={category} className="faq-category">
                  <h3 className="category-title">
                    {category === "orders" && <FiPackage />}
                    {category === "payment" && <FiCreditCard />}
                    {category === "account" && <FiUser />}
                    {category === "delivery" && <FiTruck />}
                    {category === "cancellation" && <FiAlertCircle />}
                    {category === "refund" && <FiCheckCircle />}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  
                  {groupedFaqs[category].map((faq) => (
                    <div key={faq.id} className="faq-item">
                      <button
                        className={`faq-question ${expandedFaq === faq.id ? "expanded" : ""}`}
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <span>{faq.question}</span>
                        <FiChevronRight className={`chevron ${expandedFaq === faq.id ? "rotated" : ""}`} />
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Contact Section */}
        {activeTab === "contact" && (
          <div className="contact-section">
            <div className="contact-info">
              <div className="contact-card">
                <FiPhone className="contact-icon" />
                <h3>Call Us</h3>
                <p>0725 280 289</p>
                <p>0737 146 958</p>
                <small>Mon-Fri, 8am - 8pm</small>
              </div>
              
              <div className="contact-card">
                <FiMail className="contact-icon" />
                <h3>Email Us</h3>
                <p>supportfreshfeast@gmail.com</p>
                <p>orders@freshfeast.com</p>
                <small>Response within 24 hours</small>
              </div>
              
              <div className="contact-card">
                <FiClock className="contact-icon" />
                <h3>Support Hours</h3>
                <p>Monday - Friday: 8am - 8pm</p>
                <p>Saturday: 9am - 6pm</p>
                <p>Sunday: 10am - 4pm</p>
              </div>
            </div>
            
            <div className="contact-form-container">
              <h3>Send us a message</h3>
              
              {formStatus.message && (
                <div className={`form-message ${formStatus.type}`}>
                  {formStatus.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                  <span>{formStatus.message}</span>
                </div>
              )}
              
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Your Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    placeholder="What is your issue about?"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    rows="5"
                    placeholder="Describe your issue in detail..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="send-btn" disabled={loading}>
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <FiSend />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;