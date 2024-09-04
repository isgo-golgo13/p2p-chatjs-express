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
  const chatMessages = document.getElementById("chat-messages");
  const sendButton = document.getElementById("send-button");
  const disconnectButton = document.getElementById("disconnect-button");
  const messageInput = document.getElementById("message");

  // Generate a unique peer ID for this tab (to simulate multiple peers)
  const peerId = `peer-${Math.random().toString(36).substr(2, 9)}`;

  chat.onopen = () => {
    console.log("WebSocket connection opened");
  };

  chat.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  chat.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    if (payload.senderId !== peerId) {
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour12: false,
      });
      addMessageToTable(payload.senderId, payload.content, timestamp, "Active");
    }
  };

  sendButton.addEventListener("click", () => {
    const message = messageInput.value;
    if (message) {
      const payload = new PeerSocketPayload("message", message, peerId);
      chat.send(payload.toJSON());

      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour12: false,
      });
      addMessageToTable(peerId, message, timestamp, "Active");

      messageInput.value = ""; // Clear input
    }
  });

  // Disconnect button logic
  disconnectButton.addEventListener("click", () => {
    chat.close(); // Close the WebSocket connection
    console.log("Peer disconnected");
    updateLastMessageStatus(peerId, "Inactive");
  });

  // Add message to the table
  function addMessageToTable(name, message, timestamp, status) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = name;

    const messageCell = document.createElement("td");
    messageCell.textContent = message;

    const timestampCell = document.createElement("td");
    timestampCell.textContent = timestamp;

    const statusCell = document.createElement("td");
    statusCell.classList.add("status");
    statusCell.textContent = status;

    row.appendChild(nameCell);
    row.appendChild(messageCell);
    row.appendChild(timestampCell);
    row.appendChild(statusCell);

    chatMessages.appendChild(row);

    const chatOutputContainer = document.getElementById(
      "chat-output-container",
    );
    chatOutputContainer.scrollTop = chatOutputContainer.scrollHeight;
  }

  // Update the last message status to "Inactive" when a peer disconnects
  function updateLastMessageStatus(peerId, status) {
    const rows = chatMessages.querySelectorAll("tr");
    for (let i = rows.length - 1; i >= 0; i--) {
      const nameCell = rows[i].querySelector("td:first-child");
      const statusCell = rows[i].querySelector(".status");
      if (nameCell.textContent === peerId) {
        statusCell.textContent = status;
        break; // Update only the last message from this peer
      }
    }
  }
}

initChat();
