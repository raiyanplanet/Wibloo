import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { useState } from "react";
import { Feed } from "./components/Feed";
import { Profile } from "./components/Profile";
import { Upload } from "./components/Upload";
import { Search } from "./components/Search";
import { MyPhotos } from "./components/MyPhotos";
import { Chat } from "./components/Chat";
import { Sidebar } from "./components/Sidebar";

export default function App() {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const user = useQuery(api.users.getCurrentUser);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality is handled by the searchQuery state
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Authenticated>
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar - Desktop: Left sidebar, Mobile: Top navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Main Content */}
          <main className="flex-1 lg:border-x border-zinc-800 flex flex-col min-h-0">
            {/* Top Search Bar - Hidden on mobile since search can be integrated into mobile nav */}
            <div className="hidden lg:block sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex-shrink-0">
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search SocialStream"
                      className="block w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-700 rounded-full text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg
                          className="h-5 w-5 text-zinc-400 hover:text-white transition-colors"
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
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Mobile Search Bar - Visible only on mobile */}
            <div className="lg:hidden max-md:hidden sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 p-4 flex-shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SocialStream"
                    className="block w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-700 rounded-full text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="h-5 w-5 text-zinc-400 hover:text-white transition-colors"
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
                  )}
                </div>
              </form>
            </div>

            {/* Content Area - This is the scrollable part */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full lg:max-w-2xl lg:mx-auto px-4 lg:px-0 pb-4">
                {searchQuery ? (
                  <Search query={searchQuery} />
                ) : (
                  <>
                    {activeTab === "feed" && <Feed />}
                    {activeTab === "upload" && <Upload />}
                    {activeTab === "photos" && <MyPhotos />}
                    {activeTab === "profile" && <Profile />}
                    {activeTab === "chat" && <Chat />}
                  </>
                )}
              </div>
            </div>
          </main>

          {/* Right Sidebar - Trending/Suggestions - Hidden on mobile/tablet */}
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SocialStream
                </span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400">Happening now</p>
              <p className="text-base md:text-lg text-zinc-500 mt-2">
                Join today.
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Toaster theme="dark" />
    </div>
  );
}
