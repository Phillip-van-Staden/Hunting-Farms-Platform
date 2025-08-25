import React, { useState, useEffect } from "react";
import { User, Mail, Edit2 } from "lucide-react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  category: string;
}

interface ProfileScreenProps {
  user: User | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function ProfileScreen({ user }: ProfileScreenProps) {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "", // owner or hunter
  });

  const [notifications, setNotifications] = useState({
    weeklyUpdates: false,
  });

  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Fetch user data when component mounts
  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/person/${user.email}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        setFormData({
          firstName: data.pnaam,
          lastName: data.pvan,
          email: data.pemail,
          userType: data.pcategory,
        });

        setNotifications({
          weeklyUpdates: data.psubscribe, // assuming psubscribe is boolean
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));

    if (user) {
      try {
        await fetch(`${API_URL}/person/updatenotifications/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ psubscribe: value }),
        });
      } catch (err) {
        console.error("Error updating notifications:", err);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/person/update/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pnaam: formData.firstName,
          pvan: formData.lastName,
          pemail: formData.email,
        }),
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPasswordChange = async () => {
    if (!user) return;

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      await fetch(`${API_URL}/person/updatepassword/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: passwordData.newPassword }),
      });
      alert("Password changed successfully!");
      setIsPasswordChanging(false);
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Error updating password:", err);
    }
  };

  const handleOwnerButton = () => {
    if (formData.userType === "Farmer") {
      navigate("/OwnerDashboard");
    } else {
      navigate("/farms");
    }
  };

  return (
    <div className="min-h-screen bg-beige">
      {/* header */}
      <div className="bg-black shadow-sm w-full">
        <div className="flex items-center justify-center h-16">
          <h1 className="text-xl text-center font-bold text-white">
            My Profile
          </h1>
        </div>
      </div>
      <div className="w-full px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-25 h-25 text-green-500" />
              </div>
              <h2 className="text-brown mb-2 text-2xl">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-600 mb-4 capitalize text-md font-semibold">
                {formData.userType}
              </p>

              <div className="space-y-4 text-left">
                <div className="flex items-center text-gray-600 mb-4">
                  <Mail className="w-5 h-5 mr-3 text-primary" />
                  <span className="text-sm">{formData.email}</span>
                </div>

                {/* Owner / Farms button */}
                <div className="text-center">
                  <button
                    onClick={handleOwnerButton}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold text-sm hover:bg-green-600 transition"
                  >
                    {formData.userType === "Farmer"
                      ? "Go to Farm Dashboard"
                      : "Explore Farms"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details & Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-brown">
                  Personal Information
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-primary hover:text-brown transition-colors font-semibold text-sm"
                >
                  <Edit2 className="w-5 h-5 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              <form className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block font-semibold text-brown mb-2 text-sm">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none disabled:bg-gray-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-brown mb-2 text-sm">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none disabled:bg-gray-50 text-sm"
                    />
                  </div>
                </div>
                <div className="py-2" />
                <div>
                  <label className="block font-semibold text-brown mb-2 text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none disabled:bg-gray-50 text-sm"
                  />
                </div>

                {isEditing && (
                  <div className="mt-6 text-right">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm transition hover:bg-brown"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="py-4" />
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-brown mb-6">
                Notification Preferences
              </h3>
              <div className="space-y-4">
                {Object.keys(notifications).map((key) => (
                  <div className="flex justify-between items-center" key={key}>
                    <span className="text-sm font-semibold text-brown capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="1"
                      value={
                        notifications[key as keyof typeof notifications] ? 1 : 0
                      }
                      onChange={(e) =>
                        handleNotificationChange(key, e.target.value === "1")
                      }
                      className="w-16"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <div className="py-4" />
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-brown">
                  Change Password
                </h3>
                <button
                  onClick={() => setIsPasswordChanging(!isPasswordChanging)}
                  className="text-primary font-semibold text-sm"
                >
                  {isPasswordChanging ? "Cancel" : "Change"}
                </button>
              </div>

              {isPasswordChanging && (
                <div>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-brown mb-2 text-sm">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-brown mb-2 text-sm">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary outline-none text-sm"
                      />
                    </div>

                    <div className="mt-6 text-right">
                      <button
                        type="button"
                        onClick={handleSubmitPasswordChange}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm transition hover:bg-brown"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfileScreen;
