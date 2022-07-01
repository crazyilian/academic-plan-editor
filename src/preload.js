import { contextBridge, ipcRenderer } from 'electron'

// https://www.electronjs.org/docs/latest/tutorial/ipc

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('ipcRenderer', {
  getTemplates: () => ipcRenderer.invoke('get-templates'),

  handle: {
    showApp: (callback) => ipcRenderer.on('show-app', callback),
    collapseAll: (callback) => ipcRenderer.on('collapse-all', callback),
    expandALl: (callback) => ipcRenderer.on('expand-all', callback)
  },
})
