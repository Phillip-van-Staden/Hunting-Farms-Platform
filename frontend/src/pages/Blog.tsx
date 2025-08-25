import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  Search,
  Tag,
  ChevronRight,
  Plus,
} from "lucide-react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  category: string;
}

interface Blog {
  bid: number;
  btitle: string;
  bcategory: string;
  bdescription: string;
  bstory: string;
  pId: number;
  bimage: string | null;
  btags: string[];
  bstatus: string;
  bdate: string;
  author?: string; // You may want to map this from backend users later
}

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={`${API_URL}${src}`} alt={alt} className={className} />;
}

interface BlogScreenProps {
  onScreenChange: (screen: string) => void;
  user: User | null;
}

export function BlogScreen({ user }: BlogScreenProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredPost, setFeaturedPost] = useState<Blog | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/approved`);
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data);

        // pick random featured blog
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setFeaturedPost(data[randomIndex]);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  const categories = [
    { id: "all", name: "All Posts" },
    { id: "hunting-tips", name: "Hunting Tips" },
    { id: "conservation", name: "Conservation" },
    { id: "gear-reviews", name: "Gear Reviews" },
    { id: "guest-stories", name: "Guest Stories" },
  ];

  const filteredPosts = blogs.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.bcategory === selectedCategory;
    const matchesSearch =
      post.btitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.bdescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.btags &&
        post.btags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-beige">
      <div className="w-full px-6 lg:px-12 py-16">
        {/* Page Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-20">
          <div className="text-center mb-20">
            <h1 className="text-brown mb-8 text-6xl">
              Hunting & Conservation Blog
            </h1>
            <p className="text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed">
              Expert insights, hunting tips, conservation stories, and
              destination guides from South Africa's premier hunting community
            </p>
          </div>

          {/* Search and Categories */}

          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none text-lg placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${
                  selectedCategory === category.id
                    ? "bg-green-500 text-white shadow-sm scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm hover:scale-105"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-20">
            <div className="lg:flex">
              {featuredPost.bimage && (
                <div className="lg:w-1/2">
                  <ImageWithFallback
                    src={featuredPost.bimage}
                    alt={featuredPost.btitle}
                    className="w-full h-80 lg:h-full object-cover"
                  />
                </div>
              )}
              <div className="lg:w-1/2 p-12">
                <div className="flex items-center text-lg text-gray-500 mb-8">
                  <span className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold mr-6 text-xl">
                    FEATURED
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold text-xl">
                    {getCategoryName(featuredPost.bcategory)}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-brown mb-8 leading-tight">
                  {featuredPost.btitle}
                </h2>
                <p className="text-gray-600 mb-10 leading-relaxed text-xl">
                  {featuredPost.bdescription}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-lg text-gray-500 space-x-8">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-3" />
                      <span>{featuredPost.author || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3" />
                      <span>{formatDate(featuredPost.bdate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/blogs/${featuredPost.bid}`)}
                    className="flex items-center text-primary hover:text-green-500 font-bold transition-all bg-primary bg-opacity-10 px-8 py-4 rounded-xl text-xl"
                  >
                    Read More
                    <ChevronRight className="w-6 h-6 ml-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Write a Story CTA */}
        <div className="bg-[var(--earthy-green)] rounded-3xl shadow-2xl p-12 mb-20 text-white">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">
              Share Your Hunting Story
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Have an amazing hunting experience to share? Write about your
              adventures, tips, and insights to inspire the community.
            </p>
            <button
              onClick={() => {
                if (!user) {
                  navigate("/login");
                } else {
                  navigate("/blogs/add");
                }
              }}
              className="bg-white text-black px-8 py-4 rounded-xl hover:bg-gray-300 transition-colors font-bold text-xl flex items-center mx-auto shadow-lg"
            >
              <Plus className="w-6 h-6 mr-3" />
              Write Your Story
            </button>
            <p className="text-sm mt-4 opacity-75">
              {!user
                ? "Please log in to share your story"
                : "All community posts are reviewed before publishing"}
            </p>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article
                key={post.bid}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.03] duration-300"
              >
                {post.bimage && (
                  <div className="relative">
                    <ImageWithFallback
                      src={post.bimage}
                      alt={post.btitle}
                      className="w-full h-72 object-cover"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-xl font-semibold shadow-lg text-lg">
                        {getCategoryName(post.bcategory)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-brown mb-6 leading-tight line-clamp-2">
                    {post.btitle}
                  </h3>
                  <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed text-lg">
                    {post.bdescription}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {post.btags &&
                      post.btags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full font-medium"
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          {tag}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center justify-between text-base text-gray-500 mb-8">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      <span>{post.author || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{formatDate(post.bdate)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/blogs/${post.bid}`)}
                    className="w-full flex items-center justify-center text-primary hover:text-green-500 font-bold transition-all py-4 border-3 border-primary rounded-xl hover:bg-primary text-lg"
                  >
                    Read Article
                    <ChevronRight className="w-6 h-6 ml-3" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="text-gray-400 mb-8">
                <Search className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-3xl font-bold text-gray-500 mb-6">
                No articles found
              </h3>
              <p className="text-gray-400 mb-12 text-xl">
                Try adjusting your search criteria or browse different
                categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="bg-green-500 text-white px-12 py-6 rounded-2xl hover:bg-opacity-90 transition-colors font-bold text-xl"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
