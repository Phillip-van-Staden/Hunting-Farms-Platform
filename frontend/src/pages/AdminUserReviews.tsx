import { useEffect, useState } from "react";
import { ArrowLeft, Star, Trash2 } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type AnyObj = Record<string, any>;

interface Review {
  rid: number;
  rstar: number;
  rdate: string;
  rdescription: string;
  fname: string;
  pemail?: string;
  user?: string;
}

export function AdminUserReviews() {
  const navigate = useNavigate();
  const params = useParams<Record<string, string | undefined>>();
  const location = useLocation();
  const passedUser = (location.state as AnyObj | undefined)?.user;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const idOf = (obj: AnyObj | undefined, ...candidates: string[]) => {
    if (!obj) return undefined;
    for (const c of candidates) if (obj && obj[c] !== undefined) return obj[c];
    return undefined;
  };

  // determine user id from params OR from passed navigation state
  const getUserId = () => {
    // check common param names
    const paramId =
      params.userId ?? params.id ?? params.uid ?? params.pid ?? params.pId;
    if (paramId) return paramId;
    // check passed user object
    const fromState = idOf(
      passedUser,
      "pid",
      "id",
      "pId",
      "_id",
      "userId",
      "uid"
    );
    if (fromState) return String(fromState);
    return undefined;
  };

  const userId = getUserId();

  // derive a display user object
  const displayUser = {
    id: userId ?? passedUser?.pid ?? passedUser?.id ?? "",
    name:
      idOf(passedUser, "user", "name", "pnaam") ??
      // fallback to first review's user field
      (reviews.length > 0 ? reviews[0].user : "Unknown User"),
    email:
      idOf(passedUser, "email", "pemail") ??
      (reviews.length > 0 ? reviews[0].pemail : ""),
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) {
        setError("No user specified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/admin/users/${userId}/reviews`);
        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(
            `Failed to fetch reviews: ${res.status} ${res.statusText} ${
              text ?? ""
            }`
          );
        }
        const data: Review[] = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching user reviews:", err);
        setError(err.message || "Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  const handleDeleteReview = async (reviewId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this review? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/users/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(`Failed to delete review: ${res.status} ${txt ?? ""}`);
      }

      setReviews((prev) => prev.filter((r) => r.rid !== reviewId));
    } catch (err: any) {
      console.error("Error deleting review:", err);
      alert(err.message || "Error deleting review");
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="bg-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center text-white hover:text-green-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-brown mb-2">
                {displayUser.name}
              </h2>
              {displayUser.email && (
                <p className="text-gray-600 text-lg mb-2">
                  {displayUser.email}
                </p>
              )}
              <p className="text-gray-500 text-sm">User ID: {displayUser.id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-primary">
                {reviews.length}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-brown">
            Reviews by {displayUser.name}
          </h3>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">Loading reviews...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-800 p-6 rounded-lg">
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">
                This user hasn't written any reviews yet.
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.rid}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-xl font-bold text-brown mr-4">
                        {review.fname}
                      </h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rstar
                                ? "text-yellow fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-gray-600">
                          ({review.rstar}/5)
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {formatDate(review.rdate)}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteReview(review.rid)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Review"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {review.rdescription}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUserReviews;
