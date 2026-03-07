import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

// One socket per app, listeners fan-out per event
let _socket = null;
const _listeners = {};

function getSocket() {
  if (!_socket || _socket.disconnected) {
    _socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return _socket;
}

function addListener(event, handler) {
  if (!_listeners[event]) {
    _listeners[event] = new Set();
    getSocket().on(event, (...args) => {
      _listeners[event]?.forEach((h) => h(...args));
    });
  }
  _listeners[event].add(handler);
}

function removeListener(event, handler) {
  _listeners[event]?.delete(handler);
}

export function useSocket(userId, { onMessage, onStatus, onPinged } = {}) {
  const socketRef    = useRef(null);
  const idleTimer    = useRef(null);
  const onMessageRef = useRef(onMessage);
  const onStatusRef  = useRef(onStatus);
  const onPingedRef  = useRef(onPinged);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onStatusRef.current  = onStatus;  }, [onStatus]);
  useEffect(() => { onPingedRef.current  = onPinged;  }, [onPinged]);

  const msgHandler    = useCallback((msg)  => onMessageRef.current?.(msg),  []);
  const statusHandler = useCallback((data) => onStatusRef.current?.(data),  []);
  const pingHandler   = useCallback((data) => onPingedRef.current?.(data),  []);

  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("join", userId);

    if (onMessage) addListener("newMessage", msgHandler);
    if (onStatus)  addListener("userStatus",  statusHandler);
    if (onPinged)  addListener("pinged",       pingHandler);

    const resetIdle = () => {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => socket.emit("idle", userId), 3 * 60 * 1000);
    };
    window.addEventListener("mousemove", resetIdle);
    window.addEventListener("keydown",   resetIdle);
    resetIdle();

    return () => {
      if (onMessage) removeListener("newMessage", msgHandler);
      if (onStatus)  removeListener("userStatus",  statusHandler);
      if (onPinged)  removeListener("pinged",       pingHandler);
      clearTimeout(idleTimer.current);
      window.removeEventListener("mousemove", resetIdle);
      window.removeEventListener("keydown",   resetIdle);
    };
  }, [userId]); // eslint-disable-line

  const pingUser = useCallback((targetId, adminName) => {
    socketRef.current?.emit("ping_user", { targetId, adminName });
  }, []);

  return { pingUser };
}