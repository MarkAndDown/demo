const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // Dialogs
  showError: (title, content) => ipcRenderer.invoke('show-error', title, content),
  showInfo: (title, content) => ipcRenderer.invoke('show-info', title, content),
  
  // Event listeners
  onNewRequest: (callback) => ipcRenderer.on('new-request', callback),
  onSaveRequest: (callback) => ipcRenderer.on('save-request', callback),
  onImportCollections: (callback) => ipcRenderer.on('import-collections', callback),
  onExportCollections: (callback) => ipcRenderer.on('export-collections', callback),
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  
  // Remove event listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Application information
  getAppVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  
  // System APIs
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Clipboard
  writeText: (text) => ipcRenderer.invoke('write-text', text),
  readText: () => ipcRenderer.invoke('read-text'),
  
  // Window control
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // Developer tools
  toggleDevTools: () => ipcRenderer.invoke('toggle-dev-tools'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body)
});

// Helper function to remove event listeners
window.addEventListener('beforeunload', () => {
  ipcRenderer.removeAllListeners('new-request');
  ipcRenderer.removeAllListeners('save-request');
  ipcRenderer.removeAllListeners('import-collections');
  ipcRenderer.removeAllListeners('export-collections');
  ipcRenderer.removeAllListeners('open-settings');
}); 