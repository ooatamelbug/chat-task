import { useState } from "react";
import Chat from "./Chat";
import { socket } from "./socket";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const handleAuth = async () => {
    if (!username || !password) {
      return alert("Enter username & password");
    }

    const url = isLogin
      ? "http://localhost:3001/auth/login"
      : "http://localhost:3001/auth/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      socket.auth = { token: data.token };
      socket.connect();

      setUser(data);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>{isLogin ? "Login 🔐" : "Register 📝"}</h2>

          <input
            style={styles.input}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleAuth}>
            {isLogin ? "Login" : "Register"}
          </button>

          <p
            style={styles.switch}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have account? Register"
              : "Already have account? Login"}
          </p>
        </div>
      </div>
    );
  }

  return <RoomSelect user={user} />;
}

function RoomSelect({ user }) {
  const [roomId, setRoomId] = useState("");

  if (!roomId) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Enter Room 🚪</h2>

          <input
            style={styles.input}
            placeholder="Room ID"
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <Chat
      userId={user.userId}
      username={user.username}
      roomId={roomId}
    />
  );
}

export default App;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
  },
  card: {
    background: "#1e293b",
    padding: 30,
    borderRadius: 12,
    width: 320,
    color: "white",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    border: "none",
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#3b82f6",
    border: "none",
    borderRadius: 6,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  switch: {
    marginTop: 15,
    fontSize: 14,
    cursor: "pointer",
    color: "#94a3b8",
  },
};