import { contextBridge, ipcRenderer } from 'electron'

// https://www.electronjs.org/docs/latest/tutorial/ipc

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('ipcRenderer', {
  isDevelopment: (options) => ipcRenderer.invoke('is-development', options),

  messageBox: (options) => ipcRenderer.invoke('message-box', options),

  getCurrentProject: (options) => ipcRenderer.invoke('get-cur-project', options),
  getTemplates: (options) => ipcRenderer.invoke('get-templates', options),

  exportProject: (options) => ipcRenderer.send('export-project', options),
  saveProject: (options) => ipcRenderer.send('save-project', options),
  openProject: (options) => ipcRenderer.send('open-project', options),
  createProject: (options) => ipcRenderer.send('create-project', options),

  handle: {
    showApp: (callback) => ipcRenderer.on('show-app', callback),
    exportProject: (callback) => ipcRenderer.on('export-project', callback),
    saveProject: (callback) => ipcRenderer.on('save-project', callback),
    openProject: (callback) => ipcRenderer.on('open-project', callback),
  }
});
