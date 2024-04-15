let socket: WebSocket | null = null;

function initWebSocket(url: string): WebSocket {
  return new WebSocket(url);
}

self.addEventListener("message", function (event) {
  if (event.data.type === "start") {
    socket = initWebSocket(event.data.data);
    socket.binaryType = "arraybuffer";
    socket.onmessage = (message) => {
      const rawData = new Uint8Array(message.data as ArrayBuffer);
      rawData.byteLength &&
        postMessage(rawData, { transfer: [rawData.buffer] });
    };
    socket.onerror = (e) => {
      console.error(e);
    };
    socket.onclose = (e) => {
      console.error("closing", e);
    };
  } else if (event.data.type === "end") {
    socket?.close();
    socket = null;
  }
});

