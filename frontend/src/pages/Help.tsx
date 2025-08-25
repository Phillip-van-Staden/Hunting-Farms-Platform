// src/pages/Help.tsx
import React, { useState } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Help: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("general");

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      details: "+27 11 123 4567",
      availability: "Mon-Fri: 8:00 AM - 6:00 PM SAST",
      action: "Call Now",
    },
    {
      icon: Mail,
      title: "Email Support",
      details: "support@huntershaven.co.za",
      availability: "Response within 24 hours",
      action: "Send Email",
    },
  ];

  const faqCategories = [
    { id: "general", name: "General" },
    { id: "hunting", name: "Hunting" },
    { id: "travel", name: "Travel" },
    { id: "blogs", name: "Blogs" },
    { id: "farms", name: "Farms" },
  ];

  const faqs: Record<string, { question: string; answer: string }[]> = {
    general: [
      {
        question: "What is Hunter's Haven?",
        answer:
          "Hunter's Haven is South Africa's premier hunting farm booking platform. We connect hunters with carefully vetted hunting farms across all nine provinces, ensuring quality experiences and ethical hunting practices.",
      },
      {
        question: "How do I create an account?",
        answer:
          "Click 'Sign Up' in the top menu, choose whether you're a hunter or farm owner, fill in your details, and verify your email address. It's that simple!",
      },
      {
        question: "Is Hunter's Haven free to use?",
        answer:
          "Yes, browsing farms and creating an account is completely free for hunters. We only charge a small service fee when you make a booking through our platform.",
      },
      {
        question: "How do you vet hunting farms?",
        answer:
          "Every farm undergoes a rigorous vetting process including site visits, license verification, safety inspections, and quality assessments. We also monitor ongoing customer feedback.",
      },
    ],
    hunting: [
      {
        question: "What hunting licenses do I need?",
        answer:
          "You'll need a valid hunting license from your home country or an international hunting permit. Some species require additional permits. Your chosen farm will guide you through the requirements.",
      },
      {
        question: "Can I bring my own rifle?",
        answer:
          "Yes, but you'll need proper import permits. Many hunters prefer to rent rifles locally to avoid the paperwork. Most farms offer high-quality rifles for rent.",
      },
      {
        question: "What's the best hunting season?",
        answer:
          "South Africa offers year-round hunting, but the dry winter months (May-September) are generally preferred as animals congregate around water sources.",
      },
      {
        question: "Are there bag limits?",
        answer:
          "Yes, each farm has specific quotas for different species. These are clearly listed on each farm's page, along with trophy fees.",
      },
    ],
    travel: [
      {
        question: "Do you arrange flights?",
        answer:
          "We don't book flights directly, but we can recommend travel agents specializing in hunting trips. Many farms offer airport transfer services.",
      },
      {
        question: "What should I pack?",
        answer:
          "Each farm provides a detailed packing list after booking. Generally, you'll need hunting clothes, boots, personal items, and any medications. Heavy gear can often be rented.",
      },
      {
        question: "Do I need travel insurance?",
        answer:
          "While not mandatory, we strongly recommend comprehensive travel insurance that covers hunting activities. Check that your policy includes coverage for South Africa.",
      },
      {
        question: "What about trophy shipping?",
        answer:
          "Most farms work with professional taxidermists and shipping companies. Costs vary by size and destination. Your farm can provide detailed shipping information.",
      },
    ],
    blogs: [
      {
        question: "How do I write and share my hunting story?",
        answer:
          "Create an account, go to your profile, and click 'Share Your Story'. Write your hunting experience, add photos, and submit it for review. Our team will review and publish quality stories within 24-48 hours.",
      },
      {
        question: "What makes a good hunting blog post?",
        answer:
          "Great hunting stories include specific details about your experience, lessons learned, challenges faced, and advice for other hunters. Include the location, animals hunted, gear used, and what made the trip memorable.",
      },
      {
        question: "How long does blog approval take?",
        answer:
          "Most blog posts are reviewed and published within 24-48 hours. We review all submissions to ensure quality content that benefits our hunting community.",
      },
      {
        question: "Can I edit my blog post after submission?",
        answer:
          "Yes, you can edit your published blog posts from your profile. Edited posts will need to go through approval again to maintain content quality.",
      },
      {
        question: "What categories can I write about?",
        answer:
          "You can write about guest stories, hunting tips, equipment reviews, farm reviews, photography, and conservation topics. Choose the category that best fits your content.",
      },
      {
        question: "Do I get credit for my blog posts?",
        answer:
          "Absolutely! Your name and profile are displayed with every published blog post. You'll build recognition in the hunting community and can showcase your expertise.",
      },
    ],
    farms: [
      {
        question: "How do I list my hunting farm on the platform?",
        answer:
          "Register as a farm owner, complete the detailed farm listing form with photos and pricing, set your availability, and submit for admin approval. Our team will review and approve quality listings.",
      },
      {
        question: "What information do I need to provide about my farm?",
        answer:
          "You'll need to provide farm location, accommodation details, game species available, pricing (daily rates and trophy fees), available seasons, safety certifications, and high-quality photos of your property.",
      },
      {
        question: "How long does farm approval take?",
        answer:
          "Farm listings typically take 3-5 business days to review and approve. We conduct thorough checks of licenses, safety protocols, and facilities to ensure quality standards.",
      },
      {
        question: "What are the requirements for listing my farm?",
        answer:
          "Your farm must have valid hunting licenses, proper insurance, qualified professional hunters/guides, safe accommodation facilities, and adherence to all local hunting regulations.",
      },
      {
        question: "How do I manage bookings and availability?",
        answer:
          "Use your farm owner dashboard to update availability, respond to booking requests, manage pricing, and communicate with potential clients. You have full control over your bookings.",
      },
      {
        question: "What fees do you charge farm owners?",
        answer:
          "We charge a small commission only on successful bookings made through our platform. Listing your farm and managing your profile is completely free. No upfront costs or monthly fees.",
      },
      {
        question: "How do I handle payments from hunters?",
        answer:
          "You can arrange payment terms directly with hunters. Many farms require a deposit through our secure platform and collect the balance upon arrival. You set your own payment policies.",
      },
      {
        question: "Can I update my farm listing after it's approved?",
        answer:
          "Yes, you can update your farm details, photos, pricing, and availability anytime through your dashboard. Major changes may require re-approval to maintain quality standards.",
      },
    ],
  };

  const filteredFaqs = faqs[selectedCategory].filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-beige">
      <div className="flex flex-col mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="bg-black text-5xl text-center text-white mb-12 py-8">
          <h1 className="text-brown mb-4">How Can We Help You?</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Get support, find answers to common questions, or contact our expert
            team
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-brown mb-6">
                Contact Us
              </h2>
              <div className="space-y-6">
                {contactMethods.map((method, index) => {
                  const handleActionClick = () => {
                    if (method.title === "Phone Support") {
                      window.location.href = `tel:${method.details.replace(
                        /\s+/g,
                        ""
                      )}`;
                    } else if (method.title === "Email Support") {
                      window.location.href = `mailto:${method.details}`;
                    }
                  };

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          {React.createElement(method.icon, {
                            className: "w-5 h-5 text-green-500",
                          })}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-brown mb-1">
                            {method.title}
                          </h3>
                          <p className="text-gray-700 mb-1">{method.details}</p>
                          <p className="text-sm text-gray-500 mb-3">
                            {method.availability}
                          </p>
                          <button
                            type="button"
                            className="font-medium text-sm transition-colors"
                            style={{
                              color: "var(--earthy-green)",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--brown)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--earthy-green)")
                            }
                            onClick={handleActionClick}
                          >
                            {method.action}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Office Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-brown mb-4">
                Our Office
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <div className="px-1" />
                  <div>
                    <p className="text-gray-700">123 Safari Street</p>
                    <p className="text-gray-700">Sandton, Johannesburg</p>
                    <p className="text-gray-700">South Africa, 2196</p>
                  </div>
                </div>
                <div className="py-2" />
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="px-1" />
                  <div>
                    <p className="text-gray-700">Monday - Friday</p>
                    <p className="text-gray-700">8:00 AM - 6:00 PM SAST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-brown mb-6">
                Frequently Asked Questions
              </h2>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-8">
                {faqCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg"
                    >
                      <button
                        onClick={() =>
                          setOpenFaqIndex(openFaqIndex === index ? null : index)
                        }
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        type="button"
                      >
                        <span className="font-medium text-brown">
                          {faq.question}
                        </span>
                        {openFaqIndex === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      {openFaqIndex === index && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No FAQs found matching your search.
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-primary hover:text-brown font-medium mt-2"
                      type="button"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-12 bg-red-500 rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-white text-3xl font-semibold mb-4">
            Emergency Support
          </h3>
          <p className="text-beige mb-6">
            If you're currently on a hunting trip and need immediate assistance,
            call our 24/7 emergency hotline
          </p>
          <div className="text-2xl font-bold text-white mb-2">
            +27 82 911 HUNT
          </div>
          <p className="text-beige text-sm">
            Available 24/7 for hunting trip emergencies
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Help;
