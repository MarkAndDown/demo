# NB Man Installation Guide

## 🚀 Quick Start

### Step 1: Install Node.js

1. **Download Node.js**
   - Visit [Node.js official website](https://nodejs.org/)
   - Download LTS version (recommended)
   - Choose Windows Installer (.msi)

2. **Install Node.js**
   - Double-click the downloaded .msi file
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option

3. **Verify Installation**
   - Open Command Prompt or PowerShell
   - Run the following commands:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Run NB Man

#### Method 1: Using Startup Script (Recommended)
1. Double-click the `start.bat` file
2. The script will automatically install dependencies and start the application

#### Method 2: Manual Run
1. Open Command Prompt or PowerShell
2. Navigate to the project directory
3. Run the following commands:
   ```bash
   npm install
   npm start
   ```

### Step 3: Build Desktop Application

#### Using Build Script (Recommended)
1. Double-click the `build.bat` file
2. Choose build type:
   - 1: Windows Installer
   - 2: Windows Portable
   - 3: All Platforms
   - 4: Package Only

#### Manual Build
```bash
# Build Windows version
npm run build-win

# Build portable version
npm run build-win-portable

# Build all platforms
npm run build
```

## 📋 System Requirements

### Minimum Requirements
- **Operating System**: Windows 7 or higher
- **Memory**: 4GB RAM
- **Storage**: 500MB available space
- **Node.js**: 16.0 or higher

### Recommended Configuration
- **Operating System**: Windows 10/11
- **Memory**: 8GB RAM or higher
- **Storage**: 1GB available space
- **Node.js**: 18.0 or higher

## 🔧 Troubleshooting

### Common Issues

#### 1. "node is not recognized as an internal or external command"
**Solution**:
- Reinstall Node.js
- Make sure to check "Add to PATH" option
- Restart Command Prompt or PowerShell

#### 2. npm installation fails
**Solution**:
```bash
# Clean npm cache
npm cache clean --force

# Run with administrator privileges
# Right-click Command Prompt -> Run as administrator
```

#### 3. Electron download fails
**Solution**:
```bash
# Set mirror source
npm config set registry https://registry.npmmirror.com
npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/

# Reinstall
npm install
```

#### 4. Build fails
**Solution**:
```bash
# Clean and reinstall
rm -rf node_modules
rm -rf dist
npm install
npm run build-win
```

#### 5. Application won't start
**Solution**:
- Check if Node.js version is compatible
- Ensure all dependencies are properly installed
- Check console error messages

### Network Issues

If you encounter network connection issues, try:

1. **Use domestic mirror**
```bash
npm config set registry https://registry.npmmirror.com
```

2. **Set Electron mirror**
```bash
npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
```

3. **Use proxy**
```bash
npm config set proxy http://proxy-server:port
npm config set https-proxy http://proxy-server:port
```

## 📦 Offline Installation

If you need offline installation:

1. **Download dependencies on a machine with network**
```bash
npm install --cache-min 9999999
```

2. **Copy node_modules directory to target machine**

3. **Run on target machine**
```bash
npm start
```

## 🔒 Security Notes

- The application runs locally and does not upload any data
- All API requests are sent through your network connection
- Data is stored in local browser storage
- Recommend regularly backing up important data

## 📞 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [README.md](README.md) documentation
3. Check console error messages
4. Submit an Issue to the project repository

## 🎯 Next Steps

After installation, you can:

1. **Start Using**: Send your first API request
2. **Import Examples**: Use examples from `example-collections.json`
3. **Customize Configuration**: Modify environments and settings
4. **Build Application**: Create distributable desktop application

---

**Enjoy using it!** 🎉 