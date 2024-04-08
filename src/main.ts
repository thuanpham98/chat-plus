import * as electron from "electron";
import * as path from "path";
import * as url from "url";

const app = electron.app;

console.log(process.env.ENVIORNMENT_TYPE);

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

  win.webContents.openDevTools();

  win
    .loadURL(
      url.format({
        pathname: path.resolve(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      }),
    )
    .then(() => {
      console.log("done load window");
    });

  electron.ipcMain.on(
    "[coockie][renderer][to][main]",
    async (event, data: any) => {
      if (data.type === "get") {
        const cookies = await electron.session.defaultSession.cookies.get({
          name: data.key,
          url: process.env.HOST_CHAT,
        });
        console.log();
        if (cookies.length > 0) {
          event.returnValue = cookies[0].value;
        } else {
          event.returnValue = "";
        }
        console.log("return cookie token", event.returnValue);
        return;
      } else if (data.type === "set") {
        if ((data.value ?? "") === "") {
          await electron.session.defaultSession.cookies.remove(
            process.env.HOST_CHAT,
            data.key,
          );
        } else {
          const cookie = {
            url: process.env.HOST_CHAT,
            name: data.key,
            value: data?.value ?? "",
          };
          electron.session.defaultSession.cookies.set(cookie).then(
            () => {
              console.log("save cookie successfully into main.ts");
            },
            (error) => {
              console.error(error);
            },
          );
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

