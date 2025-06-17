import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { PostModal } from "./PostModal";
import { toast } from "sonner";

export function Feed() {
  const posts = useQuery(api.posts.getFeed) || [];
  const toggleLike = useMutation(api.likes.toggleLike);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    try {
      await toggleLike({ postId: postId as any });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to like post");
    }
  };

  const handleShare = async (post: any) => {
    try {
      await navigator.share({
        title: `Post by ${post.author?.name || 'User'}`,
        text: post.caption || 'Check out this post!',
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold">Home</h1>
      </div>

      {/* Posts */}
      <div className="divide-y divide-zinc-800">
        {posts.map((post) => (
          <article
            key={post._id}
            className="p-4 hover:bg-zinc-950/50 transition-colors cursor-pointer"
          >
            {/* Post Header */}
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                {post.author?.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {(post.author?.name || post.author?.email || "User")?.charAt(0) || "?"}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* User Info */}
                <div className="flex items-center space-x-2 mb-2">
                  <p className="font-semibold text-white">{post.author?.name || post.author?.email || "User"}</p>
                  <p className="text-zinc-400">@{post.author?.username || post.author?.email?.split('@')[0] || "user"}</p>
                  <span className="text-zinc-400">·</span>
                  <p className="text-zinc-400 text-sm">
                    {new Date(post._creationTime).toLocaleDateString()}
                  </p>
                </div>

                {/* Caption */}
                {post.caption && (
                  <p className="text-white mb-3">{post.caption}</p>
                )}

                {/* Image */}
                <div 
                  className="rounded-2xl overflow-hidden mb-3 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full max-h-96 object-cover hover:opacity-95 transition-opacity"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between max-w-md">
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center space-x-2 text-zinc-400 hover:text-blue-400 transition-colors group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <span className="text-sm">{post.commentsCount || 0}</span>
                  </button>

                  <button
                    onClick={(e) => handleLike(e, post._id)}
                    className={`flex items-center space-x-2 transition-colors group ${
                      post.isLiked ? "text-red-500" : "text-zinc-400 hover:text-red-500"
                    }`}
                  >
                    <div className="p-2 rounded-full group-hover:bg-red-500/10">
                      <svg className="h-5 w-5" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <span className="text-sm">{post.likesCount || 0}</span>
                  </button>

                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center space-x-2 text-zinc-400 hover:text-green-400 transition-colors group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-green-500/10">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
            <svg className="h-12 w-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
          <p className="text-zinc-400">Be the first to share something amazing!</p>
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
