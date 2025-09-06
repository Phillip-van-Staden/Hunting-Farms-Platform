import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Eye,
  Trash2,
  CheckCircle,
  Shield,
  MapPin,
  Plus,
} from "lucide-react";
import Footer from "../components/Footer";
import { authenticatedFetch } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "overview" | "farms" | "blogs" | "users"
  >("overview");

  const [stats, setStats] = useState<{
    farms: number;
    blogs: number;
    users: number;
    pendingBlogs: number;
  } | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idOf = (obj: any, ...candidates: string[]) => {
    for (const c of candidates) if (obj && obj[c] !== undefined) return obj[c];
    return undefined;
  };

  const fetchStats = async () => {
    try {
      const res = await authenticatedFetch(`${API_URL}/admin/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats({
        farms: Number(data.farms || 0),
        blogs: Number(data.blogs || 0),
        users: Number(data.users || 0),
        pendingBlogs: Number(data.pendingBlogs || 0),
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error fetching stats");
    }
  };

  const fetchFarms = async () => {
    try {
      const res = await authenticatedFetch(`${API_URL}/admin/farms`);
      if (!res.ok) throw new Error("Failed to fetch farms");
      const data = await res.json();
      setFarms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error fetching farms");
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await authenticatedFetch(`${API_URL}/admin/blogs`);
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error fetching blogs");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authenticatedFetch(`${API_URL}/admin/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error fetching users");
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStats(), fetchFarms(), fetchBlogs(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleApproveBlog = async (blogId: any) => {
    if (!confirm("Are you sure you want to approve this blog post?")) return;
    try {
      const id = idOf(blogId, "bid", "id", "bId", "_id") ?? blogId;
      const res = await authenticatedFetch(`${API_URL}/admin/blogs/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Approved" }),
      });
      if (!res.ok) throw new Error("Failed to update blog status");
      await fetchBlogs();
      await fetchStats();
      alert("Blog post has been approved and published!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error approving blog");
    }
  };

  const handleDeleteBlog = async (blogId: any) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const id = idOf(blogId, "bid", "id", "bId", "_id") ?? blogId;
      const res = await authenticatedFetch(`${API_URL}/blogs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete blog");
      await fetchBlogs();
      await fetchStats();
      alert("Blog post has been successfully deleted.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error deleting blog");
    }
  };

  const handleBanUser = async (userId: any) => {
    const user = users.find(
      (u) =>
        idOf(u, "pid", "id", "pId", "_id") === userId ||
        u.id === userId ||
        u.pid === userId
    );
    if (!user) return;
    const blocked = Boolean(
      user.pblocked ||
        user.pBlocked ||
        user.pblocked === true ||
        user.pblocked === "t"
    );
    const action = blocked ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const id = idOf(user, "pid", "id", "pId", "_id") ?? userId;

      const res = await authenticatedFetch(`${API_URL}/admin/users/${id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to update user");
      await fetchUsers();
      await fetchStats();
      alert(
        `User has been successfully ${action === "ban" ? "banned" : "updated"}.`
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error updating user");
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Farms</p>
            <p className="text-3xl font-bold text-brown">
              {stats ? stats.farms : "—"}
            </p>
          </div>
          <MapPin className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Blogs</p>
            <p className="text-3xl font-bold text-brown">
              {stats ? stats.blogs : "—"}
            </p>
          </div>
          <FileText className="w-8 h-8 text-secondary" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-brown">
              {stats ? stats.users : "—"}
            </p>
          </div>
          <Users className="w-8 h-8 text-orange" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Pending Blogs</p>
            <p className="text-3xl font-bold text-brown">
              {stats ? stats.pendingBlogs : "—"}
            </p>
          </div>
          <Shield className="w-8 h-8 text-yellow" />
        </div>
      </div>
    </div>
  );

  const renderFarms = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-xl font-bold text-brown">Farm Management</h3>
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Farm Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {farms.map((farm) => {
              const fid = idOf(farm, "fid", "fId", "id");
              const name =
                farm.fname ??
                farm.fName ??
                farm.fName ??
                farm.name ??
                farm.f_name ??
                "-";
              const owner = farm.owner ?? farm.Owner ?? "-";
              return (
                <tr key={fid ?? name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {owner}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/owner/farms/${fid}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200">
          {farms.map((farm) => {
            const fid = idOf(farm, "fid", "fId", "id");
            const name =
              farm.fname ??
              farm.fName ??
              farm.fName ??
              farm.name ??
              farm.f_name ??
              "-";
            const owner = farm.owner ?? farm.Owner ?? "-";
            return (
              <li key={fid ?? name} className="p-4 flex flex-col space-y-2">
                <div className="text-sm font-medium text-gray-900">{name}</div>
                <div className="text-sm text-gray-500">Owner: {owner}</div>
                <div>
                  <button
                    onClick={() => navigate(`/owner/farms/${fid}`)}
                    className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  const renderBlogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-brown">Blog Management</h3>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Desktop / Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map((blog) => {
                const bid = idOf(blog, "bid", "id", "bId");
                const title = blog.btitle ?? blog.bTitle ?? blog.title ?? "-";
                const author = blog.author ?? blog.author_name ?? "-";
                const status = (
                  blog.bstatus ??
                  blog.bStatus ??
                  blog.status ??
                  ""
                ).toString();

                return (
                  <tr key={bid ?? title}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          status.toLowerCase() === "approved" ||
                          status.toLowerCase() === "approve"
                            ? "bg-green-100 text-green-800"
                            : status.toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/blogs/${bid}`)}
                          className="text-blue-600 hover:text-blue-900 px-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        {status.toLowerCase() === "pending" && (
                          <button
                            onClick={() => handleApproveBlog(blog)}
                            className="text-green-600 hover:text-green-900 px-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBlog(blog)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden">
          <ul className="divide-y divide-gray-200">
            {blogs.map((blog) => {
              const bid = idOf(blog, "bid", "id", "bId");
              const title = blog.btitle ?? blog.bTitle ?? blog.title ?? "-";
              const author = blog.author ?? blog.author_name ?? "-";
              const status = (
                blog.bstatus ??
                blog.bStatus ??
                blog.status ??
                ""
              ).toString();

              return (
                <li key={bid ?? title} className="p-4 flex flex-col space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    {title}
                  </div>
                  <div className="text-sm text-gray-500">By {author}</div>
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        status.toLowerCase() === "approved" ||
                        status.toLowerCase() === "approve"
                          ? "bg-green-100 text-green-800"
                          : status.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => navigate(`/blogs/${bid}`)}
                      className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    {status.toLowerCase() === "pending" && (
                      <button
                        onClick={() => handleApproveBlog(blog)}
                        className="text-green-600 hover:text-green-900 text-sm flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteBlog(blog)}
                      className="text-red-600 hover:text-red-900 text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-xl font-bold text-brown">User Management</h3>
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const uid = idOf(user, "pid", "id", "pId", "_id");
              const name = user.user ?? user.name ?? user.pnaam ?? "-";
              const email = user.email ?? user.pemail ?? "-";
              const type = user.pcategory ?? user.type ?? "-";
              const blocked = Boolean(
                user.pblocked ||
                  user.pBlocked ||
                  user.pblocked === true ||
                  user.pblocked === "t"
              );
              const reviews = Number(
                user.total_reviews ?? user.totalReviews ?? 0
              );

              return (
                <tr key={uid ?? email}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        blocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {blocked ? "banned" : "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/users/${uid}/reviews`, {
                            state: { user },
                          })
                        }
                        className="text-blue-600 hover:text-blue-900 px-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      {!user.padmin ? (
                        blocked ? (
                          <button
                            onClick={() => handleBanUser(uid)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Unban</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(uid)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Ban</span>
                          </button>
                        )
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => {
            const uid = idOf(user, "pid", "id", "pId", "_id");
            const name = user.user ?? user.name ?? user.pnaam ?? "-";
            const email = user.email ?? user.pemail ?? "-";
            const type = user.pcategory ?? user.type ?? "-";
            const blocked = Boolean(
              user.pblocked ||
                user.pBlocked ||
                user.pblocked === true ||
                user.pblocked === "t"
            );
            const reviews = Number(
              user.total_reviews ?? user.totalReviews ?? 0
            );

            return (
              <li key={uid ?? email} className="p-4 flex flex-col space-y-2">
                <div className="text-sm font-medium text-gray-900">{name}</div>
                <div className="text-sm text-gray-500">{email}</div>
                <div className="text-xs text-gray-500">Type: {type}</div>
                <div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      blocked
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {blocked ? "banned" : "active"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Reviews: {reviews}</div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/users/${uid}/reviews`, {
                        state: { user },
                      })
                    }
                    className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  {blocked ? (
                    <button
                      onClick={() => handleBanUser(uid)}
                      className="text-green-600 hover:text-green-900 text-sm flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Unban</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBanUser(uid)}
                      className="text-red-600 hover:text-red-900 text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Ban</span>
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige to-gray-100">
      <div className="bg-black shadow-lg border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Shield className="w-8 h-8 mr-3 text-white" />
                Admin Dashboard
              </h1>
              <p className="text-white text-sm mt-1">
                Manage your hunting platform
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex flex-wrap gap-2 bg-white rounded-xl shadow-lg p-2">
            {[
              {
                key: "overview",
                label: "Overview",
                icon: Shield,
                color: "text-blue-600",
              },
              {
                key: "farms",
                label: "Farms",
                icon: MapPin,
                color: "text-green-600",
              },
              {
                key: "blogs",
                label: "Blogs",
                icon: FileText,
                color: "text-purple-600",
              },
              {
                key: "users",
                label: "Users",
                icon: Users,
                color: "text-orange-600",
              },
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-200 w-full sm:w-auto ${
                  activeTab === key
                    ? "bg-green-500 text-white shadow-md transform scale-105"
                    : `text-gray-600 hover:text-brown hover:bg-gray-50 ${color}`
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                <span className="text-sm sm:text-base">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div>
          {loading && <div className="text-center py-8">Loading data...</div>}
          {error && <div className="text-red-600 mb-4">{error}</div>}

          {activeTab === "overview" && renderOverview()}
          {activeTab === "farms" && renderFarms()}
          {activeTab === "blogs" && renderBlogs()}
          {activeTab === "users" && renderUsers()}
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-brown mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <button
              onClick={() => navigate("/blogs/add")}
              className="bg-[var(--earthy-green)] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-left text-white"
            >
              <div className="flex items-center mb-6">
                <Plus className="w-10 h-10 text-white mr-4" />
                <h3 className="text-xl font-bold">Create New Blog</h3>
              </div>
              <p className="text-beige opacity-90">
                Write and publish a new blog post
              </p>
            </button>

            <button
              onClick={() => setActiveTab("farms")}
              className="bg-[var(--deep-brown)] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-left text-white"
            >
              <div className="flex items-center mb-6">
                <Shield className="w-10 h-10 text-white mr-4" />
                <h3 className="text-xl font-bold">Manage Farms</h3>
              </div>
              <p className="text-beige opacity-90">
                Oversee all platform farms
              </p>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className="bg-[var(--rusty-orange)] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-left text-white"
            >
              <div className="flex items-center mb-6">
                <Users className="w-10 h-10 text-white mr-4" />
                <h3 className="text-xl font-bold">User Management</h3>
              </div>
              <p className="text-beige opacity-90">
                Manage user accounts and permissions
              </p>
            </button>
          </div>
        </div>
      </div>
      <div className="p-10" />
      <Footer />
    </div>
  );
};

export default AdminDashboard;
