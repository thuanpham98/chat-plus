export class Environment {
  static readonly envType = process.env.CHAT_PLUS_ENVIORNMENT_TYPE;
  static readonly hostApi = process.env.CHAT_PLUS_HOST_API;
  static readonly hostApp = process.env.CHAT_PLUS_HOST_APP;
  static readonly urlPublicImage = process.env.CHAT_PLUS_URL_PUBLIC_IMAGE;
  static readonly hostWsMessage = process.env.CHAT_PLUS_HOST_WS_MESSAGE;
}
