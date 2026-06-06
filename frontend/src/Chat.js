import { useEffect, useState, useRef } from "react";
import { socket } from "./socket";

function Chat({ userId, username, roomId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);

  useEffect(() => {
    socket.emit("join_room", { roomId });

    socket.on("room_messages", (data) => {
      setMessages(data.reverse());
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing_start", (user) => {
      setTypingUser(user);
    });

    socket.on("typing_stop", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("room_messages");
      socket.off("receive_message");
      socket.off("online_users");
      socket.off("typing_start");
      socket.off("typing_stop");
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      roomId,
      content: message,
    });

    socket.emit("typing_stop", { roomId });
    isTyping.current = false;

    setMessage("");
  };

  const handleTyping = () => {
    if (!isTyping.current) {
      socket.emit("typing_start", { roomId });
      isTyping.current = true;
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit("typing_stop", { roomId });
      isTyping.current = false;
    }, 1500);
  };

  // 🎨 avatar color
  const getColor = (id) => {
    const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h3>🟢 Online Users</h3>
        {onlineUsers.map((user, i) => (
          <div key={i} style={styles.user}>
            {user}
          </div>
        ))}
      </div>

      {/* Chat */}
      <div style={styles.chat}>
        <div style={styles.messages}>
          {messages.map((msg, i) => {
            const isMe = msg.senderId === userId;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  marginBottom: 10,
                }}
              >
                {/* LEFT */}
                {!isMe && (
                  <div style={styles.avatar(getColor(msg.senderId))}>
                    {msg.senderName?.[0]?.toUpperCase()}
                  </div>
                )}

                <div
                  style={{
                    ...styles.message,
                    background: isMe ? "#3b82f6" : "#334155",
                  }}
                >
                  {!isMe && (
                    <div style={styles.sender}>
                      {msg.senderName || "User"}
                    </div>
                  )}

                  <div>{msg.content}</div>

                  <div style={styles.time}>
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString()
                      : ""}
                  </div>
                </div>

                {/* RIGHT */}
                {isMe && (
                  <div style={styles.avatar(getColor(userId))}>
                    {username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {/* typing */}
          {typingUser && typingUser !== username && (
            <div style={{ fontSize: 12, padding: 10 }}>
              ✍️ {typingUser} is typing...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={styles.inputBox}>
          <input
            style={styles.input}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type message..."
          />
          <button style={styles.button} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0f172a",
    color: "white",
  },
  sidebar: {
    width: 220,
    background: "#1e293b",
    padding: 15,
  },
  user: {
    padding: 5,
  },
  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 15,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "60%",
  },
  sender: {
    fontSize: 12,
    opacity: 0.7,
  },
  time: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 5,
    textAlign: "right",
  },
  avatar: (color) => ({
    width: 35,
    height: 35,
    borderRadius: "50%",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 8px",
    fontWeight: "bold",
  }),
  inputBox: {
    display: "flex",
    padding: 10,
    background: "#1e293b",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "none",
  },
  button: {
    marginLeft: 10,
    padding: 10,
    background: "#3b82f6",
    border: "none",
    color: "white",
    borderRadius: 6,
  },
};