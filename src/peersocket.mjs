import { WebSocketServer, WebSocket } from "ws";
import Redis from "ioredis";
import { PeerSocketPayload } from "./peersocket-payload.mjs";

export class PeerSocket {
  constructor(server, redisUrl) {
    this.wss = new WebSocketServer({ server });
    this.redis = new Redis(redisUrl); // Redis client to sync inactive peers
    this.activePeers = new Map(); // Map of currently connected peers
    this.inactivePeers = new Map(); // Map of offline peers

    this.setupServer();
    this.syncInactivePeers(); // Sync with Redis every 3 seconds
  }

  setupServer() {
    this.wss.on("connection", (ws) => {
      const peerId = this.generatePeerId();
      this.activePeers.set(peerId, ws);
      console.log(`Peer connected: ${peerId}`);

      // Handle incoming messages from clients
      ws.on("message", (message) => {
        console.log("Received message:", message);
        const payload = PeerSocketPayload.fromJSON(message);

        // Broadcast message to all connected peers
        this.broadcastMessage(peerId, payload);
      });

      // Handle disconnection
      ws.on("close", () => {
        console.log(`Peer disconnected: ${peerId}`);
        this.moveToInactive(peerId);
      });
    });
  }

  // Generate a unique peer ID for each connected peer
  generatePeerId() {
    return `peer-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Broadcast a message to all connected clients
  broadcastMessage(senderId, payload) {
    this.activePeers.forEach((peerWs, peerId) => {
      if (peerWs.readyState === WebSocket.OPEN) {
        // Using WebSocket from the 'ws' package
        console.log(`Broadcasting message to peer ${peerId}`);
        peerWs.send(payload.toJSON());
      }
    });
  }

  // Move a peer to the inactive map and sync with Redis
  moveToInactive(peerId) {
    const peerWs = this.activePeers.get(peerId);
    if (peerWs) {
      this.activePeers.delete(peerId);
      this.inactivePeers.set(peerId, Date.now());
    }
  }

  // Sync inactive peers with Redis
  async syncInactivePeers() {
    setInterval(async () => {
      // Sync the local inactivePeers map to Redis
      for (let [peerId, timestamp] of this.inactivePeers.entries()) {
        await this.redis.set(peerId, timestamp);
      }

      // Retrieve inactive peers from Redis and sync to the local map
      const redisPeers = await this.redis.keys("*");
      for (let peerId of redisPeers) {
        if (!this.inactivePeers.has(peerId)) {
          const timestamp = await this.redis.get(peerId);
          this.inactivePeers.set(peerId, Number(timestamp));
        }
      }
    }, 3000); // Sync every 3 seconds
  }
}
