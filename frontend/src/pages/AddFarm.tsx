import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FarmForm from "../components/FarmForm";
import type { FarmFormValues, GamePricing } from "../components/FarmForm";
import { useState } from "react";
import { authenticatedFetch, type User } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatToPostgresArray = (arr: any[]) => `{${arr.join(",")}}`;
interface AddFarmScreenProps {
  user: User;
}

export default function AddFarmScreen({ user }: AddFarmScreenProps) {
  const navigate = useNavigate();
  const [storing, setStoring] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleCancel = () => navigate(-1);

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
      formData.append("userId", String(user.id)); // Use real user ID

      formData.append("categories", formatToPostgresArray(values.categories));
      formData.append("amenities", formatToPostgresArray(values.amenities));

      const pricingMap = new Map<string, GamePricing>();
      values.pricing.gamePricing.forEach((p) => pricingMap.set(p.species, p));
      const gameList = values.game_list.map((species) => ({
        species,
        malePrice: pricingMap.get(species)?.malePrice ?? 0,
        femalePrice: pricingMap.get(species)?.femalePrice ?? 0,
      }));
      formData.append("gameList", JSON.stringify(gameList));
      formData.append("gpsCoordinates", JSON.stringify(values.gpsCoordinates));

      // images
      imageFiles.forEach((file) => formData.append("images", file));

      const res = await authenticatedFetch(`${API_URL}/addfarm`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to add farm");
      }
      setStoring(false);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error(error);
      setStoring(false);
      setErrorMessage(`Error adding farm: ${error.message || error}`);
      setShowErrorDialog(true);
    }
  };

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
            <h1 className="text-2xl font-bold text-white">Add Farm</h1>
            <div className="w-32" />
          </div>
        </div>
      </div>

      <FarmForm
        submitLabel="Save Changes"
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-green-600">Success</h4>
            </div>
            <p className="text-gray-700 mb-4">Farm added successfully!</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSuccessDialog(false);
                  navigate("/OwnerDashboard");
                }}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-red-600">Error</h4>
            </div>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowErrorDialog(false)}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
