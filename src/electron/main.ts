import { app, BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "path";
import { getPrismaClient, disconnectPrisma } from "./database";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // データベースの初期化
  getPrismaClient();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../../out/index.html")}`;

  mainWindow.loadURL(url);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", async () => {
  await disconnectPrisma();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// アプリ終了前にPrismaを切断
app.on("before-quit", async () => {
  await disconnectPrisma();
});
