import { useState } from "react";
interface Review {
  id: number;
  rating: number;
  date: string;
  comment: string;
  author: string;
}

interface User {
  first_name: string;
  last_name: string;
  email: string;
  admin: boolean;
  category: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (r: Review) => void;
  farmName: string;
  user: User | null;
}

export function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  farmName,
  user, // Accepting the user data as a prop
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = () => {
    if (!comment.trim()) {
      alert("Please fill your comment.");
      return;
    }

    const author = user ? user.first_name + " " + user.last_name : "Anonymous";

    const newReview: Review = {
      id: Date.now(),
      rating,
      date: new Date().toISOString().split("T")[0],
      comment,
      author, // Set the author to either user.first_name or "Anonymous"
    };
    onSubmit(newReview);
    setRating(5);
    setComment("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Write a review for {farmName}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border px-2 py-1 rounded"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={5}
            placeholder="Your review"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 rounded bg-green-500 text-white"
              aria-label="Submit Review"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
