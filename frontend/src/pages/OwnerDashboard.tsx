import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Star } from "lucide-react";
import { type User, authenticatedFetch } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface GamePricing {
  species: string;
  malePrice: number;
  femalePrice: number;
}

interface Farm {
  id: number;
  name: string;
  location: string;
  status: string;
  bookings: number;
  rating: number;
  lastUpdated: string;
  description?: string;
  categories?: string[];
  game_list?: string[];
  images?: string[];
  amenities?: string[];
  contact_info?: {
    phone: string;
    email: string;
    website: string;
  };
  pricing?: {
    dailyRate: number;
    gamePricing: GamePricing[];
  };
  gpsCoordinates?: {
    latitude: string;
    longitude: string;
  };
}

const OwnerDashboardScreen: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [myFarms, setMyFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  const ownerId = user?.id || null;

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await authenticatedFetch(
          `${API_URL}/farms/${ownerId}/owner`
        );
        if (!res.ok) throw new Error("Failed to fetch farms");
        const data = await res.json();
        setMyFarms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, [ownerId]);

  if (loading) {
    return <p className="text-center mt-10">Loading farms...</p>;
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* Header */}
      <div className="bg-black shadow-sm w-full">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-center h-20">
            <h1 className="text-2xl font-bold text-white">My Hunting Farms</h1>
          </div>
        </div>
      </div>

      {/* Add Farm Button */}
      <div className="py-2 px-2 flex justify-end">
        <button
          onClick={() => navigate("/add-farm")}
          className="bg-green-500 text-white rounded-2xl px-1 hover:bg-opacity-90 transition-colors flex items-center font-bold"
        >
          <Plus className="w-6 h-6 mr-3" />
          Add New Farm
        </button>
      </div>

      <div className="w-full px-6 lg:px-12 py-6">
        {myFarms.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-20 text-center">
            <MapPin className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-brown mb-4 text-3xl">No Farms Listed Yet</h3>
            <p className="text-gray-600 text-xl">
              Start by adding your first hunting farm to begin attracting
              customers.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myFarms.map((farm) => (
              <div
                key={farm.id}
                className="bg-white rounded-3xl shadow-lg py-1 px-10 mb-10 hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => navigate(`/owner/farms/${farm.id}`)}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-2xl font-bold text-brown">
                      {farm.name}
                    </h4>
                    <div className="text-center">
                      <p className="text-gray-600 text-lg mb-1">Rating</p>
                      <div className="flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                        <p className="text-3xl font-bold text-brown ml-2">
                          {farm.rating}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 flex items-center text-l mb-1">
                    <MapPin className="w-6 h-6 mr-2" />
                    {farm.location}
                  </p>
                  {farm.gpsCoordinates && (
                    <p className="text-gray-500">
                      GPS: {farm.gpsCoordinates.latitude},{" "}
                      {farm.gpsCoordinates.longitude}
                    </p>
                  )}
                </div>

                <p className="text-gray-700 text-lg line-clamp-2">
                  {farm.description}
                </p>

                {farm.images && (
                  <div className="flex gap-4 overflow-x-auto pb-2 mt-2">
                    {farm.images.slice(0, 4).map((img) => (
                      <img
                        src={`${img}`}
                        alt="Farm"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboardScreen;
