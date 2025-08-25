// src/pages/Register.tsx
import React, { useState } from "react";
import Footer from "../components/Footer";
import { Eye, EyeOff, UserPlus, Users, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// interface User {
//   //id: Number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   admin: boolean;
//   category: string;
// }

interface RegisterProps {
  // optional so component still works if App.tsx hasn't been updated yet
  onRegisterSuccess?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "hunter", // maps to pcategory
    weeklyUpdates: false, // maps to psubscribe
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/person/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pnaam: formData.firstName,
          pvan: formData.lastName,
          pemail: formData.email,
          ppassword: formData.password,
          pcategory: formData.userType,
          psubscribe: formData.weeklyUpdates,
          padmin: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register.");
      }

      // Map to the front-end user shape expected by App/Header:
      // const user: User = {
      //   first_name: formData.firstName,
      //   last_name: formData.lastName,
      //   email: formData.email,
      //   admin: data.padmin,
      //   category: data.pcategory,
      // };

      // Persist + update App state (if callback provided)
      //localStorage.setItem("user", JSON.stringify(user));
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }

      console.log("Registered and logged in successfully:", data);
      navigate("/login"); // Redirect to login (Header will show logged-in view)
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-beige relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1636045502882-c3c22cb71226?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE2fHx8ZW58MHx8fHx8"
            alt="African Safari Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brown bg-opacity-40"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <UserPlus className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl text-white mb-4 text-shadow">
                Join Safari Hunt SA
              </h2>
              <p className="text-xl text-white">
                Start your hunting adventure today
              </p>
            </div>

            {/* Form */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-12 border border-brown border-opacity-20 max-w-4xl mx-auto">
              <form onSubmit={handleRegister} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block font-semibold text-brown mb-4"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 border-2 border-gray-200 rounded-lg"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block font-semibold text-brown mb-4"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 border-2 border-gray-200 rounded-lg"
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block font-semibold text-brown mb-4"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-6 py-5 border-2 border-gray-200 rounded-lg"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* User Type */}
                <div>
                  <label className="block font-semibold text-brown mb-6">
                    I am a...
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label
                      className={`cursor-pointer border-3 rounded-xl p-8 transition-all ${
                        formData.userType === "hunter"
                          ? "border-primary bg-primary bg-opacity-10"
                          : "border-gray-200 hover:border-primary"
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value="hunter"
                        checked={formData.userType === "hunter"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <p className="font-semibold text-brown text-xl mb-2">
                          Hunter
                        </p>
                        <p className="text-gray-600">
                          Looking for farms to hunt on
                        </p>
                      </div>
                    </label>
                    <label
                      className={`cursor-pointer border-3 rounded-xl p-8 transition-all ${
                        formData.userType === "Farmer"
                          ? "border-primary bg-primary bg-opacity-10"
                          : "border-gray-200 hover:border-primary"
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value="farm_owner"
                        checked={formData.userType === "farm_owner"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <Building className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <p className="font-semibold text-brown text-xl mb-2">
                          Farm Owner
                        </p>
                        <p className="text-gray-600">
                          Want to list my hunting farm
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label
                      htmlFor="password"
                      className="block font-semibold text-brown mb-4"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-6 py-5 pr-14 border-2 border-gray-200 rounded-lg"
                        placeholder="Create a strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 transform -translate-y-1/2"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={24} />
                        ) : (
                          <Eye size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block font-semibold text-brown mb-4"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-6 py-5 pr-14 border-2 border-gray-200 rounded-lg"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-5 top-1/2 transform -translate-y-1/2"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={24} />
                        ) : (
                          <Eye size={24} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Newsletter */}
                <div className="flex items-start space-x-4 bg-gray-50 p-6 rounded-xl">
                  <input
                    id="weeklyUpdates"
                    name="weeklyUpdates"
                    type="checkbox"
                    checked={formData.weeklyUpdates}
                    onChange={handleInputChange}
                    className="h-6 w-6"
                  />
                  <label htmlFor="weeklyUpdates" className="text-brown">
                    <span className="font-semibold text-lg">
                      Subscribe to weekly updates
                    </span>
                    <p className="text-gray-600 mt-2">
                      Get the latest hunting news, farm listings, and exclusive
                      offers delivered to your inbox.
                    </p>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white py-5 rounded-lg font-semibold text-xl"
                >
                  {isLoading ? "Creating Account..." : "Start Hunting"}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-10 text-center">
                <p className="text-gray-600 text-lg">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 font-semibold">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Register;
