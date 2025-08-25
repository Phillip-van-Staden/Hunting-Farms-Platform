// src/pages/Login.tsx
import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Shield, ArrowLeft } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    admin: boolean;
    category: string;
  }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/person/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pemail: email,
          ppassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // backend sends { message: '...' } on errors
        setError(data?.message || "Login failed. Please try again.");
        return;
      }

      // Map to the front-end user shape expected by App/Header:
      // success: navigate to root
      // optional: store minimal login state (email) — adjust when you add JWT

      localStorage.setItem("user", JSON.stringify(data));
      onLoginSuccess(data);
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-beige relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1636871694216-d04517e0d1c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc2FmYXJpJTIwbGFuZHNjYXBlJTIwc3Vuc2V0fGVufDF8fHx8MTc1NDgxMjQyMHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="African Safari Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brown bg-opacity-40"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className=" text-4xl text-white mb-4 text-shadow">
                Welcome Back, Hunter
              </h2>
              <p className="text-xl text-white">
                Sign in to access exclusive hunting farms
              </p>
            </div>

            {/* Login Form */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-12 border border-brown border-opacity-20 max-w-xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                )}

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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 bg-white text-lg"
                    placeholder="hunter@example.com"
                  />
                </div>

                <div className="py-2" />

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
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-5 pr-14 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-800 bg-white text-lg"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                </div>

                <div className="py-2" />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white py-5 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xl shadow-lg transform hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="w-6 h-6 mr-3" />
                      Sign In to Hunt
                    </div>
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-lg">
                  New to Safari Hunt SA?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-orange font-semibold transition-colors"
                  >
                    Join the community
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

export default Login;
