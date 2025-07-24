# NB Man - Desktop API Testing Tool

A powerful API testing tool built with Electron, providing complete API testing functionality, supporting Windows, macOS and Linux.

## 🚀 Features

### Core Features
- **HTTP Request Support**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Request Management**: Parameters, Headers, Body, Authentication
- **Response Viewing**: Response Body, Headers, Cookies
- **Environment Management**: Multi-environment configuration, variable support
- **Collection Management**: Save and organize API requests
- **History**: Automatically save request history
- **Test Scripts**: Support for JavaScript test scripts

### Desktop Application Features
- **Native App Experience**: Built with Electron, providing native desktop app experience
- **System Integration**: Support for system menus, shortcuts, file associations
- **Data Persistence**: Local data storage, import/export support
- **Multi-platform Support**: Windows, macOS, Linux
- **Offline Usage**: No internet connection required

## 📦 Installation and Running

### Requirements
- Node.js 16.0 or higher
- npm or yarn package manager

### Development Environment Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Run in Development Mode**
```bash
npm run dev
```

3. **Build Application**
```bash
# Build Windows version
npm run build-win

# Build portable version
npm run build-win-portable

# Build all platforms
npm run build
```

### Production Usage

After building, executable files will be generated in the `dist` directory:

- **Windows**: `NB Man Setup.exe` (installer) or `NBMan-Portable.exe` (portable)
- **macOS**: `NB Man.dmg`
- **Linux**: `NB Man.AppImage`

## 🛠️ Development Guide

### Project Structure
```
nb-man/
├── main.js              # Electron main process
├── preload.js           # Preload script
├── package.json         # Project configuration
├── renderer/            # Renderer process files
│   ├── index.html       # Main interface
│   ├── styles.css       # Style files
│   └── app.js          # Application logic
├── assets/              # Resource files
│   └── icon.ico        # Application icon
└── dist/               # Build output directory
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development mode |
| `npm run dev` | Development mode (with developer tools) |
| `npm run build` | Build all platforms |
| `npm run build-win` | Build Windows version |
| `npm run build-win-portable` | Build Windows portable version |
| `npm run pack` | Package application (no installer) |

### Custom Configuration

#### Modify Application Information
Edit the following fields in `package.json`:
```json
{
  "name": "nb-man",
  "version": "1.0.0",
  "description": "A feature-complete API testing tool - NB Man",
  "author": "Your Name"
}
```

#### Modify Build Configuration
Modify the `build` section in `package.json`:
```json
{
  "build": {
    "appId": "com.yourcompany.nbman",
    "productName": "NB Man",
    "directories": {
      "output": "dist"
    }
  }
}
```

## 🎯 User Guide

### Basic Operations

1. **Send Request**
   - Select HTTP method
   - Enter request URL
   - Click "Send" button or press `Ctrl+Enter`

2. **Add Request Parameters**
   - Click "Params" tab
   - Click "Add Parameter" button
   - Enter parameter name and value

3. **Set Request Headers**
   - Click "Headers" tab
   - Click "Add Header" button
   - Enter header name and value

4. **Configure Authentication**
   - Click "Auth" tab
   - Select authentication type
   - Enter authentication information

### Advanced Features

#### Environment Management
- Select different environments (development, staging, production)
- Environment variables are automatically applied to requests
- Support for custom environment configuration

#### Collection Management
- Save common requests to collections
- Import/export collections
- Organize and manage API requests

#### Test Scripts
```javascript
// Basic test example
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test("Response contains user information", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('name');
});
```

### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl+Enter` | Send request |
| `Ctrl+N` | New request |
| `Ctrl+S` | Save request |
| `Ctrl+D` | Duplicate request |
| `Ctrl+Q` | Quit application |

## 🔧 Technology Stack

- **Framework**: Electron 28.0
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: electron-builder
- **Code Editor**: CodeMirror
- **Icons**: Font Awesome
- **Storage**: LocalStorage

## 📋 Development Plan

### Completed Features
- [x] Basic HTTP request functionality
- [x] Request parameters and headers management
- [x] Multiple authentication methods
- [x] Environment variable support
- [x] Collection management
- [x] History records
- [x] Test scripts
- [x] Desktop application packaging

### Planned Features
- [ ] WebSocket support
- [ ] GraphQL support
- [ ] Import Postman collections
- [ ] Team collaboration features
- [ ] Cloud data synchronization
- [ ] Request templates
- [ ] Performance monitoring
- [ ] Automated testing
- [ ] Plugin system

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failure
```bash
# Clean cache
npm cache clean --force
rm -rf node_modules
npm install
```

#### 2. Application Won't Start
- Check if Node.js version is compatible
- Ensure all dependencies are properly installed
- Check console error messages

#### 3. Request Failure
- Check network connection
- Verify URL format
- Confirm CORS settings

#### 4. Data Loss
- Data is stored locally, clearing app data will cause loss
- Recommend regularly exporting important data

### Debug Mode

Developer tools will automatically open in development mode. For production versions, enable via:

1. Click "View" -> "Toggle Developer Tools" in the application menu
2. Or use shortcut `F12`

## 📄 License

MIT License - Free to use and modify.

## 🤝 Contributing

Welcome to submit Issues and Pull Requests to improve this tool! 