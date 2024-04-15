self.addEventListener("message", async function (event) {
  if (event.data.type === "processing") {
    const ret = await this.fetch(event.data.value);
    const blob = await ret.blob();

    const imageBitmap = await createImageBitmap(blob);
    const ratioReduce = Math.sqrt(
      (imageBitmap.width * imageBitmap.height) / 300000,
    ); // lấy tiêu chuẩn ảnh preview là 300Kb thôi

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
    const blobRet = await offscreen.convertToBlob();

    // const arrayBufRet = await blobRet.arrayBuffer();
    // let binary = "";
    // const bytes = new Uint8Array(arrayBufRet);
    // const len = bytes.byteLength;
    // for (let i = 0; i < len; i++) {
    //   binary += String.fromCharCode(bytes[i]);
    // }
    // const dataRet = this.btoa(binary);
    imageBitmap.close();
    this.postMessage({ code: 0, value: blobRet });
    // close();
  }
});

