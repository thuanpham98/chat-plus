import * as electron from "electron";
import * as path from "path";
import * as url from "url";

const app = electron.app;

function createWindow() {
  const win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  process.env.NODE_ENV === "development" && win.webContents.openDevTools();
  win
    .loadURL(
      url.format({
        pathname: path.resolve(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
        host: "localhost",
      }),
    )
    .then(() => {
      electron.session.defaultSession.webRequest.onBeforeSendHeaders(
        async (details, callback) => {
          const cookies = await win.webContents.session.cookies.get({
            name: "Authorization",
            url: "http://localhost",
          });

          if (cookies.length > 0) {
            details.requestHeaders[
              "Cookie"
            ] = `Authorization=${cookies[0].value}`;
            details.requestHeaders["Origin"] =
              process.env.CHAT_PLUS_HOST_ELECTRON;
          }
          callback({ cancel: false, requestHeaders: details.requestHeaders });
        },
      );
    });

  // electron.session.defaultSession.cookies.flushStore();

  electron.ipcMain.on(
    "[coockie][renderer][to][main]",
    async (event, data: any) => {
      if (data.type === "get") {
        const cookies = await win.webContents.session.cookies.get({
          name: data.key,
          url: "http://localhost",
        });

        if (cookies.length > 0) {
          // cookies[0].sameSite='strict'
          event.returnValue = cookies[0].value;
        } else {
          event.returnValue = "";
        }
        return;
      } else if (data.type === "set") {
        try {
          if ((data.value ?? "") === "") {
            await win.webContents.session.cookies.remove(
              "http://localhost",
              data.key,
            );
          } else {
            const cookie: Electron.CookiesSetDetails = {
              url: "http://localhost",
              name: data.key,
              value: data?.value ?? "",
              secure: false,
              sameSite: "strict",
              httpOnly: true,
            };
            await win.webContents.session.cookies.set(cookie);
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
  );
}

app?.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app?.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
