const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 850,
        frame: true,
        title: "THE HORIZON INSTITUTE & SOFTWARE HOUSE",
        backgroundColor: '#f8fafc',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js') // Optional if needed later
        },
        icon: path.join(__dirname, 'Icon/WhatsApp Image 2026-04-06 at 12.11.44 AM.jpeg')
    });

    win.loadFile('index.html');
    
    // Auto-maximize for professional feel
    win.maximize();
    
    // Remove default menu bar for clean SaaS look
    win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
