// ==UserScript==
// @name         [WIKI] コードをコピーボタンを追加
// @namespace    https://wiki.interpark.co.jp/
// @version      1.0.0
// @description  コードにコピーボタンを追加
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://wiki.interpark.co.jp
// @author       wineAk
// @match        https://wiki.interpark.co.jp/*
// ==/UserScript==

(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
  .clipboard-btn {
    position: absolute;
    top: .25rem;
    right: .25rem;
    font-size: .85rem !important;
    border:1px solid #999;
    border-radius: .75rem !important;
    background:#fff;
    cursor:pointer;
    user-select:none;
    z-index:10;
    opacity: .3;
    transition: opacity .3s ease;
  }
  .clipboard-btn:hover {
    opacity: 1;
  }
  `;
  document.documentElement.appendChild(style);

  // コピーボタンを設置
  const COPY_TEXT = '📋コピーする';
  const COPY_SUCCESS_TEXT = '✅コピー完了';
  const COPY_ERROR_TEXT = 'コピーに失敗しました: ';
  document.querySelectorAll('#wiki pre.hljs').forEach(pre => {
    const button = document.createElement('button');
    button.textContent = COPY_TEXT;
    button.className = 'clipboard-btn';
    button.addEventListener('click', () => {
      try {
        const code = pre.querySelector('code');
        const text = code.textContent;
        navigator.clipboard.writeText(text);
        button.textContent = COPY_SUCCESS_TEXT;
        setTimeout(() => {
          button.textContent = COPY_TEXT;
        }, 1000);
      } catch (error) {
        alert(`${COPY_ERROR_TEXT}\n\n${error.message}`);
      }
    });
    pre.appendChild(button);
  });
})();
