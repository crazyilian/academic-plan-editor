'use strict'

import { app, BrowserWindow, dialog, ipcMain, Menu, protocol, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import * as path from "path";
import fs from "fs-extra"
import savePlan from "@/savePlan"
import Store from 'electron-store'
import { parseTable } from "@/parseTable"
import * as packagejson from '../package.json';

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
  process.exit();
}

const isDevelopment = process.env.NODE_ENV !== 'production'
const extraResources = isDevelopment ? path.join(__dirname, '../src/extraResources') : path.join(process.resourcesPath, 'extraResources')
const extensionFilters = {
  'xlsx': { name: 'Таблица Excel', extensions: ['xlsx'] },
  'planeditor': { name: 'Проект - Редактор учебных планов', extensions: ['planeditor'] }
}
let mainWindow = undefined;
const store = new Store({
  cwd: isDevelopment ? path.join(__dirname, '../savings') : app.getPath('userData')
})
const webPreferences = {
  // Use pluginOptions.nodeIntegration, leave this alone
  // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
  nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
  contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
  preload: path.join(__dirname, 'preload.js'),
}

app.setName("Редактор учебных планов")

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])


ipcMain.handle('get-cur-project', () => {
  let projectPath = undefined;
  if (process.argv.length >= (isDevelopment ? 3 : 2)) {
    projectPath = process.argv[isDevelopment ? 2 : 1];
  } else {
    projectPath = store.get('lastProjectPath')
  }
  return applyProject(projectPath);
});
ipcMain.handle('get-templates', () => {
  const filename = fs.readdirSync(extraResources).find(file => path.parse(file).ext === '.xlsx');
  const filepath = path.join(extraResources, filename);
  return parseTable(filepath);
})
ipcMain.handle('get-project-list', () => getProjectList());
ipcMain.handle('is-development', () => isDevelopment);
ipcMain.handle('app-info', () => ({
  version: app.getVersion(),
  author: packagejson.author,
  name: app.getName(),
  copyrightYear: '2022' + (new Date().getFullYear() > 2022 ? '-' + new Date().getFullYear().toString() : ''),
  description: packagejson.description,
  arch: process.arch
}));

function createMenu(win) {
  if (win === undefined)
    return;
  const projectOpened = store.get('lastProjectPath') !== undefined;
  const exportFileTypes = ['xlsx', 'planeditor'];
  const template = [
    {
      label: 'Проект',
      submenu: [
        {
          label: 'Открыть',
          click: () => openProject(win),
        },
        {
          label: 'Создать',
          click: () => createProject(win),
        },
        ...(projectOpened ? [
          { type: 'separator' },
          {
            label: 'Сохранить',
            click: () => { win.webContents.send('save-project'); }
          },
          {
            label: 'Сохранить как',
            submenu: exportFileTypes.map(type => ({
              label: `Сохранить как .${type}`,
              click: () => { win.webContents.send('export-project', { all: true, type })}
            })),
          },
          { type: 'separator' },
          {
            label: 'Закрыть',
            click: () => closeProject(win),
          }
        ] : []),
      ]
    },
    {
      label: 'Помощь',
      submenu: [
        {
          label: 'О программе',
          click: () => createAboutWindow(win),
        },
      ]
    },
    ...(isDevelopment ? [{ role: 'toggleDevTools' }] : [])
  ]
  const menu = Menu.buildFromTemplate(template)
  win.setMenu(menu);
}

function emptyProject() {
  return { tabs: [], gradeId: 0, version: app.getVersion() };
}

function applyProject(projectPath, project) {
  if (projectPath === undefined) {
    store.delete('lastProjectPath');
    setTitlePath(undefined);
    createMenu(mainWindow);
    return undefined;
  }
  if (!fs.existsSync(projectPath)) {
    dialog.showMessageBox(mainWindow, {
      message: `Невозможно открыть проект "${path.parse(projectPath).name}"`,
      detail: `Проекта ${projectPath} больше не существует`,
      title: 'Ошибка',
      type: 'error',
    }).then(() => {
      store.delete('lastProjectPath');
      setTitlePath(undefined);
    })
    createMenu(mainWindow);
    return undefined;
  }
  setTitlePath(projectPath);
  store.set('lastProjectPath', projectPath);
  addPathToProjectList(projectPath);
  if (project === undefined) {
    project = fs.readJSONSync(projectPath);
  }
  createMenu(mainWindow);
  return project;
}

function getProjectList() {
  const paths = store.get('projectList') || [];
  paths.forEach(ppath => {
    ppath.valid = fs.existsSync(ppath.path);
    ppath.name = path.parse(ppath.path).name;
  });
  paths.sort((a, b) => b.date - a.date);
  return paths;
}

function addPathToProjectList(ppath, save = true) {
  if (ppath === undefined)
    return;
  const paths = removePathFromProjectList(ppath, false);
  paths.push({
    path: ppath,
    date: (new Date()).getTime()
  });
  if (save)
    store.set('projectList', paths);
  return paths;
}

function removePathFromProjectList(ppath, save = true) {
  const paths = store.get('projectList') || [];
  const oldi = paths.findIndex((p) => p.path === ppath);
  if (oldi !== -1)
    paths.splice(oldi, 1)
  if (save)
    store.set('projectList', paths);

  return paths;
}

function saveProject(project, filepath) {
  if (project === undefined) {
    return;
  }
  if (filepath === undefined) {
    filepath = store.get('lastProjectPath');
  }
  fs.outputJsonSync(filepath, project)
}

function openProject(win, ppath) {
  if (ppath === undefined) {
    const ppaths = dialog.showOpenDialogSync(win, {
      defaultPath: store.get('lastProjectPath'),
      filters: [extensionFilters['planeditor']],
      properties: ['openFile']
    });
    if (ppaths === undefined) {
      return false;
    }
    ppath = ppaths[0];
  }
  const project = applyProject(ppath);
  if (project === undefined) {
    return false;
  }
  win.webContents.send('open-project', project);
  return true;
}

function createProject(win) {
  const ppath = dialog.showSaveDialogSync(win, {
    defaultPath: path.join(path.parse(store.get('lastProjectPath') || "").dir, 'Новый проект.planeditor'),
    filters: [extensionFilters['planeditor']],
    title: 'Создание',
    buttonLabel: 'Создать'
  });
  if (ppath === undefined) {
    return false;
  }
  const project = emptyProject();
  saveProject(project, ppath);
  applyProject(ppath, project);
  win.webContents.send('open-project', project);
  return true;
}

function closeProject(win) {
  applyProject(undefined);
  win.webContents.send('open-project', undefined);
}

function setTitlePath(p) {
  if (p === undefined) {
    mainWindow.setTitle(app.getName());
  } else {
    const filename = p.replace(/^.*[\\/]/, '')
    mainWindow.setTitle(`${app.getName()} - ${filename}`)
  }
}

function createHandlers(win) {
  ipcMain.handle('message-box', (event, options) => {
    return dialog.showMessageBoxSync(win, options)
  });
}

function createIpcListeners(win) {
  ipcMain.on('export-project', (event, options) => {
    if (options.type === 'planeditor') {
      const ppath = dialog.showSaveDialogSync(win, {
        defaultPath: store.get('lastProjectPath') || 'Учебный план.planeditor',
        filters: [extensionFilters[options.type]]
      });
      if (ppath !== undefined) {
        saveProject(options.project, ppath);
        applyProject(ppath, options.project);
      }
    } else {
      savePlan[options.type](options.project.tabs, (tempFilename) => {
        const ppath = dialog.showSaveDialogSync(win, {
          defaultPath: path.parse(store.get('lastProjectPath') || "").name + `.${options.type}`,
          filters: [extensionFilters[options.type]]
        });
        if (ppath !== undefined) {
          try {
            fs.moveSync(tempFilename, ppath, { overwrite: true })
          } catch (err) {
            if (err.code === 'EPERM') {
              dialog.showMessageBoxSync(win, {
                'type': 'error',
                'title': 'Ошибка сохранения...',
                'message': "Сохранение не может быть выполнено, так как файл открыт в другой программе",
                'detail': "Закройте файл и повторите попытку.",
              })
            }
          }
        }
      });
    }
  });
  ipcMain.on('save-project', (event, options) => {
    saveProject(options);
  });
  ipcMain.handle('open-project', (event, ppath) => openProject(win, ppath));
  ipcMain.handle('create-project', () => createProject(win));

  ipcMain.handle('remove-project-list', (event, ppath) => removePathFromProjectList(ppath))

}

function getUrl(url) {
  const base = process.env.WEBPACK_DEV_SERVER_URL || 'app://./index.html/';
  return base + '#' + url;
}

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: screen.width,
    height: screen.height,
    webPreferences,
    autoHideMenuBar: false,
    show: false,
    title: app.getName(),
  })
  mainWindow = win;
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(getUrl('/'))
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL(getUrl('/'))
  }
  createMenu(win);
  createHandlers(win);
  createIpcListeners(win);
  if (isDevelopment) {
    win.maximize();
  } else {
    win.once('ready-to-show', () => win.maximize());
  }
}

function createAboutWindow(win) {
  const child = new BrowserWindow({
    parent: win,
    modal: true,
    show: false,
    title: 'О программе',
    width: 450,
    height: 350,
    resizable: true,
    minimizable: false,
    maximizable: false,
    webPreferences,
  });
  child.setMenu(null);
  child.loadURL(getUrl('/about'))
  child.once('ready-to-show', () => child.show());
  child.on('close', () => child.hide());
}

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

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
