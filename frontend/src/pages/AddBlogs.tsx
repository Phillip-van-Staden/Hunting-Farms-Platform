import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  category: string;
}

export function AddBlogs({ user }: { user: User | null }) {
  const [blogData, setBlogData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "guest-stories",
    featuredImage: "",
    tags: [] as string[],
    author: "Anonymous",
  });

  const [newTag, setNewTag] = useState("");
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const userCategories = [
    "guest-stories",
    "hunting-tips",
    "gear-reviews",
    "photography",
    "conservation",
  ];
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Create object URL for preview and clean up previous URL
  useEffect(() => {
    let objectUrl: string | null = null;
    if (featuredImageFile) {
      objectUrl = URL.createObjectURL(featuredImageFile);
      setFeaturedImagePreview(objectUrl);
    } else {
      setFeaturedImagePreview("");
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [featuredImageFile]);
  const addTag = () => {
    if (newTag.trim() && !blogData.tags.includes(newTag.trim())) {
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      // clear invalid selection
      e.currentTarget.value = "";
      return;
    }
    setFeaturedImageFile(file);
    // clear legacy featuredImage string if set
    setBlogData((prev) => ({ ...prev, featuredImage: "" }));
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFeaturedImage = () => {
    // revoke handled by effect cleanup
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    // keep blogData.featuredImage empty
    setBlogData((prev) => ({ ...prev, featuredImage: "" }));
  };

  const handleSubmit = async () => {
    const errors: { [key: string]: string } = {};
    if (!blogData.title.trim()) {
      errors.title = "Title is required.";
    }
    if (!blogData.content.trim()) {
      errors.content = "Story content is required.";
    }
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Optionally scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      document
        .getElementById(`blog-field-${firstErrorField}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("bTitle", blogData.title);
      formData.append("bDescription", blogData.excerpt);
      formData.append("bStory", blogData.content);
      formData.append("bCategory", blogData.category);
      formData.append("pID", String(user?.id || 0));
      formData.append("bTags", blogData.tags.join(",")); // backend will split
      if (featuredImageFile) {
        formData.append("bimage", featuredImageFile);
      }

      const res = await axios.post("http://localhost:5000/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Blog created:", res.data);
      alert("Blog submitted successfully! Pending approval.");
      navigate("/blog"); // redirect after submit
    } catch (err) {
      console.error("Error submitting blog:", err);
      alert("Error submitting blog.");
    }
  };

  return (
    <div className="min-h-screen bg-beige">
      {/* Page Header */}
      <div className="mb-6 bg-black text-center p-4">
        <h1 className="text-3xl font-bold text-white">Create new blog post</h1>
      </div>
      <div className="w-full px-6 lg:px-12 py-16">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
          <div className="mb-4">
            <label
              htmlFor="blog-field-title"
              className="block font-bold text-brown mb-4 text-xl"
            >
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="blog-field-title"
              type="text"
              value={blogData.title}
              placeholder="Enter the title of your story"
              onChange={(e) =>
                setBlogData((prev) => ({ ...prev, title: e.target.value }))
              }
              aria-invalid={!!fieldErrors.title}
              aria-describedby={fieldErrors.title ? "error-title" : undefined}
              className={`w-full rounded px-3 py-2 border focus:outline-none ${
                fieldErrors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.title && (
              <p id="error-title" role="alert" className="text-red-600 mt-1">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="blog-field-excerpt"
              className="block font-bold text-brown mb-4 text-xl"
            >
              Excerpt
            </label>
            <input
              id="blog-field-excerpt"
              type="text"
              value={blogData.excerpt}
              placeholder="Brief description of the story (used in listings)"
              onChange={(e) =>
                setBlogData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              className="w-full rounded px-3 py-2 border border-gray-300"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="blog-field-content"
              className="block font-bold text-brown mb-4 text-xl"
            >
              Story <span className="text-red-600">*</span>
            </label>
            <textarea
              id="blog-field-content"
              value={blogData.content}
              placeholder="Write your story here..."
              onChange={(e) =>
                setBlogData((prev) => ({ ...prev, content: e.target.value }))
              }
              aria-invalid={!!fieldErrors.content}
              aria-describedby={
                fieldErrors.content ? "error-content" : undefined
              }
              rows={10}
              className={`w-full rounded px-3 py-2 border focus:outline-none ${
                fieldErrors.content ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.content && (
              <p id="error-content" role="alert" className="text-red-600 mt-1">
                {fieldErrors.content}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-bold text-brown mb-4 text-xl">
              Category
            </label>
            <select
              value={blogData.category}
              onChange={(e) =>
                setBlogData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded px-3 py-2 border border-gray-300"
            >
              {userCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* tags, image uploader and other fields */}
          <div className="mb-6">
            <label className="block font-bold text-brown mb-4 text-xl">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="rounded px-3 py-2 border border-gray-300 flex-1"
                placeholder="Add a tag and press Add"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-green-600 text-white rounded px-3 py-2"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {blogData.tags.map((t) => (
                <span
                  key={t}
                  className="bg-gray-200 px-3 py-1 rounded flex items-center gap-2"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-red-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-bold text-brown mb-4 text-xl">
              Featured Image
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={triggerFileDialog}
                className="bg-gray-800 text-white rounded px-3 py-2"
              >
                Choose Image
              </button>
              {featuredImagePreview ? (
                <div className="relative">
                  <img
                    src={featuredImagePreview}
                    alt="preview"
                    className="w-32 h-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={removeFeaturedImage}
                    className="absolute top-0 right-0 bg-white rounded-full p-1 text-red-600"
                  >
                    &times;
                  </button>
                </div>
              ) : blogData.featuredImage ? (
                <img
                  src={blogData.featuredImage}
                  alt="existing"
                  className="w-32 h-20 object-cover rounded border"
                />
              ) : null}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
