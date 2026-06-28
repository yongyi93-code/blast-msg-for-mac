'use strict';

const path = require('path');
const fs = require('fs');

// 在 Electron 主进程里运行时，用 userData 目录存放可写数据（uploads / 登录态），
// 因为打包后的 .app 内容是只读的，且每次更新会被替换。
// 命令行 `node src/server.js` 运行时没有 electron 模块，保持原来的相对路径。
function userDataDir() {
  if (!process.versions.electron) return null;
  try {
    return require('electron').app.getPath('userData');
  } catch (_) {
    return null;
  }
}

// 自动检测系统已安装的 Chrome / Chromium，避免依赖 Puppeteer 内置浏览器。
function detectChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates = [];

  if (process.platform === 'win32') {
    const prefixes = [
      process.env['PROGRAMFILES'],
      process.env['PROGRAMFILES(X86)'],
      process.env['LOCALAPPDATA'],
    ].filter(Boolean);
    for (const prefix of prefixes) {
      candidates.push(
        path.join(prefix, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        path.join(prefix, 'Google', 'Chrome Beta', 'Application', 'chrome.exe'),
        path.join(prefix, 'Chromium', 'Application', 'chrome.exe'),
        path.join(prefix, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      );
    }
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    );
  } else {
    candidates.push(
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    );
  }

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) {}
  }

  return ''; // 回退到 Puppeteer 内置
}

const dataDir = userDataDir();

// 可配置项。也可以通过环境变量覆盖，或在网页界面里临时调整发送参数。
module.exports = {
  // HTTP 服务端口
  port: Number(process.env.PORT) || 3000,

  // 号码没有国家码时，默认补全的国家码（不带 +）。马来西亚 = 60，中国 = 86，美国 = 1。
  defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '60',

  // 每条消息之间的随机延迟区间（毫秒）。防封关键：发太快容易被封号。
  delay: {
    minMs: Number(process.env.DELAY_MIN_MS) || 8000,
    maxMs: Number(process.env.DELAY_MAX_MS) || 20000,
  },

  // 单次群发的最大条数。超过会被截断并提示分批发送。
  maxPerRun: Number(process.env.MAX_PER_RUN) || 100,

  // 上传文件保存目录
  uploadDir: dataDir ? path.join(dataDir, 'uploads') : 'uploads',

  // whatsapp-web.js 登录会话保存目录（LocalAuth）
  authDir: dataDir ? path.join(dataDir, '.wwebjs_auth') : '.wwebjs_auth',

  // 自动检测系统 Chrome；也可用 CHROME_PATH 环境变量强制指定。
  chromePath: detectChromePath(),
};
