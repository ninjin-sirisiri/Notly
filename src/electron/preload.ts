import { contextBridge, ipcRenderer } from "electron";

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld("electron", {
  // 今後、ファイルシステム操作などのAPIをここに追加
  platform: process.platform,
});
