import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { SignOutButton } from "@/SignOutButton";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: any[];
  onFollowToggle: (userId: string) => void;
  currentUserId: string;
}

function FollowersModal({
  isOpen,
  onClose,
  title,
  users,
  onFollowToggle,
  currentUserId,
}: FollowersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-zinc-800">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors">
            <svg
              className="h-6 w-6"
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
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto">
          {users.length > 0 ? (
            <div className="p-4 space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {(user.name || user.email || "User")?.charAt(0) ||
                            "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {user.username || user.email?.split("@")[0] || "user"}
                      </p>
                      <p className="text-zinc-400 text-xs">
                        {user.name || user.email || "User"}
                      </p>
                    </div>
                  </div>

                  {user._id !== currentUserId && (
                    <button
                      onClick={() => onFollowToggle(user._id)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        user.isFollowing
                          ? "bg-zinc-700 text-white hover:bg-zinc-600"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}>
                      {user.isFollowing ? "Following" : "Follow"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-zinc-400 text-sm">No users to show</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const user = useQuery(api.users.getCurrentUser);
  const posts = useQuery(api.posts.getMyPosts) || [];
  const suggestedUsers = useQuery(api.users.getSuggestedUsers) || [];
  const followers =
    useQuery(
      api.follows.getFollowers,
      user?._id ? { userId: user._id } : "skip"
    ) || [];
  const following =
    useQuery(
      api.follows.getFollowing,
      user?._id ? { userId: user._id } : "skip"
    ) || [];
  const toggleFollow = useMutation(api.follows.toggleFollow);
  const updateProfile = useMutation(api.users.updateProfile);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    dateOfBirth: "",
    website: "",
    location: "",
  });

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth || "",
        website: user.website || "",
        location: user.location || "",
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleFollow = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    try {
      await toggleFollow({ userId: userId as any });
      toast.success("Follow status updated!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  const handleFollowToggle = async (userId: string) => {
    try {
      await toggleFollow({ userId: userId as any });
      toast.success("Follow status updated!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
      count: posts.length,
    },
    {
      id: "saved",
      label: "Saved",
      icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
      count: 0,
    },
    {
      id: "tagged",
      label: "Tagged",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
      count: 0,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {user.username || user.email?.split("@")[0] || "Profile"}
          </h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl sm:text-4xl font-bold text-white">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (user.name || user.email || "User")?.charAt(0) || "?"
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Full Name"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    placeholder="Username"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  placeholder="Bio"
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateOfBirth: e.target.value })
                    }
                    placeholder="Date of Birth"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                    placeholder="Website"
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  placeholder="Location"
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-zinc-600 text-white rounded-lg hover:bg-zinc-800 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Username and Edit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h1 className="text-xl sm:text-2xl font-light text-white mb-2 sm:mb-0">
                    {user.username || user.email?.split("@")[0] || "user"}
                  </h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-1.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium">
                      Edit profile
                    </button>
                    <button className="px-4 py-1.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium">
                      Share profile
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex space-x-6 sm:space-x-8 mb-4">
                  <div className="text-center sm:text-left">
                    <span className="font-semibold text-white">
                      {posts.length}
                    </span>
                    <span className="text-zinc-400 ml-1 text-sm">posts</span>
                  </div>
                  <button
                    onClick={() => setFollowersModalOpen(true)}
                    className="text-center sm:text-left hover:text-zinc-300 transition-colors">
                    <span className="font-semibold text-white">
                      {followers.length}
                    </span>
                    <span className="text-zinc-400 ml-1 text-sm">
                      followers
                    </span>
                  </button>
                  <button
                    onClick={() => setFollowingModalOpen(true)}
                    className="text-center sm:text-left hover:text-zinc-300 transition-colors">
                    <span className="font-semibold text-white">
                      {following.length}
                    </span>
                    <span className="text-zinc-400 ml-1 text-sm">
                      following
                    </span>
                  </button>
                </div>

                {/* Bio and Details */}
                <div className="space-y-2">
                  <h2 className="font-semibold text-white">
                    {user.name || user.email || "User"}
                  </h2>
                  {user.bio && (
                    <p className="text-white text-sm leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline">
                      {user.website}
                    </a>
                  )}
                  {user.location && (
                    <p className="text-zinc-400 text-sm flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {user.location}
                    </p>
                  )}
                  {user.dateOfBirth && (
                    <p className="text-zinc-400 text-sm flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Born {new Date(user.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Users */}
      {suggestedUsers.length > 0 && !isEditing && (
        <div className="border-t border-zinc-800 p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
            Discover people
          </h3>
          <div className="flex overflow-x-auto space-x-4 pb-2">
            {suggestedUsers.map((suggestedUser) => (
              <div
                key={suggestedUser._id}
                className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-2 mx-auto">
                  {suggestedUser.avatarUrl ? (
                    <img
                      src={suggestedUser.avatarUrl}
                      alt={suggestedUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {(
                        suggestedUser.name ||
                        suggestedUser.email ||
                        "User"
                      )?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <p className="text-white text-xs font-medium mb-1 max-w-[80px] truncate">
                  {suggestedUser.username ||
                    suggestedUser.email?.split("@")[0] ||
                    "user"}
                </p>
                <button
                  onClick={(e) => handleFollow(e, suggestedUser._id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-t border-zinc-800">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-medium uppercase tracking-wide transition-colors ${
                activeTab === tab.id
                  ? "text-white border-t-2 border-white"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={tab.icon}
                />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && <span className="text-xs">({tab.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === "posts" && (
          <div>
            {posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {posts.map((post) => (
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
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span className="font-semibold">
                                {post.likesCount || 0}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span className="font-semibold">
                                {post.commentsCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-zinc-600 rounded-full flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-zinc-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-light text-white mb-2">
                  Share Photos
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  When you share photos, they will appear on your profile.
                </p>
                <button className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors">
                  Share your first photo
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-zinc-600 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-zinc-600"
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
            </div>
            <h3 className="text-xl font-light text-white mb-2">Save</h3>
            <p className="text-zinc-400 text-sm">
              Save photos and videos that you want to see again.
            </p>
          </div>
        )}

        {activeTab === "tagged" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-zinc-600 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-zinc-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-light text-white mb-2">
              Photos of you
            </h3>
            <p className="text-zinc-400 text-sm">
              When people tag you in photos, they'll appear here.
            </p>
          </div>
        )}
      </div>

      {/* Followers Modal */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title="Followers"
        users={followers}
        onFollowToggle={handleFollowToggle}
        currentUserId={user._id}
      />

      {/* Following Modal */}
      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title="Following"
        users={following}
        onFollowToggle={handleFollowToggle}
        currentUserId={user._id}
      />
    </div>
  );
}
