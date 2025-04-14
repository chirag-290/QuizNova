import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io("https://quiznova.onrender.com", {
      transports: ["websocket"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  return socket;
};

export const connectSocket = (token) => {
  if (!socket) {
    initSocket();
  }

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinExamRoom = (examId) => {
  if (socket && socket.connected) {
    socket.emit("join_exam", examId);
  }
};

export const listenForTimerUpdates = (callback) => {
  if (socket) {
    socket.on("timer_update", callback);
  }
};

export const emitTabSwitch = (examId, userId) => {
  if (socket && socket.connected) {
    socket.emit("tab_switch", { examId, userId });
  }
};

export const listenForTabSwitches = (callback) => {
  if (socket) {
    socket.on("student_tab_switch", callback);
  }
};

export const removeTimerListener = () => {
  if (socket) {
    socket.off("timer_update");
  }
};

export const removeTabSwitchListener = () => {
  if (socket) {
    socket.off("student_tab_switch");
  }
};

export default {
  initSocket,
  connectSocket,
  disconnectSocket,
  joinExamRoom,
  listenForTimerUpdates,
  emitTabSwitch,
  listenForTabSwitches,
  removeTimerListener,
  removeTabSwitchListener,
};
