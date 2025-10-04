// src/composables/useSocket.js
import { io } from "socket.io-client";
import { ref } from "vue";

const socket = io(import.meta.env.VITE_SOCKET_URL); // single shared instance

const isConnected = ref(socket.connected);

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    isConnected.value = true;
});

socket.on("disconnect", () => {
    console.log("Socket disconnected");
    isConnected.value = false;
});

export function useSocket() {
    return { socket, isConnected };
}
