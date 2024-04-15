export function checkTypeImageFromArrayBuffer(data: ArrayBuffer): string {
  switch (true) {
    case data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff:
      return "jpeg";

    case data[0] === 0x89 &&
      data[1] === 0x50 &&
      data[2] === 0x4e &&
      data[3] === 0x47:
      return "png";
    case data[0] === 0x47 &&
      data[1] === 0x49 &&
      data[2] === 0x46 &&
      data[3] === 0x38:
      return "gif";
    case data[0] === 0x42 && data[1] === 0x4d:
      return "bmp";
    case data[0] === 0x49 &&
      data[1] === 0x49 &&
      data[2] === 0x2a &&
      data[3] === 0x00:
      return "tiff";
    case data[0] === 0x52 &&
      data[1] === 0x49 &&
      data[2] === 0x46 &&
      data[3] === 0x46:
      return "webp";
    case data[0] === 0x00 &&
      data[1] === 0x00 &&
      data[2] === 0x01 &&
      data[3] === 0x00:
      return "ico";
    case data[0] === 0x3c &&
      data[1] === 0x3f &&
      data[2] === 0x78 &&
      data[3] === 0x6d &&
      data[4] === 0x6c:
      return "svg";
    case data[0] === 0x00 &&
      data[1] === 0x00 &&
      data[2] === 0x00 &&
      data[3] === 0x18 &&
      data[4] === 0x66 &&
      data[4] === 0x74:
      return "heic";
    case data[0] === 0x41 &&
      data[1] === 0x56 &&
      data[2] === 0x49 &&
      data[3] === 0x46 &&
      data[4] === 0x4c &&
      data[4] === 0x49:
      return "avif";

    default:
      return "";
  }
}

