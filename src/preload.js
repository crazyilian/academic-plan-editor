import { contextBridge, ipcRenderer } from 'electron'

// https://www.electronjs.org/docs/latest/tutorial/ipc

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('ipcRenderer', {
  messageBox: (options) => ipcRenderer.invoke('message-box', options),
  isDevelopment: (options) => ipcRenderer.invoke('is-development', options),
  getLastProject: (options) => ipcRenderer.invoke('get-last-project', options),
  askTemplates: (options) => ipcRenderer.send('ask-templates', options),
  exportProject: (options) => ipcRenderer.send('export-project', options),
  saveProject: (options) => ipcRenderer.send('save-project', options),
  handle: {
    showApp: (callback) => ipcRenderer.on('show-app', callback),
    loadTemplates: (callback) => ipcRenderer.on('load-templates', callback),
    exportProject: (callback) => ipcRenderer.on('export-project', callback),
    saveProject: (callback) => ipcRenderer.on('save-project', callback),
  }
});
