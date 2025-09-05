// BlogArticle.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Blog {
  bid: number;
  btitle: string;
  bcategory: string;
  bdescription: string;
  bstory: string;
  pId: number;
  bimage: string | null;
  btags: string[];
  bstatus: string;
  bdate: string;
  author?: string;
}

export function BlogArticle() {
  const { bid } = useParams<{ bid: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Blog | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/${bid}`);
        if (!res.ok) throw new Error("Failed to fetch article");
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error("Error fetching article:", err);
      }
    };
    fetchArticle();
  }, [bid]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-brown mb-4">Loading article...</h2>
          <button
            onClick={() => navigate("/blog")}
            className="bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-opacity-90 transition-colors font-bold text-lg"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* Header */}
      <div className="bg-black shadow-sm w-full">
        <div className="w-full px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => navigate("/blog")}
              className="flex items-center text-white hover:text-green-600 transition-colors text-lg"
            >
              <ArrowLeft className="w-6 h-6 mr-3" />
              Back to Blogs
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="w-full px-6 lg:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-12">
            {(() => {
              const categories = [
                { id: "all", name: "All Posts" },
                { id: "hunting-tips", name: "Hunting Tips" },
                { id: "conservation", name: "Conservation" },
                { id: "gear-reviews", name: "Gear Reviews" },
                { id: "guest-stories", name: "Guest Stories" },
              ];
              const categoryObj = categories.find(
                (cat) => cat.id === article.bcategory
              );
              return (
                <div className="flex items-center space-x-4 mb-6">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                    {categoryObj ? categoryObj.name : article.bcategory}
                  </span>
                </div>
              );
            })()}
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-16">
            <h1 className="text-brown mb-8 text-5xl leading-tight">
              {article.btitle}
            </h1>

            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {article.author
                    ? article.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "A"}
                </div>
                <div>
                  <p className="font-bold text-brown text-lg">
                    {article.author || "Anonymous"}
                  </p>
                  <p className="text-gray-600">{formatDate(article.bdate)}</p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {article.bimage && (
              <div className="mb-12">
                <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={article.bimage}
                    alt={article.btitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Article Content */}
            {article.bstory && (
              <div className="prose prose-lg max-w-none whitespace-pre-line">
                {article.bstory}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-16">
              <button
                onClick={() => navigate("/blog")}
                className="bg-green-500 text-white px-8 py-4 rounded-2xl hover:bg-opacity-90 transition-colors font-bold text-lg"
              >
                Back to Blogs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
