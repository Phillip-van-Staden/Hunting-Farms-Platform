import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Help from "./pages/Help";
import AboutUs from "./pages/AboutUs";
import { BlogScreen } from "./pages/Blog";
import FarmsPage from "./pages/Farms";
import FarmDetails from "./pages/FarmDetails"; // <-- import the details page
import Header from "./components/Header";
import { ProfileScreen } from "./pages/Profile";
import OwnerDashboardScreen from "./pages/OwnerDashboard";
import AddFarmScreen from "./pages/AddFarm";
import FarmDetailsOwner from "./pages/FarmDetailsOwner";
import EditFarmScreen from "./pages/EditFarm";
import { AddBlogs } from "./pages/AddBlogs";
import { BlogArticle } from "./pages/BlogArticle";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminUserReviews } from "./pages/AdminUserReviews";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  category: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Load from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <>
      <Router>
        <Header user={user} onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
          <Route
            path="/register"
            element={<Register onRegisterSuccess={() => {}} />}
          />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<AboutUs />} />
          <Route
            path="/blog"
            element={
              <BlogScreen
                onScreenChange={function (screen: string): void {
                  throw new Error("Function not implemented.");
                }}
                user={user}
              />
            }
          />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/:id" element={<FarmDetails user={user} />} />
          {/* <-- NEW route */}
          <Route path="/profile" element={<ProfileScreen user={user} />} />
          <Route
            path="/OwnerDashboard"
            element={<OwnerDashboardScreen user={user} />}
          />
          <Route path="/add-farm" element={<AddFarmScreen user={user!} />} />
          <Route
            path="/owner/edit-farm/:id"
            element={<EditFarmScreen user={user!} />}
          />
          <Route path="/owner/farms/:id" element={<FarmDetailsOwner />} />{" "}
          <Route path="/blogs/add" element={<AddBlogs user={user} />} />
          <Route path="/blogs/:bid" element={<BlogArticle />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="admin/users/:id/reviews"
            element={<AdminUserReviews />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
