import React, { useEffect, useState } from "react";
import { Users, Shield, Trophy, Heart, Award } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const fallbackImage =
  "https://via.placeholder.com/320x320?text=No+Image+Available";

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = React.useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallbackImage)}
      loading="lazy"
      decoding="async"
    />
  );
}

export default function AboutUs() {
  const values = [
    {
      icon: Shield,
      title: "Ethical Hunting",
      description:
        "We promote responsible, sustainable hunting practices that support conservation efforts and local communities.",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "Building strong relationships between hunters, farm owners, and local communities across South Africa.",
    },
    {
      icon: Trophy,
      title: "Quality Experiences",
      description:
        "Every farm is carefully vetted to ensure exceptional hunting experiences and professional service.",
    },
    {
      icon: Heart,
      title: "Conservation Impact",
      description:
        "Supporting wildlife conservation through sustainable hunting tourism and habitat preservation.",
    },
  ];

  const teamMembers = [
    {
      name: "Phillip van Staden",
      position: "Founder & CEO",
      bio: "",
      image: "assets/logo.png?auto=format&fit=crop&w=320&q=80",
    },
    {
      name: "Phillip van Staden",
      position: "Head of Operations",
      bio: "",
      image: "assets/logo.png?auto=format&fit=crop&w=320&q=80",
    },
    {
      name: "Phillip van Staden",
      position: "Hunter Relations Manager",
      bio: "",
      image: "assets/logo.png?auto=format&fit=crop&w=320&q=80",
    },
    {
      name: "Phillip van Staden",
      position: "Community Liaison",
      bio: "",
      image: "assets/logo.png?auto=format&fit=crop&w=320&q=80",
    },
  ];

  const [stats, setStats] = useState([
    { number: "-", label: "Verified Hunting Farms" },
    { number: "-", label: "Registered hunters" },
    { number: "-", label: "Game Species" },
    { number: "-", label: "Articles" },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [farmRes, personRes, speciesRes, articleRes] = await Promise.all([
          fetch(`${API_URL}/stats/farmcount`).then((res) => res.json()),
          fetch(`${API_URL}/stats/personcount`).then((res) => res.json()),
          fetch(`${API_URL}/stats/speciescount`).then((res) => res.json()),
          fetch(`${API_URL}/stats/articlecount`).then((res) => res.json()),
        ]);

        setStats([
          { number: farmRes[0].count || "0", label: "Verified Hunting Farms" },
          { number: personRes[0].count || "0", label: "Registered hunters" },
          { number: speciesRes[0].count || "0", label: "Game Species" },
          { number: articleRes[0].count || "0", label: "Articles" },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }

    fetchStats();
  }, []);
  return (
    <div className="min-h-screen bg-beige">
      {/* Hero Section */}
      <div className="relative bg-black w-full  h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-brown bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-white mb-6  sm:text-6xl md:text-3xl sm:mb-4 lg:text-5xl font-semibold">
              About Hunter's Haven
            </h1>
            <p className="text-lg sm:text-lg md:text-lg lg:text-2xl  text-beige max-w-3xl mx-auto leading-relaxed sm:px-4 md:px-6">
              South Africa's premier platform connecting hunters with authentic,
              ethical hunting experiences while supporting conservation and
              local communities
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full bg-white py-12 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl  font-bold mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm sm:text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="w-full bg-primary text-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className=" mb-8 text-3xl font-semibold">Our Mission</h2>
              <div className="space-y-6 text-lg leading-relaxed">
                <p className="text-beige">
                  Hunter's Haven was founded with a simple yet powerful mission:
                  to connect passionate hunters with authentic South African
                  hunting experiences while promoting ethical hunting practices
                  and supporting wildlife conservation.
                </p>
                <p className="text-beige">
                  We believe that responsible hunting tourism plays a crucial
                  role in wildlife conservation, providing sustainable funding
                  for habitat preservation and supporting local communities
                  across rural South Africa.
                </p>
                <p className="text-beige">
                  Every farm on our platform is carefully vetted to ensure they
                  meet our high standards for ethics, safety, and quality. We're
                  committed to preserving South Africa's hunting heritage for
                  future generations.
                </p>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1623263320678-6f05127b790a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd2lsZGxpZmUlMjBzcHJpbmdib2t8ZW58MXx8fHwxNzU0ODEyNTAyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="African Wildlife"
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="w-full bg-beige py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-brown mb-6 text-3xl font-semibold">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and ensure we maintain the
              highest standards in hunting tourism and conservation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-15 h-15 text-green-500" />
                </div>
                <h3 className="text-brown mb-4 text-xl font-semibold">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-brown mb-6 text-3xl font-semibold">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our experienced team combines decades of hunting expertise with a
              passion for conservation and exceptional customer service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <div key={i} className="text-center">
                <div className="relative mb-6">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                  />
                </div>
                <h3 className="text-brown mb-2 text-xl font-semibold">
                  {member.name}
                </h3>
                <p className="text-primary font-semibold mb-4">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conservation Impact */}
      <div className="w-full bg-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1448071691032-6763665a7e2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW50aW5nJTIwbG9kZ2UlMjBzb3V0aCUyMGFmcmljYXxlbnwxfHx8fDE3NTQ4MTI0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Conservation Efforts"
                className="w-full h-80 object-cover rounded-2xl shadow-xl"
              />
            </div>
            <div className="text-black">
              <h2 className=" mb-8 text-3xl font-semibold">
                Conservation Impact
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h4 className=" font-semibold mb-2">
                      Habitat Preservation
                    </h4>
                    <p className="text-beige">
                      Our partner farms manage over 2 million hectares of
                      pristine South African wilderness, providing crucial
                      habitat for diverse wildlife species.
                    </p>
                  </div>
                </div>
                <div className="py-2" />
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h4 className=" font-semibold mb-2">Community Support</h4>
                    <p className="text-beige">
                      Hunting tourism provides direct employment and economic
                      benefits to over 1,000 local community members across
                      rural South Africa.
                    </p>
                  </div>
                </div>
                <div className="py-2" />
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-8 h-8 text-green-500 " />
                  </div>
                  <div>
                    <h4 className=" font-semibold mb-2">
                      Anti-Poaching Efforts
                    </h4>
                    <p className="text-beige">
                      Revenue from ethical hunting directly funds anti-poaching
                      operations and wildlife protection programs across our
                      partner reserves.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="w-full bg-white text-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className=" mb-6 text-3xl font-semibold">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl  mb-12 max-w-3xl mx-auto">
            Join thousands of hunters who have discovered authentic South
            African hunting experiences through our platform. Let us help you
            plan your perfect hunting safari.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/farms"
              className="text-green-500  px-12 py-4 rounded-lg hover:bg-opacity-90 transition-colors font-semibold text-lg"
            >
              Browse Hunting Farms
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
