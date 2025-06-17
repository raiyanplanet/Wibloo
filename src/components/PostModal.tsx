import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface PostModalProps {
  post: any;
  onClose: () => void;
}

export function PostModal({ post, onClose }: PostModalProps) {
  const comments =
    useQuery(api.comments.getPostComments, { postId: post._id }) || [];
  const addComment = useMutation(api.comments.addComment);
  const toggleLike = useMutation(api.likes.toggleLike);

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment({
        postId: post._id,
        content: newComment.trim(),
      });
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleLike({ postId: post._id });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.author?.name || "User"}`,
        text: post.caption || "Check out this post!",
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors">
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Section */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-[500px]">
          <img
            src={post.imageUrl}
            alt="Post"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Content Section */}
        <div className="w-[400px] flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
              {post.author?.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {(
                      post.author?.name ||
                      post.author?.email ||
                      "User"
                    )?.charAt(0) || "?"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-900">
                {post.author?.username ||
                  post.author?.email?.split("@")[0] ||
                  "user"}
              </h3>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto">
            {/* Caption as first comment */}
            {post.caption && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {post.author?.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {(
                            post.author?.name ||
                            post.author?.email ||
                            "User"
                          )?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold mr-2">
                        {post.author?.username ||
                          post.author?.email?.split("@")[0] ||
                          "user"}
                      </span>
                      {post.caption}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                      {new Date(post._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="px-4">
              {comments.map((comment) => (
                <div key={comment._id} className="py-3 flex space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {comment.author?.avatarUrl ? (
                      <img
                        src={comment.author.avatarUrl}
                        alt={comment.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {(
                            comment.author?.name ||
                            comment.author?.email ||
                            "User"
                          )?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold mr-2">
                        {comment.author?.username ||
                          comment.author?.email?.split("@")[0] ||
                          "user"}
                      </span>
                      {comment.content}
                    </p>
                    <div className="flex items-center mt-1 space-x-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {new Date(comment._creationTime).toLocaleDateString()}
                      </p>
                      <button className="text-xs text-gray-500 font-semibold hover:text-gray-700">
                        Reply
                      </button>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="border-t border-gray-200">
            {/* Action Buttons */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => handleLike(e)}
                  className={`transition-colors ${
                    post.isLiked
                      ? "text-red-500"
                      : "text-gray-900 hover:text-gray-600"
                  }`}>
                  <svg
                    className="h-6 w-6"
                    fill={post.isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                <button className="text-gray-900 hover:text-gray-600 transition-colors">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleShare}
                  className="text-gray-900 hover:text-gray-600 transition-colors">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </button>
              </div>

              <button className="text-gray-900 hover:text-gray-600 transition-colors">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            </div>

            {/* Likes Count */}
            <div className="px-4 pb-2">
              <p className="text-sm font-semibold text-gray-900">
                {post.likesCount || 0} likes
              </p>
            </div>

            {/* Timestamp */}
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {new Date(post._creationTime).toLocaleDateString()}
              </p>
            </div>

            {/* Add Comment */}
            <div className="border-t border-gray-200 px-4 py-3">
              <form
                onSubmit={handleAddComment}
                className="flex items-center space-x-3">
                <div className="flex-1 flex items-center">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 text-sm placeholder-gray-400 border-none outline-none resize-none"
                    disabled={isSubmitting}
                  />
                </div>
                {newComment.trim() && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-blue-500 font-semibold text-sm hover:text-blue-700 transition-colors disabled:opacity-50">
                    {isSubmitting ? "Posting..." : "Post"}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
