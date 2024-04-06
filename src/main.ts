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

