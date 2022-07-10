'use strict'

import { app, protocol, BrowserWindow, Menu, screen, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as path from "path";
import yaml from "js-yaml"
import fs from "fs-extra"
import savePlan from "./savePlan"

const isDevelopment = process.env.NODE_ENV !== 'production'
const extraResources = isDevelopment ? path.join(__dirname, '../src/extraResources') : path.join(process.resourcesPath, 'extraResources')
const savingPath = './savings'

app.setName("Редактор учебных планов")

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])


ipcMain.handle('get-last-project', () => {
  const filePaths = getAllProjectFiles();
  if (filePaths.length === 0) {
    return undefined;
  }
  const mtimes = filePaths.map(f => fs.statSync(f).mtime)
  const lastModifiedId = mtimes.reduce((mxi, cur, i) => mtimes[mxi] > cur ? mxi : i, 0);
  const lastFile = filePaths[lastModifiedId];
  return fs.readJsonSync(lastFile);
});

function createMenu(win) {
  const exportFileTypes = ['xlsx', 'planeditor'];
  const template = [
    {
      label: 'Файл',
      submenu: [
        // { label: 'Сохранить', click: () => { console.log('Save project'); } },
        {
          label: 'Сохранить проект',
          click: () => { win.webContents.send('save-project'); }
        },
        {
          label: 'Сохранить проект как',
          submenu: exportFileTypes.map(type => ({
            label: `Сохранить проект как .${type}`,
            click: () => { win.webContents.send('export-project', { all: true, type })}
          })),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Выйти' }
      ]
    },
    ...(isDevelopment ? [{ role: 'toggleDevTools' },] : [])
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function getAllProjectFiles() {
  const files = [];
  if (fs.existsSync(savingPath)) {
    fs.readdirSync(savingPath).forEach(file => {
      files.push(path.join(savingPath, file));
    })
  }
  return files;
}

function saveProject(project, filepath) {
  if (filepath === undefined) {
    filepath = path.join(savingPath, project.name + '.planeditor');
  }
  fs.outputJsonSync(filepath, project)
}

function createHandlers(win) {
  ipcMain.handle('message-box', (event, options) => {
    return dialog.showMessageBoxSync(win, options)
  });
}

function createIpcListeners(win) {
  ipcMain.on('ask-templates', () => loadTemplates(win))
  ipcMain.on('export-project', (event, options) => {
    if (options.type === 'planeditor') {
      const path = dialog.showSaveDialogSync(win, {
        defaultPath: options.project.name + '.planeditor',
        filters: { name: 'Редактор учебных планов (.planeditor)', extensions: ['planeditor'] }
      });
      saveProject(options.project, path);
    } else {
      savePlan[options.type](options.project.data, (filename, tempFilename) => {
        const filters = {
          'xlsx': [{ name: 'Excel (.xlsx)', extensions: ['xlsx'] }],
        }[options.type];
        const path = dialog.showSaveDialogSync(win, {
          defaultPath:
          filename, filters: filters
        });
        if (path !== undefined) {
          fs.moveSync(tempFilename, path, { overwrite: true })
        }
      });
    }
  });
  ipcMain.on('save-project', (event, options) => {
    saveProject(options);
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
