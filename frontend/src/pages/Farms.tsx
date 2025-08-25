import React, { useState, useEffect } from "react";
import { Search, MapPin, Star, TreePine, Grid3X3, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ImageWithFallback({
  src,
  fallbackSrc = "https://via.placeholder.com/400x300?text=No+Image",
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
}

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

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceRange, setPriceRange] = useState(5000);
  const [gameTypeFilter, setGameTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/farms`);
        if (!res.ok) throw new Error("Failed to fetch farms");
        const data = await res.json();
        setFarms(data);
        setFilteredFarms(data);
      } catch (err) {
        console.error("Error loading farms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [farms, searchTerm, locationFilter, priceRange, gameTypeFilter, sortBy]);

  const applyFilters = () => {
    let filtered = [...farms];

    if (searchTerm.trim()) {
      filtered = filtered.filter((farm) =>
        [farm.name, farm.location, farm.description]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((farm) =>
        farm.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (farm) => (farm.pricing?.dailyRate || 0) <= priceRange
    );

    if (gameTypeFilter) {
      filtered = filtered.filter((farm) =>
        farm.categories
          .join(" ")
          .toLowerCase()
          .includes(gameTypeFilter.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.pricing?.dailyRate || 0) - (b.pricing?.dailyRate || 0);
        case "price-high":
          return (b.pricing?.dailyRate || 0) - (a.pricing?.dailyRate || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "All":
        default:
          return 0;
      }
    });

    setFilteredFarms(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setPriceRange(5000);
    setGameTypeFilter("");
    setSortBy("all");
  };

  const FarmCard = ({
    farm,
    isListView = false,
  }: {
    farm: Farm;
    isListView?: boolean;
  }) => (
    <div
      key={farm.id}
      className={`overflow-hidden bg-white rounded-lg border shadow-sm cursor-pointer transition hover:bg-gray-200 ${
        isListView ? "flex gap-6" : ""
      }`}
      onClick={() => navigate(`/farms/${farm.id}`)}
    >
      <div className={`${isListView ? "w-1/3" : "h-48"} bg-gray-200 relative`}>
        {farm.images && farm.images[0] ? (
          <img
            src={`${API_URL}/uploads/${farm.images[0]}`}
            alt={farm.name}
            className="w-full h-full object-cover rounded-l-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-400 rounded-l-lg" />
        )}

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center space-x-1 text-xs font-semibold text-yellow-500 shadow">
          <Star className="h-3 w-3 fill-current text-yellow-400" />
          <span>{farm.rating?.toFixed(1)}</span>
        </div>
      </div>
      <div className={`p-4 ${isListView ? "flex-1" : ""}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-gray-800">{farm.name}</h3>
          {farm.pricing?.dailyRate && (
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              From R{farm.pricing.dailyRate}/day
            </span>
          )}
        </div>
        <div className="flex items-center text-gray-600 mb-2 text-sm">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{farm.location}</span>
        </div>
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">
          {farm.description}
        </p>
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {farm.pricing?.gamePricing?.length || 0} species available
          </span>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-beige flex flex-col">
      {/* Page Header */}
      <div className="mb-6 bg-black text-center p-4">
        <h1 className="text-3xl font-bold text-white">Browse Hunting Farms</h1>
        <p className="text-white">
          Discover premium hunting destinations across South Africa
        </p>
      </div>
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-72 p-4 bg-white rounded-lg shadow space-y-6">
            <div>
              <label
                htmlFor="search"
                className="block font-semibold text-gray-700 mb-1"
              >
                Search Farms
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Farm name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block font-semibold text-gray-700 mb-1"
              >
                Province
              </label>
              <select
                id="location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">All Provinces</option>
                <option value="Limpopo">Limpopo</option>
                <option value="North West">North West</option>
                <option value="Northern Cape">Northern Cape</option>
                <option value="Eastern Cape">Eastern Cape</option>
                <option value="Free State">Free State</option>
                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priceRange"
                className="block font-semibold text-gray-700 mb-1"
              >
                Max Daily Rate: R{priceRange}
              </label>
              <input
                id="priceRange"
                type="range"
                min={100}
                max={5000}
                step={100}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block font-semibold text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                value={gameTypeFilter}
                onChange={(e) => setGameTypeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">All Categories</option>
                <option value="Big Game">Big Game</option>
                <option value="Plains Game">Plains Game</option>
                <option value="Mountain Hunting">Mountain Hunting</option>
                <option value="Bird Hunting">Bird Hunting</option>
                <option value="Bow Hunting">Bow Hunting</option>
              </select>
            </div>
            <div className="py-1" />
            <button
              onClick={clearFilters}
              className="w-full py-2 rounded-md border border-green-600 text-green-700 font-semibold hover:bg-green-50 transition"
            >
              Clear Filters
            </button>
          </aside>

          {/* Main Content */}
          <section className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {filteredFarms.length} farms found
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md border ${
                      viewMode === "grid"
                        ? "bg-green-600 text-white"
                        : "border-gray-400 text-gray-700 hover:bg-green-100"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md border ${
                      viewMode === "list"
                        ? "bg-green-600 text-white"
                        : "border-gray-400 text-gray-700 hover:bg-green-100"
                    }`}
                    aria-label="List view"
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <label htmlFor="sortBy" className="text-gray-700 font-semibold">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="all">All</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Farm List/Grid */}
            {/* Farm List/Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse border rounded-lg shadow-sm"
                  >
                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFarms.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-6"
                }
              >
                {filteredFarms.map((farm) => (
                  <FarmCard
                    key={farm.id}
                    farm={farm}
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TreePine className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No farms found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms to find more
                  results.
                </p>
                <button
                  onClick={clearFilters}
                  className="py-2 px-4 rounded-md border border-green-600 text-green-700 font-semibold hover:bg-green-50 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
