import io from "socket.io-client";
export const socket = io("http://192.168.1.110:5001", {
  autoConnect: true,
});
