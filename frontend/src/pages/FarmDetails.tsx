import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Star,
  Mail,
  Camera,
  Info,
  Globe,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { ReviewModal } from "../components/ReviewForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  category: string;
}

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

interface Farm {
  id: number;
  name: string;
  province: string;
  description: string;
  categories: string[];
  dailyRate: number;
  phone: string;
  email: string;
  website?: string;
  address: string;
  fGPS: string;
  amenities: string[];
  pID: string;
  gameList: {
    species: string;
    malePrice?: number;
    femalePrice?: number;
  }[];
  images: string[];
  rating: number;
  reviewCount: number;
}

function ImageWithFallback({
  src,
  fallbackSrc = "https://via.placeholder.com/800x600?text=No+Image",
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  useEffect(() => {
    setImgSrc(src);
  }, [src]);
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      {...props}
    />
  );
}

interface FarmDetailsProps {
  user: User | null;
}

const FarmDetails: React.FC<FarmDetailsProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [farmData, setFarmData] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [farmReviews, setFarmReviews] = useState<Review[]>([]);

  // const API_URL = "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    const fetchFarm = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/farms/${id}/farmdetails`);
        if (!res.ok) throw new Error(`Failed to fetch farm: ${res.statusText}`);
        const data: Farm & { reviews?: Review[] } = await res.json();

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

        setFarmData(data);
        // setImages(normalized);
        setSelectedImageIndex(0);

        // ✅ add this line
        setFarmReviews(data.reviews || []);

        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading farm");
        setFarmData(null);
        // setImages([]);
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

  if (!farmData) {
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

  const handleWriteReview = () => {
    if (user) {
      setIsReviewModalOpen(true);
    } else {
      navigate("/login");
    }
  };

  const handleReviewSubmit = async (review: Review) => {
    if (!user) return;

    try {
      const res = await fetch(`${API_URL}/farms/${farmData?.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id, // or user.id if your User object has a numeric ID
          rating: review.rating,
          comment: review.comment,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      const data = await res.json();

      // Add new review to state
      setFarmReviews((prev) => [
        {
          id: data.review.rid, // assuming `rid` is PK in Reviews table
          author: `${user.first_name} ${user.last_name}`,
          rating: data.review.rstar,
          date: new Date().toISOString().split("T")[0],
          comment: data.review.rdecription,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Error submitting review:", err);
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
              Back
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
                  src={`${API_URL}/uploads/${farmData.images[selectedImageIndex]}`}
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
                      src={`${API_URL}/uploads/${img}`}
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
                <span>{farmData.province}</span>
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
                {farmData.amenities.map((fac: string, i: number) => (
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
            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Reviews</h3>
                <button
                  onClick={handleWriteReview}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Write Review
                </button>
              </div>
              {farmReviews.length > 0 ? (
                farmReviews.map((rev) => (
                  <div key={rev.id} className="border-b pb-4 mb-4">
                    <div className="flex justify-between">
                      <div>{rev.author}</div>
                      <div>{new Date(rev.date).toISOString().slice(0, 10)}</div>
                    </div>
                    <p>{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full md:w-80 space-y-4">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600">
                  R{farmData.dailyRate}
                </div>
                <div className="text-sm text-gray-500">per hunter per day</div>
              </div>
              <a
                href={`tel:${farmData.phone}`}
                className="block text-center border-2 border-green-600 text-green-600 py-2 rounded"
              >
                Contact Farm
              </a>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-semibold mb-3">Contact Info</h4>
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-green-600" />
                  {farmData.phone}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-green-600" />
                  {farmData.email}
                </div>
                {farmData.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-green-600" />
                    <a
                      href={`https://${farmData.website}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {farmData.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        farmName={farmData.name}
        user={user}
      />

      {showFullGallery && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full overflow-y-auto">
            <div className="p-4 flex justify-between items-center">
              <h4 className="font-semibold">{farmData.name} — Gallery</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFullGallery(false)}
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmData.images.map((img: string, idx: number) => (
                <div key={idx} className="rounded overflow-hidden">
                  <ImageWithFallback
                    src={`${API_URL}/uploads/${img}`}
                    alt={`gallery-${idx}`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmDetails;
