/* global io */
'use strict';

// ---- i18n ----
const TRANSLATIONS = {
  zh: {
    'title': 'WhatsApp 群发工具',
    'status.offline': '连接中…',
    'status.qr': '请扫码登录',
    'status.authenticated': '登录成功，加载中…',
    'status.ready': '已就绪 ✓',
    'status.disconnected': '已断开',
    'step1.title': '扫码登录',
    'step1.starting': '正在启动 WhatsApp，请稍候…',
    'step1.hint': '用手机 WhatsApp → 设置 → 已关联的设备 → 关联设备，扫描上方二维码。',
    'step1.loggedIn': '✓ 已登录，无需再扫码。',
    'step1.loading': '登录成功，正在加载会话…',
    'step2.title': '上传收件人名单（Excel / CSV）',
    'step2.hint': '第一列为手机号（建议含国家码，如 60123456789），其余列为变量（列名即变量名，如 <code>name</code>）。',
    'step2.parsing': '解析中…',
    'step2.recipients': '✓ 共 {count} 个有效收件人。',
    'step2.variables': '可用变量：',
    'step2.skipped': '⚠️ {count} 行被跳过：',
    'step2.row': '第 {line} 行「{raw}」：{reason}',
    'step2.uploadFail': '上传失败',
    'step3.title': '编写消息',
    'step3.hint': '用 <code>{列名}</code> 插入变量，例如：<code>你好 {name}，你的订单 {order} 已发货。</code>',
    'step3.placeholder': '在这里输入要发送的消息…',
    'step3.attachLabel': '附件（图片 / 文件，可多选）：',
    'step3.clearAttach': '清空附件',
    'step3.uploading': '上传中…',
    'step3.attachments': '附件：',
    'step3.cleared': '附件已清空。',
    'step3.uploadFail': '上传失败',
    'step4.title': '发送',
    'step4.delayLabel': '每条间隔随机延迟：',
    'step4.seconds': '秒',
    'step4.delayHint': '（延迟越长越不易被封号）',
    'step4.send': '开始发送',
    'step4.stop': '停止',
    'step4.delayError': '最大延迟不能小于最小延迟',
    'step4.emptyConfirm': '消息内容为空，仅发送附件？',
    'step4.sendFail': '发送失败',
    'table.no': '#',
    'table.phone': '号码',
    'table.status': '状态',
    'table.note': '备注',
    'table.sent': '已发送',
    'table.failed': '失败',
    'table.missingVars': '缺变量：',
    'progress.done': '完成：成功 {sent}，失败 {failed}',
    'progress.stopped': '（已手动停止）',
    'progress.truncated': '，因超出单次上限有 {n} 条未发送，请分批。',
    'progress.error': '出错：',
    'footer': '⚠️ 仅向已同意接收的联系人发送。非官方网页自动化群发存在封号风险，请控制频率与数量。',
  },
  en: {
    'title': 'WhatsApp Blast Tool',
    'status.offline': 'Connecting…',
    'status.qr': 'Scan QR to login',
    'status.authenticated': 'Authenticated, loading…',
    'status.ready': 'Ready ✓',
    'status.disconnected': 'Disconnected',
    'step1.title': 'Scan QR Code to Login',
    'step1.starting': 'Starting WhatsApp, please wait…',
    'step1.hint': 'On your phone: WhatsApp → Settings → Linked Devices → Link a Device, then scan the QR code above.',
    'step1.loggedIn': '✓ Already logged in, no need to scan again.',
    'step1.loading': 'Authenticated, loading session…',
    'step2.title': 'Upload Recipient List (Excel / CSV)',
    'step2.hint': 'First column: phone number (with country code, e.g. 60123456789). Other columns: variables (column name = variable name, e.g. <code>name</code>).',
    'step2.parsing': 'Parsing…',
    'step2.recipients': '✓ {count} valid recipients found.',
    'step2.variables': 'Available variables: ',
    'step2.skipped': '⚠️ {count} rows skipped:',
    'step2.row': 'Row {line} "{raw}": {reason}',
    'step2.uploadFail': 'Upload failed',
    'step3.title': 'Compose Message',
    'step3.hint': 'Use <code>{column}</code> to insert variables, e.g.: <code>Hi {name}, your order {order} has been shipped.</code>',
    'step3.placeholder': 'Type your message here…',
    'step3.attachLabel': 'Attachments (images / files, multi-select):',
    'step3.clearAttach': 'Clear Attachments',
    'step3.uploading': 'Uploading…',
    'step3.attachments': 'Attachments: ',
    'step3.cleared': 'Attachments cleared.',
    'step3.uploadFail': 'Upload failed',
    'step4.title': 'Send',
    'step4.delayLabel': 'Random delay between messages:',
    'step4.seconds': 'sec',
    'step4.delayHint': '(Longer delay = lower ban risk)',
    'step4.send': 'Start Sending',
    'step4.stop': 'Stop',
    'step4.delayError': 'Max delay cannot be less than min delay',
    'step4.emptyConfirm': 'Message is empty. Send attachments only?',
    'step4.sendFail': 'Send failed',
    'table.no': '#',
    'table.phone': 'Phone',
    'table.status': 'Status',
    'table.note': 'Note',
    'table.sent': 'Sent',
    'table.failed': 'Failed',
    'table.missingVars': 'Missing vars: ',
    'progress.done': 'Done: {sent} sent, {failed} failed',
    'progress.stopped': ' (manually stopped)',
    'progress.truncated': ', {n} not sent due to batch limit — please split into batches.',
    'progress.error': 'Error: ',
    'footer': '⚠️ Only send to contacts who have consented. Unofficial WhatsApp automation carries ban risk — keep frequency and volume low.',
  },
};

let currentLang = localStorage.getItem('wa_lang') || 'zh';

function t(key, vars = {}) {
  let str = TRANSLATIONS[currentLang][key] || TRANSLATIONS['zh'][key] || key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.getElementById('lang-toggle').textContent = currentLang === 'zh' ? 'EN' : '中文';
  document.documentElement.lang = currentLang;
  document.title = t('title');
}

document.getElementById('lang-toggle').addEventListener('click', () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('wa_lang', currentLang);
  applyTranslations();
  // re-apply dynamic status text
  if (statusEl) {
    statusEl.textContent = t(`status.${currentStatus}`);
  }
});

// ---- App ----
const socket = io();

const el = (id) => document.getElementById(id);
const statusEl = el('wa-status');
const qrBox = el('qr-box');
const btnSend = el('btn-send');
const btnStop = el('btn-stop');

let waReady = false;
let listReady = false;
let currentStatus = 'offline';

function refreshSendBtn() {
  btnSend.disabled = !(waReady && listReady);
}

// ---- WhatsApp status / QR ----
socket.on('wa:status', (snap) => {
  currentStatus = snap.status;
  statusEl.className = `status status-${snap.status}`;
  statusEl.textContent = t(`status.${snap.status}`) || snap.status;

  waReady = snap.status === 'ready';
  refreshSendBtn();

  if (snap.status === 'qr' && snap.qr) {
    qrBox.innerHTML = `<img src="${snap.qr}" alt="WhatsApp QR Code" />`;
  } else if (snap.status === 'ready') {
    qrBox.innerHTML = `<p class="hint ok">${t('step1.loggedIn')}</p>`;
  } else if (snap.status === 'authenticated') {
    qrBox.innerHTML = `<p class="hint">${t('step1.loading')}</p>`;
  }
});

// ---- Upload list ----
el('list-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append('list', file);
  const box = el('list-result');
  box.textContent = t('step2.parsing');

  try {
    const res = await fetch('/api/upload-list', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('step2.uploadFail'));

    listReady = data.count > 0;
    refreshSendBtn();

    let html = `<span class="ok">${t('step2.recipients', { count: data.count })}</span>`;
    if (data.headers && data.headers.length) {
      html += `<div>${t('step2.variables')}${data.headers.map((h) => `<code>{${h}}</code>`).join(' ')}</div>`;
    }
    if (data.errors && data.errors.length) {
      html += `<div class="err">${t('step2.skipped', { count: data.errors.length })}</div><ul>` +
        data.errors.slice(0, 10).map((er) =>
          `<li>${t('step2.row', { line: er.line, raw: er.raw, reason: er.reason })}</li>`
        ).join('') + '</ul>';
    }
    box.innerHTML = html;
  } catch (err) {
    listReady = false;
    refreshSendBtn();
    box.innerHTML = `<span class="err">${err.message}</span>`;
  }
});

// ---- Upload attachments ----
el('attach-files').addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files.length) return;
  const fd = new FormData();
  for (const f of files) fd.append('attachments', f);
  const box = el('attach-list');
  box.textContent = t('step3.uploading');
  try {
    const res = await fetch('/api/upload-attachments', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('step3.uploadFail'));
    box.innerHTML = t('step3.attachments') + data.attachments.map((n) => `<code>${n}</code>`).join(' ');
  } catch (err) {
    box.innerHTML = `<span class="err">${err.message}</span>`;
  }
});

el('clear-attach').addEventListener('click', async () => {
  await fetch('/api/clear-attachments', { method: 'POST' });
  el('attach-list').innerHTML = `<span class="hint">${t('step3.cleared')}</span>`;
  el('attach-files').value = '';
});

// ---- Send ----
btnSend.addEventListener('click', async () => {
  const template = el('template').value;
  const delayMinMs = (Number(el('delay-min').value) || 8) * 1000;
  const delayMaxMs = (Number(el('delay-max').value) || 20) * 1000;

  if (delayMaxMs < delayMinMs) {
    alert(t('step4.delayError'));
    return;
  }
  if (!template.trim()) {
    if (!confirm(t('step4.emptyConfirm'))) return;
  }

  const res = await fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, delayMinMs, delayMaxMs }),
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || t('step4.sendFail'));
    return;
  }
});

btnStop.addEventListener('click', () => {
  fetch('/api/stop', { method: 'POST' });
  btnStop.disabled = true;
});

// ---- Progress ----
const progressBox = el('progress-box');
const progressFill = el('progress-fill');
const progressText = el('progress-text');
const resultsTable = el('results-table');
const resultsBody = resultsTable.querySelector('tbody');

socket.on('send:start', ({ total }) => {
  btnSend.disabled = true;
  btnStop.disabled = false;
  progressBox.classList.remove('hidden');
  resultsTable.classList.remove('hidden');
  resultsBody.innerHTML = '';
  progressFill.style.width = '0%';
  progressText.textContent = `0 / ${total}`;
});

socket.on('send:progress', (e) => {
  const pct = Math.round((e.index / e.total) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${e.index} / ${e.total}`;

  const tr = document.createElement('tr');
  const statusLabel = e.status === 'sent' ? t('table.sent') : t('table.failed');
  let note = '';
  if (e.error) note = e.error;
  else if (e.missing && e.missing.length) note = t('table.missingVars') + e.missing.join(', ');
  tr.innerHTML = `<td>${e.index}</td><td>${e.phone}</td>` +
    `<td class="${e.status}">${statusLabel}</td><td>${note}</td>`;
  resultsBody.appendChild(tr);
});

socket.on('send:done', (summary) => {
  btnStop.disabled = true;
  refreshSendBtn();
  let msg = t('progress.done', { sent: summary.sent, failed: summary.failed });
  if (summary.stopped) msg += t('progress.stopped');
  if (summary.truncated > 0) msg += t('progress.truncated', { n: summary.truncated });
  progressText.textContent = msg;
});

socket.on('send:error', ({ message }) => {
  btnStop.disabled = true;
  refreshSendBtn();
  progressText.textContent = t('progress.error') + message;
});

// ---- Init ----
fetch('/api/config').then((r) => r.json()).then((cfg) => {
  el('delay-min').value = Math.round(cfg.delay.minMs / 1000);
  el('delay-max').value = Math.round(cfg.delay.maxMs / 1000);
});

applyTranslations();
