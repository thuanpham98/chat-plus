import {
  MessageProcessingImageEventType,
  MessageProcessingImageRequest,
  MessageProcessingImageResponse,
} from "./message-processing-image";

let isStart = false;
let portMessage: MessagePort;

self.addEventListener("message", async function (event) {
  if (!isStart) {
    const data = new Uint8Array(event.data as ArrayBuffer);
    if (!data || data.byteLength === 0) {
      return;
    }
    try {
      const message = MessageProcessingImageRequest.fromBinary(data, {
        readUnknownField: false,
      });
      if (
        message.eventType === MessageProcessingImageEventType.INIT &&
        message.path === "start-module-processing-image"
      ) {
        isStart = true;
        portMessage = event.ports[0];
        portMessage.onmessage = handlerMessageFromPort;
      }
    } catch (error) {
      console.error(error);
      return;
    }
    return;
  }

  // if (event.data.type === "processing") {
  //   const ret = await this.fetch(event.data.value);
  //   const blob = await ret.blob();

  //   const imageBitmap = await createImageBitmap(blob);
  //   const ratioReduce = Math.sqrt(
  //     (imageBitmap.width * imageBitmap.height) / 300000,
  //   ); // lấy tiêu chuẩn ảnh preview là 300Kb thôi

  //   const offscreen = new OffscreenCanvas(
  //     imageBitmap.width / (ratioReduce <= 1 ? 1 : ratioReduce),
  //     imageBitmap.height / (ratioReduce <= 1 ? 1 : ratioReduce),
  //   );
  //   const offscreenCtx = offscreen.getContext("2d");
  //   offscreenCtx.drawImage(
  //     imageBitmap,
  //     0,
  //     0,
  //     offscreen.width,
  //     offscreen.height,
  //   );
  //   const blobRet = await offscreen.convertToBlob();

  //   // const arrayBufRet = await blobRet.arrayBuffer();
  //   // let binary = "";
  //   // const bytes = new Uint8Array(arrayBufRet);
  //   // const len = bytes.byteLength;
  //   // for (let i = 0; i < len; i++) {
  //   //   binary += String.fromCharCode(bytes[i]);
  //   // }
  //   // const dataRet = this.btoa(binary);
  //   imageBitmap.close();
  //   this.postMessage({ code: 0, value: blobRet });
  // }
});

async function handlerMessageFromPort(event: MessageEvent) {
  const data = new Uint8Array(event.data as ArrayBuffer);
  if (!data || data.byteLength === 0) {
    return;
  }
  const message = MessageProcessingImageRequest.fromBinary(data, {
    readUnknownField: false,
  });
  if (message.eventType === MessageProcessingImageEventType.START) {
    let imageBitmap: ImageBitmap;
    try {
      const ret = await self.fetch(message.path);
      const blob = await ret.blob();
      imageBitmap = await createImageBitmap(blob);
      const ratioReduce = Math.sqrt(
        (imageBitmap.width * imageBitmap.height) / 300000,
      );

      const offscreen = new OffscreenCanvas(
        imageBitmap.width / (ratioReduce <= 1 ? 1 : ratioReduce),
        imageBitmap.height / (ratioReduce <= 1 ? 1 : ratioReduce),
      );
      const offscreenCtx = offscreen.getContext("2d");
      offscreenCtx.drawImage(
        imageBitmap,
        0,
        0,
        offscreen.width,
        offscreen.height,
      );
      const blobImg = await offscreen.convertToBlob();
      const dataImg = await blobImg.arrayBuffer();
      const resp = MessageProcessingImageResponse.toBinary({
        data: new Uint8Array(dataImg as ArrayBuffer),
        eventType: MessageProcessingImageEventType.END,
        typeImage: blobImg.type,
      });
      portMessage.postMessage(resp, [resp.buffer]);
    } catch (error) {
      console.error(error);
      const resp = MessageProcessingImageResponse.toBinary({
        data: new Uint8Array([]),
        eventType: MessageProcessingImageEventType.ERROR,
        typeImage: "",
      });
      portMessage.postMessage(resp, [resp.buffer]);
    } finally {
      imageBitmap.close();
    }
  }
}
