// src/components/FarmCard.tsx
import React from "react";
import { Link } from "react-router-dom";

// Define the type for the farm prop
interface Farm {
  id: number;
  name: string;
  location?: string;
  description?: string;
  price_per_day?: number;
  image?: string;
}

interface FarmCardProps {
  farm: Farm;
}

const FarmCard: React.FC<FarmCardProps> = ({ farm }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[var(--sandy-beige)] hover:shadow-xl transition-shadow duration-300">
      {/* Farm Image */}
      <Link to={`/farms/${farm.id}`}>
        <img
          src={farm.image || "/default-farm.jpg"}
          alt={farm.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between h-full">
        {/* Name & Location */}
        <div>
          <h2 className="text-lg font-bold text-[var(--deep-brown)]">{farm.name}</h2>
          <p className="text-sm text-[var(--olive-green)]">
            {farm.location || "Location not specified"}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
          {farm.description || "No description available."}
        </p>

        {/* Price & Button */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[var(--rusty-orange)] font-bold">
            {farm.price_per_day ? `R${farm.price_per_day}/day` : "Contact for pricing"}
          </span>
          <Link
            to={`/farms/${farm.id}`}
            className="bg-[var(--earthy-green)] text-white px-3 py-1 rounded-lg text-sm hover:bg-[var(--olive-green)] transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;
