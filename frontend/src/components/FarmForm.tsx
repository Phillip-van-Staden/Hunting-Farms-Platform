import React, { useEffect, useMemo, useState } from "react";
import { Plus, Upload, Trash2, Save } from "lucide-react";

export interface GamePricing {
  species: string;
  femalePrice: number;
  malePrice: number;
}

export interface FarmFormValues {
  name: string;
  province: string;
  city: string;
  gpsCoordinates: { latitude: string; longitude: string };
  description: string;
  categories: string[];
  game_list: string[];
  amenities: string[];
  contact_info: { phone: string; email: string; website: string };
  images: string[];
  pricing: { dailyRate: number; gamePricing: GamePricing[] };
}

interface FarmFormProps {
  initialValues?: FarmFormValues;
  submitLabel: string;
  onSubmit: (values: FarmFormValues, imageFiles: File[]) => void;
  onCancel: () => void;
}

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

const DEFAULT_GAME_OPTIONS = [
  "Kudu",
  "Impala",
  "Springbok",
  "Warthog",
  "Eland",
  "Buffalo",
  "Zebra",
  "Blue Wildebeest",
  "Gemsbok",
  "Blesbok",
  "Red Hartebeest",
  "Nyala",
  "Bushbuck",
  "Waterbuck",
];

const DEFAULT_AMENITIES = [
  "Accommodation",
  "Professional Guides",
  "Meals Included",
  "Transport",
  "Equipment Rental",
  "Taxidermy Services",
  "Airport Transfers",
];

const CATEGORIES = [
  "Big Game",
  "Plains Game",
  "Mountain Hunting",
  "Bird Hunting",
  "Bow Hunting",
];

const ImageWithFallback = ({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img src={src} alt={alt || "image"} className={className} {...props} />
);

const defaultValues: FarmFormValues = {
  name: "",
  province: "",
  city: "",
  gpsCoordinates: { latitude: "", longitude: "" },
  description: "",
  categories: [],
  game_list: [],
  amenities: [],
  contact_info: { phone: "", email: "", website: "" },
  images: [],
  pricing: { dailyRate: 0, gamePricing: [] },
};

const FarmForm: React.FC<FarmFormProps> = ({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [farmData, setFarmData] = useState<FarmFormValues>(
    initialValues ?? defaultValues
  );
  const [gameOptions, setGameOptions] =
    useState<string[]>(DEFAULT_GAME_OPTIONS);
  const [amenityOptions] = useState<string[]>(DEFAULT_AMENITIES);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialValues) {
      setFarmData(initialValues);
      setSelectedImageIndex(0);
      const extra = initialValues.game_list.filter(
        (s) => !DEFAULT_GAME_OPTIONS.includes(s)
      );
      if (extra.length) {
        setGameOptions((prev) => Array.from(new Set([...prev, ...extra])));
      }
    }
  }, [initialValues]);

  const pricingBySpecies = useMemo(() => {
    const map = new Map<string, GamePricing>();
    for (const gp of farmData.pricing.gamePricing) map.set(gp.species, gp);
    return map;
  }, [farmData.pricing.gamePricing]);

  const getGamePrice = (
    species: string,
    field: "femalePrice" | "malePrice"
  ) => {
    const p = pricingBySpecies.get(species);
    return p ? p[field] : 0;
  };

  const updateGamePricing = (
    species: string,
    field: "femalePrice" | "malePrice",
    value: number
  ) => {
    const idx = farmData.pricing.gamePricing.findIndex(
      (p) => p.species === species
    );
    if (idx >= 0) {
      const updated = [...farmData.pricing.gamePricing];
      updated[idx] = { ...updated[idx], [field]: value };
      setFarmData((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, gamePricing: updated },
      }));
    } else {
      const newPricing: GamePricing = {
        species,
        femalePrice: field === "femalePrice" ? value : 0,
        malePrice: field === "malePrice" ? value : 0,
      };
      setFarmData((prev) => ({
        ...prev,
        pricing: {
          ...prev.pricing,
          gamePricing: [...prev.pricing.gamePricing, newPricing],
        },
      }));
    }
  };

  const handleArrayToggle = (
    array: string[],
    value: string,
    setter: (newArray: string[]) => void
  ) => {
    if (array.includes(value)) setter(array.filter((item) => item !== value));
    else setter([...array, value]);
  };

  const addSpeciesToGameList = () => {
    const newSpecies = prompt("Enter the name of the new species:");
    if (!newSpecies) return;
    if (!gameOptions.includes(newSpecies))
      setGameOptions((prev) => [...prev, newSpecies]);
    if (!farmData.game_list.includes(newSpecies)) {
      setFarmData((prev) => ({
        ...prev,
        game_list: [...prev.game_list, newSpecies],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFarmData((prev) => {
      const imgs = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: imgs };
    });
    setSelectedImageIndex((i) => (i > index ? i - 1 : 0));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).slice(
      0,
      Math.max(0, 10 - imageFiles.length)
    );
    setImageFiles((prev) => [...prev, ...newFiles]);
    const newImages = newFiles.map((file) => URL.createObjectURL(file));
    setFarmData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
    setSelectedImageIndex(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ensuredPricing = farmData.game_list.map((species) => {
      const p = pricingBySpecies.get(species);
      return {
        species,
        malePrice: p?.malePrice ?? 0,
        femalePrice: p?.femalePrice ?? 0,
      };
    });
    onSubmit(
      {
        ...farmData,
        pricing: { ...farmData.pricing, gamePricing: ensuredPricing },
      },
      imageFiles
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="W-full px-6 lg:px-12 py-16">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
          <div className="space-y-12">
            {/* Basic Information */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-brown">
                Basic Information
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block font-bold text-brown mb-4 text-xl">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    value={farmData.name}
                    onChange={(e) =>
                      setFarmData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary outline-none text-xl"
                    placeholder="Enter farm name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-brown mb-4 text-xl">
                    Province *
                  </label>
                  <select
                    value={farmData.province}
                    onChange={(e) =>
                      setFarmData((prev) => ({
                        ...prev,
                        province: e.target.value,
                      }))
                    }
                    className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary outline-none text-xl"
                    required
                  >
                    <option value="">Select a province</option>
                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brown mb-4 text-xl">
                    Address
                  </label>
                  <input
                    type="text"
                    value={farmData.city}
                    onChange={(e) =>
                      setFarmData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary outline-none text-xl"
                    placeholder="e.g., Polokwane"
                    required
                  />
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="rounded-xl py-2">
                <h5 className="text-xl font-bold text-brown mb-4">
                  GPS Coordinates
                </h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-brown mb-3 text-lg">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={farmData.gpsCoordinates.latitude}
                      onChange={(e) =>
                        setFarmData((prev) => ({
                          ...prev,
                          gpsCoordinates: {
                            ...prev.gpsCoordinates,
                            latitude: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg"
                      placeholder="-25.7479"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-brown mb-3 text-lg">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={farmData.gpsCoordinates.longitude}
                      onChange={(e) =>
                        setFarmData((prev) => ({
                          ...prev,
                          gpsCoordinates: {
                            ...prev.gpsCoordinates,
                            longitude: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg"
                      placeholder="28.2293"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-brown mb-4 text-xl">
                  Description *
                </label>
                <textarea
                  value={farmData.description}
                  onChange={(e) =>
                    setFarmData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={6}
                  className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary outline-none text-xl resize-none"
                  placeholder="Describe your hunting farm, facilities, and what makes it special..."
                  required
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-brown">
                Hunting Categories
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={farmData.categories.includes(category)}
                      onChange={() =>
                        handleArrayToggle(
                          farmData.categories,
                          category,
                          (newCategories) =>
                            setFarmData((prev) => ({
                              ...prev,
                              categories: newCategories,
                            }))
                        )
                      }
                      className="h-6 w-6 text-primary focus:ring-primary border-gray-300 rounded mr-4"
                    />
                    <span className="text-lg font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Game Species */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-brown">
                Available Game Species
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gameOptions.map((game) => (
                  <label
                    key={game}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={farmData.game_list.includes(game)}
                      onChange={() =>
                        handleArrayToggle(
                          farmData.game_list,
                          game,
                          (newGameList) =>
                            setFarmData((prev) => ({
                              ...prev,
                              game_list: newGameList,
                            }))
                        )
                      }
                      className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded mr-3"
                    />
                    <span className="text-lg font-medium">{game}</span>
                  </label>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h5 className="text-xl font-bold text-brown mb-4">
                  Add Custom Game Species
                </h5>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={addSpeciesToGameList}
                    className="bg-green-200 text-black px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-semibold text-lg flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2 inline" />
                    Add Species
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-brown">
                Pricing Information
              </h4>

              <div className="bg-gray-50 rounded-xl p-6">
                <h5 className="text-xl font-bold text-brown mb-4">
                  Daily Rate
                </h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-semibold text-brown mb-3 text-lg">
                      Daily Rate (R)
                    </label>
                    <input
                      type="number"
                      value={farmData.pricing.dailyRate || 0}
                      onChange={(e) =>
                        setFarmData((prev) => ({
                          ...prev,
                          pricing: {
                            ...prev.pricing,
                            dailyRate: parseInt(e.target.value || "0", 10),
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg"
                      placeholder="450"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {farmData.game_list.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h5 className="text-xl font-bold text-brown mb-4">
                    Individual Game Pricing
                  </h5>
                  <div className="space-y-4">
                    {farmData.game_list.map((species: string) => (
                      <div
                        key={species}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <h6 className="font-semibold text-brown mb-3 text-lg">
                          {species}
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-medium text-gray-700 mb-2">
                              Male Price (R)
                            </label>
                            <input
                              type="number"
                              value={getGamePrice(species, "malePrice")}
                              onChange={(e) =>
                                updateGamePricing(
                                  species,
                                  "malePrice",
                                  parseFloat(e.target.value || "0")
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-gray-700 mb-2">
                              Female Price (R)
                            </label>
                            <input
                              type="number"
                              value={getGamePrice(species, "femalePrice")}
                              onChange={(e) =>
                                updateGamePricing(
                                  species,
                                  "femalePrice",
                                  parseFloat(e.target.value || "0")
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-brown">
                Amenities & Services
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amenityOptions.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={farmData.amenities.includes(amenity)}
                      onChange={() =>
                        handleArrayToggle(
                          farmData.amenities,
                          amenity,
                          (newAmenities) =>
                            setFarmData((prev) => ({
                              ...prev,
                              amenities: newAmenities,
                            }))
                        )
                      }
                      className="h-6 w-6 text-primary focus:ring-primary border-gray-300 rounded mr-4"
                    />
                    <span className="text-lg font-medium">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-brown">
                Contact Information
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <label className="block font-bold text-brown mb-4 text-xl">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={farmData.contact_info.phone}
                    onChange={(e) =>
                      setFarmData((prev) => ({
                        ...prev,
                        contact_info: {
                          ...prev.contact_info,
                          phone: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary outline-none text-xl"
                    placeholder="+27 12 345 6789"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brown mb-4 text-xl">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={farmData.contact_info.email}
                    onChange={(e) =>
                      setFarmData((prev) => ({
                        ...prev,
                        contact_info: {
                          ...prev.contact_info,
                          email: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary outline-none text-xl"
                    placeholder="info@yourfarm.co.za"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brown mb-4 text-xl">
                    Website
                  </label>
                  <input
                    type="url"
                    value={farmData.contact_info.website}
                    onChange={(e) =>
                      setFarmData((prev) => ({
                        ...prev,
                        contact_info: {
                          ...prev.contact_info,
                          website: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-6 py-5 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-primary focus:border-primary outline-none text-xl"
                    placeholder="www.yourfarm.co.za"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h4 className="text-2xl font-bold text-brown">
                Farm Images (max 10 images)
              </h4>

              {farmData.images.length > 0 ? (
                <div className="mb-4">
                  <ImageWithFallback
                    src={farmData.images[selectedImageIndex]}
                    alt={`${farmData.name ?? "Farm"} main`}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="mb-4 bg-gray-100 rounded-lg h-80 flex items-center justify-center text-gray-500">
                  No images yet
                </div>
              )}

              <div className="flex gap-2 overflow-x-auto mb-4">
                {farmData.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 h-20 w-28 rounded overflow-hidden border ${
                      idx === selectedImageIndex
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`thumb-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-500" />
                  <span className="text-gray-700">Upload images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {farmData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {farmData.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden"
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`image-${index}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end pt-8 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="bg-red-500 text-white px-8 py-4 rounded-xl hover:bg-opacity-90 transition-colors font-bold text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-opacity-90 transition-colors font-bold text-lg flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {submitLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default FarmForm;
