// ==UserScript==
// @name         [Gmail] 本文をコピー
// @namespace    https://mail.google.com/
// @version      1.0.0
// @description  Gmailの各メールに「本文をコピー」ボタンを追加（複数対応）
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://mail.google.com
// @author       wineAk
// @match        https://mail.google.com/mail/*
// ==/UserScript==

(function () {
  'use strict';

  function getEmailBody(head) {
      const parent = head.closest('.adn');
      const emailBodyElement = parent?.querySelector('.a3s');
      return emailBodyElement ? emailBodyElement.innerText : '';
  }

  function createCopyButtonFor(head) {
      if (head.dataset.copyButtonAdded === 'true') return;

      const button = document.createElement('button');
      button.textContent = '📋 本文をコピー';
      button.className = 'gmail-copy-button';

      button.style.cssText = `
          height: 34px;
          width: 123px;
          border-radius: 18px;
          margin-top: 8px;
          box-shadow: none;
          border: 1px solid rgb(116, 119, 117);
          color: rgb(68, 71, 70);
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
      `;

      button.addEventListener('click', () => {
          const bodyText = getEmailBody(head);
          if (bodyText) {
              navigator.clipboard.writeText(bodyText).then(() => {
                  alert('メール本文をコピーしました。');
              }).catch(err => {
                  console.error('コピーに失敗しました: ', err);
              });
          } else {
              alert('メール本文が見つかりませんでした。');
          }
      });

      head.appendChild(button);
      head.style.display = 'flex';
      head.style.flexWrap = 'wrap';
      head.style.gap = '0rem 1rem';

      head.dataset.copyButtonAdded = 'true'; // ✅ これが重複防止の鍵！
  }

  function applyButtons() {
      const heads = document.querySelectorAll('.gE.iv.gt');
      heads.forEach((head) => {
          createCopyButtonFor(head);
      });
  }

  const observer = new MutationObserver(() => {
      applyButtons();
  });

  observer.observe(document.body, {
      childList: true,
      subtree: true,
  });
})();

