import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

interface SearchProps {
  query: string;
}

export function Search({ query }: SearchProps) {
  const users = useQuery(api.users.searchUsers, { query }) || [];
  const posts = useQuery(api.posts.searchPosts, { query }) || [];
  const toggleFollow = useMutation(api.follows.toggleFollow);
  const [activeTab, setActiveTab] = useState("all");

  const handleFollow = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    try {
      await toggleFollow({ userId: userId as any });
      toast.success("Follow status updated!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to update follow status");
    }
  };

  const tabs = [
    { id: "all", label: "All", count: users.length + posts.length },
    { id: "accounts", label: "Accounts", count: users.length },
    { id: "posts", label: "Posts", count: posts.length },
  ];

  const filteredUsers = activeTab === "all" || activeTab === "accounts" ? users : [];
  const filteredPosts = activeTab === "all" || activeTab === "posts" ? posts : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold mb-2">Search results</h1>
        <p className="text-zinc-400 text-sm">"{query}"</p>
      </div>

      {/* Search Tabs */}
      <div className="border-b border-zinc-800">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
            >
              {tab.label} {tab.count > 0 && <span className="ml-1 text-xs">({tab.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4">
        {/* Users Section */}
        {filteredUsers.length > 0 && (
          <div className="mb-8">
            {(activeTab === "all" || activeTab === "accounts") && (
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeTab === "all" ? "Accounts" : "People"}
              </h3>
            )}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-zinc-900/50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-white">
                          {(user.name || user.email || "User")?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-white">{user.username || user.email?.split('@')[0] || "user"}</p>
                        {user.isVerified && (
                          <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm">{user.name || user.email || "User"}</p>
                      {user.bio && (
                        <p className="text-zinc-300 text-sm mt-1 line-clamp-1">{user.bio}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-1 text-xs text-zinc-400">
                        <span>{user.followersCount || 0} followers</span>
                        <span>{user.postsCount || 0} posts</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => handleFollow(e, user._id)}
                    className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {filteredPosts.length > 0 && (
          <div>
            {(activeTab === "all" || activeTab === "posts") && (
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeTab === "all" ? "Posts" : "All Posts"}
              </h3>
            )}
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {filteredPosts.map((post) => (
                <div key={post._id} className="aspect-square relative group">
                  {post.imageUrl && (
                    <>
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center space-x-4 text-white">
                          <div className="flex items-center space-x-1">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm font-semibold">{post.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-sm font-semibold">{post.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                      {post.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs truncate">{post.caption}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {users.length === 0 && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
              <svg className="h-12 w-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
            <p className="text-zinc-400">Try searching for something else</p>
          </div>
        )}

        {/* Recent Searches */}
        {query.length === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Recent</h3>
            <div className="text-center py-8">
              <p className="text-zinc-400">No recent searches.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
