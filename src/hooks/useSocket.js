import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

let socketInstance = null;

export function useSocket(userId, { onMessage, onStatus, onPinged } = {}) {
  const socket = useRef(null);

  useEffect(() => {
    if (!userId) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, { transports: ["websocket"] });
    }
    socket.current = socketInstance;

    socket.current.emit("join", userId);

    if (onMessage) socket.current.on("newMessage", onMessage);
    if (onStatus)  socket.current.on("userStatus",  onStatus);
    if (onPinged)  socket.current.on("pinged",       onPinged);

    // Idle detection
    let idleTimer;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => socket.current?.emit("idle", userId), 3 * 60 * 1000);
    };
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown",   resetIdle);
    resetIdle();

    return () => {
      if (onMessage) socket.current?.off("newMessage", onMessage);
      if (onStatus)  socket.current?.off("userStatus",  onStatus);
      if (onPinged)  socket.current?.off("pinged",       onPinged);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown",   resetIdle);
    };
  }, [userId]);

  const pingUser = (targetId, adminName) => {
    socket.current?.emit("ping_user", { targetId, adminName });
  };

  return { socket: socket.current, pingUser };
}