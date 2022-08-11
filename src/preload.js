import { contextBridge, ipcRenderer } from 'electron'

// https://www.electronjs.org/docs/latest/tutorial/ipc

function ipcRendererOn(channel, callback) {
  ipcRenderer.removeAllListeners(channel);
  ipcRenderer.on(channel, callback)
}

// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('ipcRenderer', {
  isDevelopment: (options) => ipcRenderer.invoke('is-development', options),
  appInfo: (options) => ipcRenderer.invoke('app-info', options),

  messageBox: (options) => ipcRenderer.invoke('message-box', options),

  getCurrentProject: (options) => ipcRenderer.invoke('get-cur-project', options),
  getTemplates: (options) => ipcRenderer.invoke('get-templates', options),

  getProjectList: (options) => ipcRenderer.invoke('get-project-list', options),
  removeFromProjectList: (options) => ipcRenderer.invoke('remove-project-list', options),

  openProject: (options) => ipcRenderer.invoke('open-project', options),
  createProject: (options) => ipcRenderer.invoke('create-project', options),
  exportProject: (options) => ipcRenderer.send('export-project', options),
  saveProject: (options) => ipcRenderer.send('save-project', options),

  handle: {
    showApp: (callback) => ipcRendererOn('show-app', callback),
    exportProject: (callback) => ipcRendererOn('export-project', callback),
    saveProject: (callback) => ipcRendererOn('save-project', callback),
    openProject: (callback) => ipcRendererOn('open-project', callback),
  }
});
