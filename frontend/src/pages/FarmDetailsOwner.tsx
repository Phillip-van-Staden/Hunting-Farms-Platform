// FarmDetailsOwner.tsx
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Star,
  Mail,
  Camera,
  Edit,
  Info,
  Trash2,
  Globe,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface FarmFromApi {
  id: number;
  name: string;
  province?: string;
  description?: string;
  images?: any[];
  dailyRate?: number;
  categories?: string[];
  amenities?: string[];
  gameList?: { species: string; malePrice?: number; femalePrice?: number }[];
  phone?: string;
  email?: string;
  website?: string;
  fGPS?: string;
  address?: string;
  rating?: number; // average rating
  reviewCount?: number; // number of reviews
}

// Fallback image handler component
function ImageWithFallback({
  src,
  fallbackSrc = "https://via.placeholder.com/800x600?text=No+Image",
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(
    src as string | undefined
  );
  useEffect(() => setImgSrc(src as string | undefined), [src]);
  return (
    <img
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
}

export default function FarmDetailsOwner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [farm, setFarm] = useState<FarmFromApi | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [farmReviews, setFarmReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    const fetchFarm = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/farms/${id}/farmdetails`);
        if (!res.ok) throw new Error(`Failed to fetch farm: ${res.statusText}`);
        const data: FarmFromApi & { reviews?: Review[] } = await res.json();

        // normalize images
        const imgsRaw: any[] = Array.isArray(data.images) ? data.images : [];
        const normalized: string[] = imgsRaw
          .map((img) => {
            if (!img) return null;
            if (typeof img === "string") {
              if (img.startsWith("http") || img.startsWith("data:")) return img;
              return `${API_URL}/uploads/${img}`;
            }
            return null;
          })
          .filter(Boolean) as string[];

        setFarm(data);
        setImages(normalized);
        setSelectedImageIndex(0);

        setFarmReviews(data.reviews || []);

        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading farm");
        setFarm(null);
        setImages([]);
        setFarmReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFarm();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading farm details…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="container mx-auto p-6 text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 underline text-blue-600 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="container mx-auto p-6 text-center">
          <p className="text-lg text-gray-700">Farm not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-green-700 hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const farmData = {
    id: farm.id,
    name: farm.name,
    description: farm.description || "",
    location: farm.province || "",
    gps: farm.fGPS || "",
    rating: farm.rating || 0,
    reviewCount: farm.reviewCount || 0,
    images: images,
    categories: farm.categories || [],
    facilities: farm.amenities || [],
    gameList: (farm.gameList || []).map((g) => ({
      species: g.species || g.species,
      malePrice: g.malePrice,
      femalePrice: g.femalePrice,
    })),
    contact: {
      phone: farm.phone || "",
      email: farm.email || "",
    },
    priceList: {
      dailyRate: farm.dailyRate || 0,
    },
    address: farm.address || "",
  };

  const handleEditFarm = () => {
    navigate(`/owner/edit-farm/${id}`, { state: { rawFarm: farm } });
  };

  const handleDeleteFarm = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteFarm = async () => {
    try {
      const response = await fetch(`${API_URL}/farms/${farm.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to delete farm:", errorText);
        return;
      }

      setIsDeleteConfirmOpen(false);
      navigate(-1); // go back after delete
    } catch (error) {
      console.error("Error deleting farm:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-beige">
      <div className="bg-black shadow-sm w-full">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 max-w-none">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white hover:bg-green-500 transition-colors text-lg"
            >
              <ArrowLeft className="w-6 h-6 mr-3" />
            </button>
            <h1 className="text-2xl font-bold text-white">{farmData.name}</h1>
            <div className="w-32" />
          </div>
        </div>
      </div>
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="md:flex-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="relative">
                <ImageWithFallback
                  src={farmData.images[selectedImageIndex]}
                  alt={`${farmData.name} image ${selectedImageIndex + 1}`}
                  className="w-full h-96 object-cover rounded"
                />
                <button
                  onClick={() => setShowFullGallery(true)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded flex items-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  View Gallery
                </button>
              </div>

              <div className="flex gap-2 mt-3 overflow-x-auto">
                {farmData.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 h-20 w-28 rounded overflow-hidden border ${
                      idx === selectedImageIndex
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${farmData.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-2">{farmData.name}</h1>
              <div className="flex items-center gap-3 text-gray-600 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>{farmData.location}</span>
                <div className="flex items-center ml-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= Math.round(farmData.rating)
                          ? "text-yellow fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2">
                    {farmData.rating} ({farmData.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700">{farmData.description}</p>
              </div>

              {farmData.categories && farmData.categories.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {farmData.categories.map((c: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold">Facilities & Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {farmData.facilities.map((fac: string, i: number) => (
                  <div key={i} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                    {fac}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Available Game Species & Pricing
                </h3>
                <div className="text-sm text-gray-500">
                  Prices are indicative
                </div>
              </div>

              <div className="space-y-4">
                {farmData.gameList.map((g, idx) => (
                  <div key={idx} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{g.species}</h4>
                        <div className="text-sm text-gray-500">Plains game</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <div className="text-sm text-gray-700">Female</div>
                          <div className="font-semibold">
                            R{g.femalePrice ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="flex justify-between">
                          <div className="text-sm text-gray-700">Male</div>
                          <div className="font-semibold text-orange-600">
                            R{g.malePrice ?? "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-2">
                      Pricing Information
                    </h5>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>
                        • Trophy prices may apply to animals that have trophy
                        characteristics
                      </li>
                      <li>
                        • Final prices are set by the owner during booking
                      </li>
                      <li>
                        • Final gender determination is made by the professional
                        hunter
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500">Owner view</div>
                </div>
              </div>

              <div className="space-y-4">
                {farmReviews.length > 0 ? (
                  farmReviews.map((rev) => (
                    <div key={rev.id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{rev.author}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(rev.date).toISOString().slice(0, 10)}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${
                                s <= rev.rating
                                  ? "text-yellow fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No reviews yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="w-full md:w-80 space-y-4">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-semibold text-brown mb-3">Farm Management</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEditFarm}
                  className="w-full bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit Farm
                </button>
                <button
                  onClick={handleDeleteFarm}
                  className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Farm
                </button>
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  R{farmData.priceList.dailyRate}
                </div>
                <div className="text-sm text-gray-500">per hunter per day</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-4 h-4 text-green-600" />{" "}
                  <a
                    href={`tel:${farmData.contact.phone}`}
                    className="hover:text-green-600"
                  >
                    {farmData.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-4 h-4 text-green-600" />{" "}
                  <a
                    href={`mailto:${farmData.contact.email}`}
                    className="hover:text-green-600"
                  >
                    {farmData.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Globe className="w-4 h-4 text-green-600" />{" "}
                  <a
                    href={farm.website ? `${farm.website}` : "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-green-600"
                  >
                    {farm.website || "Website"}
                  </a>
                </div>
              </div>
            </div>

            <section className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-2xl font-semibold mb-2">Location</h2>
              <p className="mb-2">{farmData.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  farmData.gps
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </section>
          </aside>
        </div>
      </main>

      <Footer />

      {showFullGallery && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-full sm:max-w-5xl h-full sm:h-auto overflow-y-auto">
            {/* Header */}
            <div className="p-3 sm:p-4 flex justify-between items-center border-b">
              <h4 className="font-semibold text-sm sm:text-base truncate">
                {farmData.name} — Gallery
              </h4>
              <button
                onClick={() => setShowFullGallery(false)}
                className="px-2 py-1 sm:px-3 sm:py-1 rounded bg-gray-200 text-sm sm:text-base"
              >
                Close
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {farmData.images.map((img: string, idx: number) => (
                <div key={idx} className="rounded overflow-hidden">
                  <ImageWithFallback
                    src={img}
                    alt={`gallery-${idx}`}
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Confirm Delete</h4>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="text-gray-500"
              >
                Close
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this farm? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-3 py-1 rounded bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFarm}
                className="px-3 py-1 rounded bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
