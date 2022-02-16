// Module to control the application lifecycle and the native browser window.
const {app, BrowserWindow, protocol, session} = require('electron')
const path = require('path')
const url = require('url')
const os = require('os')

// Create the native browser window.
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 202,
    height: 110,
    frame: false,
    resizable: false,
    x: -50,
    y: 100,
    alwaysOnTop: true,

    webPreferences: {
      // security
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // Set the path of an additional "preload" script that can be used to
      // communicate between node-land and browser-land.
      preload: path.join(app.getAppPath(), 'public', 'preload.js')
    }
  })

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      })
    : 'http://localhost:3000'
  mainWindow.loadURL(appURL)

  // Automatically open Chrome's DevTools in development mode.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({mode: 'detach'})
  }
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
function setupLocalFilesNormalizerProxy() {
  protocol.registerHttpProtocol(
    'file',
    (request, callback) => {
      const url = request.url.substr(8)
      callback({path: path.normalize(`${__dirname}/${url}`)})
    },
    error => {
      if (error) console.error('Failed to register protocol')
    }
  )
}

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  if (!app.isPackaged) {
    const extensions = [
      // React dev tools
      '/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.23.0_0',
      // Testing playground
      '/.config/google-chrome/Default/Extensions/hejbmebodbijjdhflfknehhcgaklhano/1.16.0_0/'
    ]
    await Promise.all(
      extensions.map(extension =>
        session.defaultSession.loadExtension(path.join(os.homedir(), extension))
      )
    )
  }
  createWindow()
  setupLocalFilesNormalizerProxy()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('web-contents-created', (event, contents) => {
  // https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
  contents.on('will-navigate', (event, navigationUrl) => {
    // Since our app does not navigate we will prevent the action
    console.log('Preventing navigation')
    event.preventDefault()
  })

  // https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // since our app does not make use of Webview, we will prevent its creation
    console.log('Preventing webview creation')
    event.preventDefault()
  })
})
