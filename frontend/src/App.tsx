import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { getUser, clearAuthData, isAuthenticated } from "./utils/auth";
import type { User } from "./types/user";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Load from localStorage on refresh
  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getUser();
      setUser(storedUser);
    }
  }, []);

  const handleSignOut = () => {
    setUser(null);
    clearAuthData();
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
            element={
              <Register
                onRegisterSuccess={() => {
                  // Refresh user state after successful registration
                  if (isAuthenticated()) {
                    const storedUser = getUser();
                    setUser(storedUser);
                  }
                }}
              />
            }
          />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<AboutUs />} />
          <Route
            path="/blog"
            element={
              <BlogScreen
                // onScreenChange={function (screen: string): void {
                //   throw new Error("Function not implemented.");
                // }}
                user={user}
              />
            }
          />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/:id" element={<FarmDetails user={user} />} />
          {/* <-- NEW route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <ProfileScreen user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/OwnerDashboard"
            element={
              <ProtectedRoute user={user}>
                <OwnerDashboardScreen user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-farm"
            element={
              <ProtectedRoute user={user}>
                <AddFarmScreen user={user!} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/edit-farm/:id"
            element={
              <ProtectedRoute user={user}>
                <EditFarmScreen user={user!} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/farms/:id"
            element={
              <ProtectedRoute user={user}>
                <FarmDetailsOwner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs/add"
            element={
              <ProtectedRoute user={user}>
                <AddBlogs user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/blogs/:bid" element={<BlogArticle />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users/:id/reviews"
            element={
              <ProtectedRoute user={user} requireAdmin={true}>
                <AdminUserReviews />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
