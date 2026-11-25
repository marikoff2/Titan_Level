// Окно «Уровень станин X» для Windows: та же страница, что в APK, работает без интернета.
// Данные и замеры хранятся в профиле Windows (%APPDATA%\TitanLevel).
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400, height: 900, minWidth: 800, minHeight: 600,
    backgroundColor: '#070b12',
    icon: path.join(__dirname, 'app', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  // внешние ссылки — в обычном браузере
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); shell.openExternal(url); } });
  // F11 — полный экран окна, F5 — перезагрузить
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F5') { win.reload(); e.preventDefault(); }
  });
  // оформление «командный пульт» — только для Windows, поверх той же страницы, что в APK
  // 2.0: как в APK — заставка и меню разделов (home.html), серая гамма TIA (tia.css внутри страниц).
  // Прежнее тёмное оформление (titan-skin.css) и встраиваемая вкладка «Геометрия» больше не подключаются.
  win.loadFile(path.join(__dirname, 'app', 'home.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
