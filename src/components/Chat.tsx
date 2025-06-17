import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Send, ArrowLeft, Plus, MessageCircle } from "lucide-react";

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
    <div className="h-screen w-full flex flex-col lg:flex-row bg-zinc-900">
      {/* Mobile Navigation */}
      <div className={`lg:hidden ${selectedUserId ? 'hidden' : 'flex flex-col h-full'}`}>
        <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Messages</h1>
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Access Users - Mobile */}
        <div className="p-4 border-b border-zinc-800 overflow-x-auto">
          <h3 className="font-semibold mb-3 text-blue-400">Start new chat</h3>
          <div className="flex space-x-3">
            {users.slice(0, 6).map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserSelect(user._id)}
                className="flex-shrink-0 flex flex-col items-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">
                      {(user.name || "U").charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-center w-14 truncate">
                  {user.name?.split(" ")[0] || user.email?.split("@")[0] || "User"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List - Mobile */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-3 text-zinc-400">Recent chats</h3>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.otherUser._id}
                  onClick={() => handleUserSelect(conversation.otherUser._id)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-zinc-800 rounded-xl transition-colors">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {conversation.otherUser.avatarUrl ? (
                        <img
                          src={conversation.otherUser.avatarUrl}
                          alt={conversation.otherUser.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold">
                          {(conversation.otherUser.name || "U").charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conversation.otherUser.name || conversation.otherUser.email || "User"}
                    </p>
                    <p className="text-zinc-400 text-sm truncate">{conversation.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col h-full ${!selectedUserId && 'hidden lg:flex'}`}>
        {selectedUserId ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center space-x-3 p-4 bg-zinc-950 border-b border-zinc-800">
              <button
                onClick={() => setSelectedUserId(null)}
                className="lg:hidden p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {selectedUser?.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-semibold text-sm">
                      {(selectedUser?.name || "U").charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {selectedUser?.name || selectedUser?.email || "User"}
                  </p>
                  <p className="text-zinc-400 text-sm truncate">
                    @{selectedUser?.username || selectedUser?.email?.split("@")[0] || "user"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-zinc-400" />
                    </div>
                    <p className="text-zinc-400">
                      Start your conversation with {selectedUser?.name || "this user"}
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
                        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                          message.isFromCurrentUser
                            ? "bg-blue-500 text-white rounded-br-sm"
                            : "bg-zinc-800 text-white rounded-bl-sm"
                        }`}>
                        <p className="text-sm break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isFromCurrentUser ? "text-blue-100" : "text-zinc-400"
                          }`}>
                          {new Date(message._creationTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to Messages</h3>
              <p className="text-zinc-400 max-w-sm">
                Choose a conversation or start a new one to begin chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col w-80 border-r border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Quick Access Users - Desktop */}
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-semibold mb-3 text-blue-400">Start new chat</h3>
            <div className="space-y-2">
              {users.slice(0, 5).map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserSelect(user._id)}
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
                        {(user.name || "U").charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
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

          {/* Conversations List - Desktop */}
          <div className="p-4">
            <h3 className="font-semibold mb-3 text-zinc-400">Recent chats</h3>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.otherUser._id}
                  onClick={() => handleUserSelect(conversation.otherUser._id)}
                  className={`w-full flex items-center space-x-3 p-3 hover:bg-zinc-800 rounded-xl transition-colors ${
                    selectedUserId === conversation.otherUser._id ? "bg-zinc-800" : ""
                  }`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {conversation.otherUser.avatarUrl ? (
                        <img
                          src={conversation.otherUser.avatarUrl}
                          alt={conversation.otherUser.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold">
                          {(conversation.otherUser.name || "U").charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conversation.otherUser.name || conversation.otherUser.email || "User"}
                    </p>
                    <p className="text-zinc-400 text-sm truncate">{conversation.lastMessage}</p>
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
