// peersocket_payload.mjs

export class PeerSocketPayload {
  constructor(type, content, senderId) {
    this.type = type;
    this.content = content;
    this.senderId = senderId;
  }

  toJSON() {
    return JSON.stringify({
      type: this.type,
      content: this.content,
      senderId: this.senderId,
    });
  }

  static fromJSON(json) {
    const data = JSON.parse(json);
    return new PeerSocketPayload(data.type, data.content, data.senderId);
  }
}
