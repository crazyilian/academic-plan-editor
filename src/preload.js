import { contextBridge, ipcRenderer } from 'electron'

// https://www.electronjs.org/docs/latest/tutorial/ipc

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('ipcRenderer', {
  messageBox: (options) => ipcRenderer.invoke('message-box', options),
  isDevelopment: (options) => ipcRenderer.invoke('is-development', options),
  askTemplates: (options) => ipcRenderer.send('ask-templates', options),
  exportProject: (options) => ipcRenderer.send('export-project', options),
  handle: {
    showApp: (callback) => ipcRenderer.on('show-app', callback),
    collapseAll: (callback) => ipcRenderer.on('collapse-all', callback),
    expandALl: (callback) => ipcRenderer.on('expand-all', callback),
    loadTemplates: (callback) => ipcRenderer.on('load-templates', callback),
    exportProject: (callback) => ipcRenderer.on('export-project', callback),
  }
});
