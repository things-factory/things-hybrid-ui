const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')

require('device-discover-node')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  // win.loadFile('http://192.168.1.16:3000')
  // win.loadFile('~/GitHub/things-factory-group/things-cordova-ui/dist-client/index.html')
  // win.loadURL(path.join(__dirname, '/dist-client/index.html'))
  // win.loadURL(
  //   url.format({
  //     pathname: path.join(__dirname, `/dist-client/index.html`),
  //     protocol: 'file:',
  //     slashes: true
  //   })
  // )

  // win.loadURL(
  //   url.format({
  //     pathname: path.join(__dirname, `/dist-client/index.html`),
  //     protocol: 'file:',
  //     slashes: true
  //   })
  // )
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `electron.html`),
      protocol: 'file:',
      slashes: true
    })
  )


  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
