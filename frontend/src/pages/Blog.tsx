import { useState, useEffect } from "react";
import { Calendar, User, Search, Tag, ChevronRight, Plus } from "lucide-react";
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
  author?: string;
}

// function ImageWithFallback({
//   src,
//   alt,
//   className,
// }: {
//   src: string;
//   alt: string;
//   className?: string;
// }) {
//   return <img src={`${API_URL}${src}`} alt={alt} className={className} />;
// }

interface BlogScreenProps {
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
      <div className="w-full ">
        {/* Page Header */}
        <div className="bg-black  shadow-2xl p-4 mb-5">
          <div className="text-center mb-2">
            <h1 className="text-white mb-8 text-4xl">
              Hunting & Conservation Blog
            </h1>
            <p className="text-md lg:text-xl text-gray-100 max-w-5xl mx-auto leading-relaxed">
              Expert insights, hunting tips, conservation stories, and
              destination guides from South Africa's premier hunting community
            </p>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 sm:mb-16 lg:mb-10">
            <div className="lg:flex">
              {featuredPost.bimage && (
                <div className="lg:w-1/2">
                  <img
                    src={featuredPost.bimage}
                    alt={featuredPost.btitle}
                    className="w-full h-48 sm:h-64 md:h-72 lg:h-102 object-cover"
                  />
                </div>
              )}
              <div className="lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-6">
                {/* Category + Featured tags */}
                <div className="flex flex-wrap items-center text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 lg:mb-2 space-x-3 sm:space-x-4">
                  <span className="bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold sm:font-bold text-sm sm:text-lg">
                    FEATURED
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium sm:font-semibold text-sm sm:text-lg">
                    {getCategoryName(featuredPost.bcategory)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brown mb-4 sm:mb-6 lg:mb-8 leading-snug sm:leading-tight">
                  {featuredPost.btitle}
                </h2>

                {/* Description */}
                <p className="text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed text-sm sm:text-base md:text-lg">
                  {featuredPost.bdescription}
                </p>

                {/* Author + Date + Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center text-sm sm:text-base text-gray-500 space-x-4 sm:space-x-6">
                    <div className="flex items-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span>{featuredPost.author || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span>{formatDate(featuredPost.bdate)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/blogs/${featuredPost.bid}`)}
                    className="flex items-center justify-center text-primary hover:text-green-500 font-semibold sm:font-bold transition-all bg-primary bg-opacity-10 px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg"
                  >
                    Read More
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 sm:ml-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Write a Story CTA */}
        <div className="bg-[var(--earthy-green)] rounded-2xl shadow-xl p-6 sm:p-8 md:p-5 lg:p-6 mb-12 sm:mb-16 lg:mb-10 text-white">
          <div className="text-center">
            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 lg:mb-6">
              Share Your Hunting Story
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-7 lg:mb-8 opacity-90 max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
              Have an amazing hunting experience to share? Write about your
              adventures, tips, and insights to inspire the community.
            </p>

            {/* Button */}
            <button
              onClick={() => {
                if (!user) {
                  navigate("/login");
                } else {
                  navigate("/blogs/add");
                }
              }}
              className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-colors font-semibold sm:font-bold text-sm sm:text-base md:text-lg flex items-center mx-auto shadow-lg"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" />
              Write Your Story
            </button>

            {/* Subtext */}
            <p className="text-xs sm:text-sm mt-3 sm:mt-4 opacity-75">
              {!user
                ? "Please log in to share your story"
                : "All community posts are reviewed before publishing"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 my-5 ">
          {/* Search and Categories */}

          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 outline-none  placeholder-gray-500"
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
        {/* Blog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 ">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article
                key={post.bid}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:scale-[1.02] duration-300"
              >
                {post.bimage && (
                  <div className="relative">
                    <img
                      src={post.bimage}
                      alt={post.btitle}
                      className="w-full h-40 sm:h-52 md:h-56 lg:h-60 object-cover"
                    />
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <span className="bg-white bg-opacity-95 backdrop-blur-sm text-gray-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl font-medium sm:font-semibold shadow-md text-xs sm:text-sm md:text-base">
                        {getCategoryName(post.bcategory)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 sm:p-6 md:p-6 lg:p-6">
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-brown mb-3 sm:mb-4 leading-snug sm:leading-tight line-clamp-2">
                    {post.btitle}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 sm:mb-5 line-clamp-3 leading-relaxed text-sm sm:text-base">
                    {post.bdescription}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
                    {post.btags &&
                      post.btags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-xs sm:text-sm text-gray-500 bg-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full font-medium"
                        >
                          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                          {tag}
                        </span>
                      ))}
                  </div>

                  {/* Author + Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5 space-y-2 sm:space-y-0">
                    <div className="flex items-center">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      <span>{post.author || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      <span>{formatDate(post.bdate)}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => navigate(`/blogs/${post.bid}`)}
                    className="w-full flex items-center justify-center text-primary hover:text-green-500 font-semibold transition-all py-2.5 sm:py-3 border-2 border-primary rounded-lg sm:rounded-xl hover:bg-primary text-sm sm:text-base"
                  >
                    Read Article
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />
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
