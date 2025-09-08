import React, { useEffect, useState } from "react";
import {
  Users,
  Star,
  MapPin,
  LucideBookOpen,
  Search,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { GiDeer } from "react-icons/gi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Farm {
  id: string;
  name: string;
  location: string;
  description: string;
  categories: string[];
  pricing?: {
    dailyRate: number;
    gamePricing: Array<{
      species: string;
      malePrice?: number;
      femalePrice?: number;
    }>;
  };
  images?: string[];
  rating?: number;
  pid: string;
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

const Home: React.FC = () => {
  const [featuredFarms, setFeaturedFarms] = useState<Farm[]>([]);
  const [latestInsights, setLatestInsights] = useState<Blog[]>([]);
  const [loadingFarms, setLoadingFarms] = useState<boolean>(true);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);
  const navigate = useNavigate();

  // Fetch featured farms (top 3)
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoadingFarms(true);
        const res = await fetch(`${API_URL}/farms/`);
        const data: Farm[] = await res.json();
        const shuffledFarms = data.sort(() => Math.random() - 0.5);
        setFeaturedFarms(shuffledFarms.slice(0, 3)); // take only first 3
      } catch (err) {
        console.error("Error fetching farms:", err);
      } finally {
        setLoadingFarms(false);
      }
    };
    fetchFarms();
  }, []);

  // Fetch latest insights (blogs/articles)
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoadingInsights(true);
        const res = await fetch(`${API_URL}/blogs/approved`);
        const data: Blog[] = await res.json();
        setLatestInsights(data.slice(0, 3)); // take latest 3
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, []);

  const [stats, setStats] = useState([
    { number: "-", label: "Hunting Farms", icon: MapPin },
    { number: "-", label: "Happy Hunters", icon: Users },
    { number: "-", label: "Average Rating", icon: GiDeer },
    { number: "-", label: "Total articles", icon: LucideBookOpen },
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
          {
            number: farmRes[0].count || "0",
            label: "Verified Hunting Farms",
            icon: MapPin,
          },
          {
            number: personRes[0].count || "0",
            label: "Registered hunters",
            icon: Users,
          },
          {
            number: speciesRes[0].count || "0",
            label: "Game Species",
            icon: GiDeer,
          },
          {
            number: articleRes[0].count || "0",
            label: "Articles",
            icon: LucideBookOpen,
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }

    fetchStats();
  }, []);
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
      {/* Hero */}
      <div className="relative h-[600px]">
        <img
          src="https://images.unsplash.com/photo-1623263320678-6f05127b790a?w=1920&auto=format&fit=crop&q=80"
          alt="African Safari"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Discover Your Perfect Hunting Experience
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Connect with premier hunting farms across South Africa. Ethical,
            sustainable, unforgettable.
          </p>
          <button
            onClick={() => navigate("/farms")}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded text-white flex items-center"
          >
            <Search className="mr-2" /> Begin The Search
          </button>
        </div>
        {/* </div> */}
      </div>

      {/* Stats */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 ">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center ">
              <stat.icon className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-2xl font-bold">{stat.number}</span>
              <span className="text-gray-600">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Farms */}
      <div className="py-16 bg-beige">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Hunting Farms</h2>
            <button
              onClick={() => navigate("/farms")}
              className="text-green-600 hover:text-green-800 font-medium flex items-center"
            >
              View All Farms <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {loadingFarms
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-48 w-full bg-gray-300" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-3/4" />
                      <div className="h-4 bg-gray-300 rounded w-1/2" />
                      <div className="h-4 bg-gray-300 rounded w-1/3" />
                    </div>
                  </div>
                ))
              : featuredFarms.map((farm) => (
                  <div
                    key={farm.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <img
                      src={`${
                        farm.images ? farm.images[0] : "default-farm.jpg"
                      }`}
                      alt={farm.name}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold">{farm.name}</h3>
                      <p className="text-gray-600">{farm.location}</p>
                      <div className="flex items-center mt-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="ml-1">{farm.rating}</span>
                      </div>
                      <p className="mt-2 text-green-600 font-semibold">
                        R{farm.pricing?.dailyRate}
                      </p>
                      <p className="text-sm text-gray-500">
                        {farm.categories.join(", ")}
                      </p>
                      <button
                        onClick={() => navigate(`/farms/${farm.id}`)}
                        className="mt-4 text-green-600 hover:text-green-800 flex items-center"
                      >
                        View Details <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Latest Insights */}
      <div className="py-16 bg-beige">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Latest Insights</h2>
            <button
              onClick={() => navigate("/blog")}
              className="text-green-600 hover:text-green-800 font-medium flex items-center"
            >
              View All Articles <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {loadingInsights
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col animate-pulse"
                  >
                    <div className="h-48 w-full bg-gray-300" />
                    <div className="p-4 space-y-3 flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/3" />
                      <div className="h-6 bg-gray-300 rounded w-3/4" />
                      <div className="h-4 bg-gray-300 rounded w-full" />
                      <div className="h-4 bg-gray-300 rounded w-5/6" />
                    </div>
                  </div>
                ))
              : latestInsights.map((insight) => (
                  <div
                    key={insight.bid}
                    className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                  >
                    <img
                      src={`${
                        insight.bimage || "https://via.placeholder.com/400x200"
                      }`}
                      alt={insight.btitle}
                      className="h-48 w-full object-cover"
                    />
                    <div className="p-4 flex-1 flex flex-col">
                      <span className="text-sm text-gray-500">
                        {formatDate(insight.bdate)}
                      </span>
                      <h3 className="text-xl font-semibold mt-2">
                        {insight.btitle}
                      </h3>
                      <p className="text-gray-600 mt-2 flex-1">
                        {insight.bdescription}
                      </p>
                      <button
                        className="mt-4 text-green-600 hover:text-green-800 flex items-center"
                        onClick={() => navigate(`/blogs/${insight.bid}`)}
                      >
                        Read More <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Home;
