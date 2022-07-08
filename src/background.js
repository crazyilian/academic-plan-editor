'use strict'

import { app, protocol, BrowserWindow, Menu, screen, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as path from "path";
import yaml from "js-yaml"
import fs from "fs"
import savePlan from "./savePlan"

const isDevelopment = process.env.NODE_ENV !== 'production'
const extraResources = isDevelopment ? path.join(__dirname, '../src/extraResources') : path.join(process.resourcesPath, 'extraResources')

app.setName("Редактор учебных планов")

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createMenu(win) {
  const exportFileTypes = ['xlsx'];
  const template = [
    {
      label: 'Файл',
      submenu: [
        { label: 'Сохранить', click: () => { console.log('Save project'); } },
        {
          label: 'Экспортировать',
          submenu: exportFileTypes.map(type => ({
            label: `Экспортировать как ${type}`,
            click: () => { win.webContents.send('export-project', { all: false, type })}
          })),
        },
        {
          label: 'Экспортировать всё',
          submenu: exportFileTypes.map(type => ({
            label: `Экспортировать всё как ${type}`,
            click: () => { win.webContents.send('export-project', { all: true, type })}
          })),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Выйти' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Expand all', click: () => { win.webContents.send('expand-all'); }
        },
        {
          label: 'Collapse all', click: () => { win.webContents.send('collapse-all'); }
        }
      ]
    },
    ...(isDevelopment ? [{ role: 'toggleDevTools' },] : [])
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createHandlers(win) {
  ipcMain.handle('message-box', (event, options) => {
    return dialog.showMessageBoxSync(win, options)
  });
}

function createIpcListeners(win) {
  ipcMain.on('ask-templates', () => loadTemplates(win))
  ipcMain.on('export-project', (event, options) => {
    savePlan[options.type](options.data, (filename, tempFilename) => {
      const path = dialog.showSaveDialogSync(win, {
        defaultPath: filename,
        filters: [{ name: 'Excel', extensions: ['xlsx'] }]
      })
      if (path !== undefined) {
        fs.renameSync(tempFilename, path)
      }
    });
  })
}

function showApp(win) {
  win.setTitle(app.getName());
  win.maximize();
  win.webContents.send('show-app');
}

async function createWindow() {
  ipcMain.handle('is-development', () => isDevelopment);
  // Create the browser window.
  const win = new BrowserWindow({
    width: screen.width,
    height: screen.height,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: false,
    show: false,
    title: app.getName(),
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  createMenu(win);
  createHandlers(win);
  createIpcListeners(win);
  if (isDevelopment) {
    showApp(win);
  } else {
    win.once('ready-to-show', () => {showApp(win)});
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

function loadTemplates(win) {
  const templates = [];
  const templatesPath = path.join(extraResources, 'plan-templates');
  fs.readdirSync(templatesPath).forEach(file => {
    templates.push(parseTemplate(path.join(templatesPath, file)));
  });
  // setTimeout(() => win.webContents.send('load-templates', templates), 1000)
  win.webContents.send('load-templates', templates);
}

function parseTemplate(path) {
  const raw = yaml.load(fs.readFileSync(path, 'utf8'));
  const template = { config: raw.config, grades: raw.grades, categories: [] };
  for (const [category, subjects_raw] of Object.entries(raw.categories)) {
    const subjects = [];
    for (const [subject, required] of Object.entries(subjects_raw)) {
      subjects.push({ name: subject, required: required });
    }
    template.categories.push({ name: category, subjects: subjects });
  }
  return template;
}
