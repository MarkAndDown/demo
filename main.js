const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let mainWindow;

// Development mode flag
const isDev = process.argv.includes('--dev');

function createWindow() {
  // Create browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: false
  });

  // Load the app's index.html
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'renderer', 'index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to display
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open developer tools in development mode
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object, if your app supports multiple windows,
    // you can store them in an array, and you should delete the corresponding element.
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Request',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-request');
          }
        },
        {
          label: 'Save Request',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-request');
          }
        },
        {
          label: 'Import Collections',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Postman Collections', extensions: ['json'] },
                { name: 'NB Man Collections', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              try {
                const data = fs.readFileSync(result.filePaths[0], 'utf8');
                const collections = JSON.parse(data);
                
                // Check if it's a Postman collection
                if (collections.info && collections.item) {
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Postman Collection Detected',
                    message: `Importing Postman collection: "${collections.info.name}"`,
                    detail: 'The collection will be converted to NB Man format.'
                  });
                }
                
                mainWindow.webContents.send('import-collections', collections);
              } catch (error) {
                dialog.showErrorBox('Import Failed', 'Unable to read or parse file: ' + error.message);
              }
            }
          }
        },
        {
          label: 'Export Collections',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('export-collections', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', label: 'Undo' },
        { role: 'redo', label: 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: 'Cut' },
        { role: 'copy', label: 'Copy' },
        { role: 'paste', label: 'Paste' },
        { role: 'selectall', label: 'Select All' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', label: 'Reload' },
        { role: 'forceReload', label: 'Force Reload' },
        { role: 'toggleDevTools', label: 'Toggle Developer Tools' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn', label: 'Zoom In' },
        { role: 'zoomOut', label: 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toggle Full Screen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Settings',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About NB Man',
              message: 'NB Man v1.0.0',
              detail: 'A feature-complete API testing tool\n\nBuilt with Electron\nMIT License'
            });
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'View Documentation',
          click: () => {
            shell.openExternal('https://github.com/your-repo/nb-man');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/your-repo/nb-man/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
// and is ready to create browser windows
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC communication handling
ipcMain.handle('save-file', async (event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled) {
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file-dialog', async (event) => {
  try {
    console.log('Opening file dialog...');
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Postman Collections', extensions: ['json'] },
        { name: 'NB Man Collections', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    console.log('File dialog result:', result);
    
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      console.log('Selected file:', filePath);
      
      const data = fs.readFileSync(filePath, 'utf8');
      console.log('File content length:', data.length);
      
      const collections = JSON.parse(data);
      console.log('Parsed collections:', collections);
      
      // Check if it's a Postman collection
      if (collections.info && collections.item) {
        console.log('Detected Postman collection:', collections.info.name);
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Postman Collection Detected',
          message: `Importing Postman collection: "${collections.info.name}"`,
          detail: 'The collection will be converted to NB Man format.'
        });
      }
      
      return { success: true, data: collections };
    }
    
    console.log('File dialog canceled');
    return { success: false, canceled: true };
  } catch (error) {
    console.error('File dialog error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-error', async (event, title, content) => {
  dialog.showErrorBox(title, content);
});

ipcMain.handle('show-info', async (event, title, content) => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: content
  });
});

// Security settings
app.on('web-contents-created', (event, contents) => {
  // Disable navigation
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !parsedUrl.protocol.startsWith('file:')) {
      event.preventDefault();
    }
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Application Error', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  dialog.showErrorBox('Application Error', reason.toString());
}); 