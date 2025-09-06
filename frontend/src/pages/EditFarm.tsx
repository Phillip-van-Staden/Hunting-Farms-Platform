import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FarmForm from "../components/FarmForm";
import type { FarmFormValues, GamePricing } from "../components/FarmForm";
import { type User, authenticatedFetch } from "../utils/auth";

const API_URL = "http://localhost:5000";
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
  fGPS?: string; // "lat,lon"
  address?: string;
}
interface AddFarmScreenProps {
  user: User;
}
export default function EditFarmScreen({ user }: AddFarmScreenProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { rawFarm?: FarmFromApi } };
  const raw = location.state?.rawFarm;

  const [initialValues, setInitialValues] = useState<FarmFormValues | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [storing, setStoring] = useState(false);
  const normalizeImages = (images?: any[]) => {
    const arr = Array.isArray(images) ? images : [];
    return arr
      .map((img) => {
        if (!img) return null;
        if (typeof img === "string") {
          if (img.startsWith("http")) return img;
          // return `${API_URL}/uploads/${img}`;
        }
        return null;
      })
      .filter(Boolean) as string[];
  };

  const toFormValues = (farm: FarmFromApi): FarmFormValues => {
    const [lat = "", lng = ""] =
      farm.fGPS && typeof farm.fGPS === "string"
        ? farm.fGPS.split(",").map((s) => s.trim())
        : [];
    const gl = farm.gameList || [];
    return {
      name: farm.name || "",
      province: farm.province || "",
      city: farm.address || "",
      gpsCoordinates: { latitude: lat, longitude: lng },
      description: farm.description || "",
      categories: farm.categories || [],
      game_list: gl.map((g) => g.species),
      amenities: farm.amenities || [],
      contact_info: {
        phone: farm.phone || "",
        email: farm.email || "",
        website: farm.website || "",
      },
      images: normalizeImages(farm.images),
      pricing: {
        dailyRate: farm.dailyRate || 0,
        gamePricing: gl.map((g) => ({
          species: g.species,
          malePrice: g.malePrice ?? 0,
          femalePrice: g.femalePrice ?? 0,
        })),
      },
    };
  };

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        if (raw) {
          setInitialValues(toFormValues(raw));
        } else if (id) {
          const res = await authenticatedFetch(
            `${API_URL}/farms/${id}/farmdetails`
          );
          if (!res.ok) throw new Error("Failed to fetch farm details");
          const data: FarmFromApi = await res.json();
          setInitialValues(toFormValues(data));
        } else {
          throw new Error("Missing farm id");
        }
      } catch (e) {
        console.error(e);
        alert("Error loading farm");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [id]);

  const handleCancel = () => navigate(-1);

  const formatToPostgresArray = (arr: any[]) => `{${arr.join(",")}}`;

  const handleSubmit = async (values: FarmFormValues, imageFiles: File[]) => {
    try {
      setStoring(true);
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("province", values.province);
      formData.append("city", values.city);
      formData.append("description", values.description);
      formData.append("dailyRate", String(values.pricing.dailyRate ?? 0));
      formData.append("phone", values.contact_info.phone);
      formData.append("email", values.contact_info.email);
      formData.append("website", values.contact_info.website);
      formData.append("userId", user.id.toString());

      // arrays to text[] columns
      formData.append("categories", formatToPostgresArray(values.categories));
      formData.append("amenities", formatToPostgresArray(values.amenities));

      // JSON strings
      const pricingMap = new Map<string, GamePricing>();
      values.pricing.gamePricing.forEach((p) => pricingMap.set(p.species, p));
      const gameList = values.game_list.map((species) => ({
        species,
        malePrice: pricingMap.get(species)?.malePrice ?? 0,
        femalePrice: pricingMap.get(species)?.femalePrice ?? 0,
      }));
      formData.append("gameList", JSON.stringify(gameList));
      formData.append("gpsCoordinates", JSON.stringify(values.gpsCoordinates));

      // new images
      imageFiles.forEach((file) => formData.append("images", file));
      formData.append(
        "keepImages",
        JSON.stringify(
          values.images.map((img) =>
            img.startsWith(`${API_URL}/uploads/`)
              ? img.replace(`${API_URL}/uploads/`, "")
              : img
          )
        )
      );
      const res = await authenticatedFetch(
        `${API_URL}/farms/${id}/farmdetails`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to update farm");
      }
      setStoring(false);
      alert("Farm updated successfully!");
      navigate(-1);
    } catch (e: any) {
      console.error(e);
      alert(`Error updating farm: ${e.message || e}`);
    }
  };

  if (loading || !initialValues) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige">
      {storing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <svg
            className="animate-spin h-10 w-10 text-white mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <p className="text-white font-medium">Storing farm details...</p>
        </div>
      )}
      <div className="bg-black shadow-sm w-full">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={handleCancel}
              className="flex items-center text-white hover:bg-green-500 transition-colors text-lg"
            >
              <ArrowLeft className="w-6 h-6 mr-3" />
            </button>
            <h1 className="text-2xl font-bold text-white">Edit Farm</h1>
            <div className="w-32" />
          </div>
        </div>
      </div>

      <FarmForm
        initialValues={initialValues}
        submitLabel="Update Farm"
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
