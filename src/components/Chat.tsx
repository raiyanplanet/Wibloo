import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function Chat() {
  const conversations = useQuery(api.messages.getConversations) || [];
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const messages =
    useQuery(
      api.messages.getMessages,
      selectedUserId ? { otherUserId: selectedUserId as any } : "skip"
    ) || [];

  const selectedUser = useQuery(
    api.users.getUserById,
    selectedUserId ? { userId: selectedUserId as any } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const users = useQuery(api.users.getAllUsers) || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      await sendMessage({
        receiverId: selectedUserId as any,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserList(false);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Header with User Selection */}
      <div className="lg:hidden flex flex-col h-full overflow-hidden">
        {/* Selected User Header */}
        {selectedUserId && (
          <div className="flex-shrink-0 bg-zinc-950 border-b border-zinc-800 p-4 z-10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-3 flex-1 ml-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {selectedUser?.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-sm">
                      {(selectedUser?.name || "U")?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {selectedUser?.name || selectedUser?.email || "User"}
                  </p>
                  <p className="text-zinc-400 text-sm truncate">
                    @
                    {selectedUser?.username ||
                      selectedUser?.email?.split("@")[0] ||
                      "user"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User List Toggle */}
        {!selectedUserId && (
          <div className="flex-shrink-0 bg-zinc-950 border-b border-zinc-800 p-4 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Messages</h1>
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Mobile User List */}
        {!selectedUserId && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Quick Access Users */}
            <div className="flex-shrink-0 p-4 border-b border-zinc-800">
              <h3 className="font-semibold mb-3 text-blue-400">
                Start new chat
              </h3>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {users.slice(0, 8).map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleUserSelect(user._id)}
                    className="flex-shrink-0 flex flex-col items-center space-y-2 p-3 hover:bg-zinc-800 rounded-xl transition-colors">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold">
                          {(user.name || user.email || "User")?.charAt(0) ||
                            "?"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center max-w-[60px] truncate">
                      {user.name?.split(" ")[0] ||
                        user.email?.split("@")[0] ||
                        "User"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Existing Conversations */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-3 text-zinc-400">
                  Recent chats
                </h3>
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.otherUser._id}
                      onClick={() =>
                        handleUserSelect(conversation.otherUser._id)
                      }
                      className="w-full flex items-center space-x-4 p-3 hover:bg-zinc-800 rounded-xl transition-colors">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center relative">
                        {conversation.otherUser.avatarUrl ? (
                          <img
                            src={conversation.otherUser.avatarUrl}
                            alt={conversation.otherUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold">
                            {(
                              conversation.otherUser.name ||
                              conversation.otherUser.email ||
                              "User"
                            )?.charAt(0) || "?"}
                          </span>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">
                          {conversation.otherUser.name ||
                            conversation.otherUser.email ||
                            "User"}
                        </p>
                        <p className="text-zinc-400 text-sm truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      <div className="text-zinc-500 text-xs">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedUserId ? (
          <>
            {/* Desktop Chat Header */}
            <div className="hidden lg:block flex-shrink-0 bg-zinc-950 border-b border-zinc-800 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {selectedUser?.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-sm">
                      {(selectedUser?.name || "U")?.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {selectedUser?.name || selectedUser?.email || "User"}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    @
                    {selectedUser?.username ||
                      selectedUser?.email?.split("@")[0] ||
                      "user"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-zinc-900 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}>
              <div className="p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                        <svg
                          className="h-8 w-8 text-zinc-400"
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
                      </div>
                      <p className="text-zinc-400">
                        Start your conversation with{" "}
                        {selectedUser?.name || "this user"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                            message.isFromCurrentUser
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                          }`}>
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.isFromCurrentUser
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}>
                            {new Date(message._creationTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="flex-shrink-0 bg-zinc-950 border-t border-zinc-800 p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 flex-shrink-0">
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-900">
            <div className="text-center px-4">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                <svg
                  className="h-12 w-12 text-white"
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
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Welcome to Messages
              </h3>
              <p className="text-zinc-400 max-w-sm">
                Choose from your existing conversations, or start a new one to
                begin chatting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-80 border-r border-zinc-800 h-full overflow-hidden">
        <div className="flex-shrink-0 bg-zinc-950 border-b border-zinc-800 p-4">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Start New Chat */}
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold mb-3 text-blue-400">Start new chat</h3>
            <div className="space-y-2">
              {users.slice(0, 5).map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUserId(user._id)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-zinc-800 rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {(user.name || user.email || "User")?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">
                      {user.name || user.email || "User"}
                    </p>
                    <p className="text-zinc-400 text-sm truncate">
                      @{user.username || user.email?.split("@")[0] || "user"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Conversations */}
          <div className="p-4">
            <h3 className="font-semibold mb-3 text-zinc-400">Recent chats</h3>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.otherUser._id}
                  onClick={() => setSelectedUserId(conversation.otherUser._id)}
                  className={`w-full flex items-center space-x-3 p-3 hover:bg-zinc-800 rounded-xl transition-colors ${
                    selectedUserId === conversation.otherUser._id
                      ? "bg-zinc-800"
                      : ""
                  }`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center relative">
                    {conversation.otherUser.avatarUrl ? (
                      <img
                        src={conversation.otherUser.avatarUrl}
                        alt={conversation.otherUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-semibold">
                        {(
                          conversation.otherUser.name ||
                          conversation.otherUser.email ||
                          "User"
                        )?.charAt(0) || "?"}
                      </span>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">
                      {conversation.otherUser.name ||
                        conversation.otherUser.email ||
                        "User"}
                    </p>
                    <p className="text-zinc-400 text-sm truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
