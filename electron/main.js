'use strict';

const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');

app.setName('WhatsApp群发工具');

let mainWindow = null;
let backend = null;

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    title: 'WhatsApp 群发工具',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`http://localhost:${port}`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 显示下载进度窗口
function createLoadingWindow(message) {
  const win = new BrowserWindow({
    width: 420,
    height: 160,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  win.loadURL(`data:text/html,<body style="margin:0;background:#1a1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#fff">
    <div style="font-size:18px;margin-bottom:12px">⏳ 首次启动初始化中</div>
    <div id="msg" style="font-size:13px;color:#aaa">${message}</div>
  </body>`);
  return win;
}

// 检测系统已有浏览器
function findSystemChrome() {
  const candidates = [];
  const prefixes = [
    process.env['PROGRAMFILES'],
    process.env['PROGRAMFILES(X86)'],
    process.env['LOCALAPPDATA'],
  ].filter(Boolean);
  for (const prefix of prefixes) {
    candidates.push(
      path.join(prefix, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(prefix, 'Google', 'Chrome Beta', 'Application', 'chrome.exe'),
      path.join(prefix, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    );
  }
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch (_) {}
  }
  return null;
}

// 确保有可用的浏览器，没有则自动下载 Chromium
async function ensureBrowser() {
  // 优先用系统已有浏览器
  const systemChrome = process.env.CHROME_PATH || findSystemChrome();
  if (systemChrome) {
    process.env.CHROME_PATH = systemChrome;
    return;
  }

  // 检查 puppeteer 缓存的 Chromium 是否已存在
  const puppeteer = require(path.join(__dirname, '..', 'node_modules', 'puppeteer'));
  let execPath;
  try { execPath = puppeteer.executablePath(); } catch (_) {}
  if (execPath && fs.existsSync(execPath)) return;

  // 需要下载 Chromium
  const loadWin = createLoadingWindow('正在下载浏览器组件，请稍候（约 150MB）...');
  try {
    const { downloadBrowsers } = await import(
      path.join(__dirname, '..', 'node_modules', 'puppeteer', 'internal', 'node', 'install.js')
    );
    await downloadBrowsers();
    loadWin.close();
  } catch (err) {
    loadWin.close();
    dialog.showErrorBox(
      '初始化失败',
      '浏览器组件下载失败，请检查网络连接后重试。\n\n' + err.message
    );
    app.exit(1);
  }
}

app.whenReady().then(async () => {
  await ensureBrowser();

  // 在 Electron 主进程里直接启动现有的 Express + socket.io 服务。
  backend = require(path.join(__dirname, '..', 'src', 'server.js'));
  const { port } = await backend.ready;
  createWindow(port);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', async (event) => {
  if (!backend) return;
  event.preventDefault();
  await backend.shutdown();
  backend = null;
  app.exit(0);
});
