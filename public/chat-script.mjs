// Import the PeerSocketPayload class
import { PeerSocketPayload } from "./peersocket-payload.mjs";

async function fetchEnv() {
  const response = await fetch("/env");
  const env = await response.json();
  return env.wsPort;
}

async function initChat() {
  const wsPort = await fetchEnv();
  const WS_URL = `ws://localhost:${wsPort}`;

  const chat = new WebSocket(WS_URL);

  const chatWindow = document.getElementById("chat-window");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  // Log when the connection is established
  chat.onopen = () => {
    console.log("WebSocket connection opened");
  };

  // Log received messages
  chat.onmessage = (event) => {
    console.log("Received message:", event.data);

    // Update the chat window with the received message
    const messageElement = document.createElement("div");
    const payload = JSON.parse(event.data); // Assuming the message is JSON
    messageElement.textContent = `${payload.senderId}: ${payload.content}`;
    chatWindow.appendChild(messageElement);
  };

  // Log WebSocket errors
  chat.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  // Log when the connection is closed
  chat.onclose = () => {
    console.log("WebSocket connection closed");
  };

  // Send message on button click
  sendButton.addEventListener("click", () => {
    const message = messageInput.value;

    if (message) {
      const payload = new PeerSocketPayload("message", message, "client-xyz"); // You can replace 'client-xyz' with a dynamic ID
      console.log("Sending message:", payload); // Log message before sending
      chat.send(payload.toJSON());

      messageInput.value = ""; // Clear the message input field after sending
    } else {
      console.warn("Message input is empty");
    }
  });
}

initChat();
