import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FarmForm from "../components/FarmForm";
import type { FarmFormValues, GamePricing } from "../components/FarmForm";

const API_URL = "http://localhost:5000/farms";

const formatToPostgresArray = (arr: any[]) => `{${arr.join(",")}}`;
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  category: string;
}
interface AddFarmScreenProps {
  user: User;
}

export default function AddFarmScreen({ user }: AddFarmScreenProps) {
  const navigate = useNavigate();

  const handleCancel = () => navigate(-1);

  const handleSubmit = async (values: FarmFormValues, imageFiles: File[]) => {
    try {
      const formData = new FormData();

      // scalar / text
      formData.append("name", values.name);
      formData.append("province", values.province);
      formData.append("city", values.city);
      formData.append("description", values.description);
      formData.append("dailyRate", String(values.pricing.dailyRate ?? 0));
      formData.append("phone", values.contact_info.phone);
      formData.append("email", values.contact_info.email);
      formData.append("website", values.contact_info.website);
      formData.append("userId", String(user.id)); // Use real user ID

      // arrays as postgres array literal -> your backend inserts directly into text[] columns
      formData.append("categories", formatToPostgresArray(values.categories));
      formData.append("amenities", formatToPostgresArray(values.amenities));

      // JSON strings (your /addfarm route JSON.parses both)
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

      const res = await fetch(`${API_URL}/addfarm`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to add farm");
      }

      alert("Farm added successfully!");
      navigate("/OwnerDashboard");
    } catch (error: any) {
      console.error(error);
      alert(`Error adding farm: ${error.message || error}`);
    }
  };

  return (
    <div className="min-h-screen bg-beige">
      <div className="bg-black shadow-sm w-full">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={handleCancel}
              className="flex items-center text-white hover:bg-green-500 transition-colors text-lg"
            >
              <ArrowLeft className="w-6 h-6 mr-3" />
              Back
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
    </div>
  );
}
