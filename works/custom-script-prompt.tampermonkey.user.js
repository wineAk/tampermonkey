// ==UserScript==
// @name         [Works] ChatGPT支援UI
// @namespace    https://*.works.app
// @version      1.0.0
// @description  ChatGPT支援UI（サイド一体型ロボットトグル 完全動作版）
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://*.works.app
// @author       wineAk
// @match        https://*.works.app/*
// ==/UserScript==

(function () {
  'use strict';

  let selectedElements = [];
  let highlightBox;
  let isOpen = false;

  // 💡 detail に overflow-x: visible を追加
  const detail = document.getElementById('detail');
  if (detail) detail.style.overflowX = 'visible';

  // --- サイドパネルを detail に追加 ---
  const container = document.createElement('aside');
  Object.assign(container.style, {
    width: '0',
    transition: 'width 0.3s ease',
  });
  const panel = document.createElement('section');
  Object.assign(panel.style, {
    width: '300px',
    height: '100%',
    backgroundColor: '#ffffff',
    color: '#000000',
    borderLeft: '2px solid #ccc',
    padding: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    fontFamily: 'sans-serif',
    overflowY: 'auto',
    margin: '0',
    boxSizing: 'border-box',
  });

  panel.innerHTML = `
    <h3 style="margin-top: 0;">ChatGPT質問</h3>
    <textarea id="gpt-question" rows="5" style="width: 100%; height:calc(100% - 200px); background: #fff; font-family: monospace; resize: none; display: block; box-sizing: border-box;"></textarea>
    <div id="element-scroll-wrapper" style="height: 120px; overflow-y: auto; border: 1px solid #ccc; padding: 4px; margin-top: 10px; background: #f9f9f9;">
      <ul id="element-list" style="padding-left: 0; margin: 0; list-style: none;"></ul>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 10px; gap: 5px;">
      <button id="add-element" style="background:#ddd; color:black; border:none; padding:4px 8px; border-radius:4px; font-size: 12px; cursor: pointer;">➕ 要素を選択</button>
      <button id="generate" style="background:#10a37f; color:white; border:none; padding:4px 8px; border-radius:4px; font-size: 12px; cursor: pointer;">📋 コピーして開く</button>
    </div>
  `;
  container.appendChild(panel);
  detail?.appendChild(container);

  // --- 🤖 トグルボタン ---
  const toggleBtn = document.createElement('div');
  toggleBtn.textContent = '🤖';
  Object.assign(toggleBtn.style, {
    width: '20px',
    height: '60px',
    background: '#10a37f',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: '60px',
    cursor: 'pointer',
    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
    userSelect: 'none',
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
    position: 'fixed',
    top: 'calc(50% - 30px)',
    right: '0',
    zIndex: '100000',
  });

  toggleBtn.onclick = () => {
    isOpen = !isOpen;
    container.style.width = isOpen ? '300px' : '0';
  };

  document.body.appendChild(toggleBtn);

  // 残り：要素選択・リスト再描画・テキスト生成など（省略なし）
  const textarea = panel.querySelector('#gpt-question');

  window.addEventListener('load', () => {
    document.getElementById('add-element')?.addEventListener('click', startElementSelection);
    document.getElementById('generate')?.addEventListener('click', generatePrompt);
  });

  function startElementSelection() {
    if (highlightBox) highlightBox.remove();
    highlightBox = document.createElement('div');
    Object.assign(highlightBox.style, {
      position: 'absolute',
      backgroundColor: 'rgba(0, 153, 255, 0.3)',
      border: '2px solid #09f',
      zIndex: '99998',
      pointerEvents: 'none',
    });
    document.body.appendChild(highlightBox);

    const mousemove = e => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || container.contains(el)) return;
      const rect = el.getBoundingClientRect();
      Object.assign(highlightBox.style, {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    };

    const click = e => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || container.contains(el)) return;
      e.preventDefault();
      e.stopPropagation();
      selectedElements.push(el);
      redrawElementList();
      insertIntoTextarea(el, selectedElements.length);
      cleanup();
    };

    const esc = e => {
      if (e.key === 'Escape') cleanup();
    };

    const cleanup = () => {
      highlightBox.remove();
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('click', click, true);
      document.removeEventListener('keydown', esc);
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('click', click, true);
    document.addEventListener('keydown', esc);
  }

  function redrawElementList() {
    const list = document.getElementById('element-list');
    list.innerHTML = '';
    selectedElements.forEach((el, i) => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.marginBottom = '4px';

      const del = document.createElement('button');
      del.textContent = '❌';
      Object.assign(del.style, {
        marginRight: '8px',
        background: '#ddd',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '8px',
        height: '20px',
        width: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 1,
      });
      del.onclick = () => {
        selectedElements.splice(i, 1);
        redrawElementList();
      };

      const label = document.createElement('span');
      label.textContent = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`;

      li.appendChild(del);
      li.appendChild(label);
      list.appendChild(li);
    });
  }

  function insertIntoTextarea(el, index) {
    const textarea = document.getElementById('gpt-question');
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const label = `【要素${index}（${tag}${id}）】\n`;
    textarea.value += label;
  }

  function generatePrompt() {
    const question = textarea.value.trim();
    const labeledHTML = selectedElements.map((el, i) => {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      return `## 【要素${i + 1}（${tag}${id}）】\n${el.outerHTML}`;
    });
    const prompt = [
      "あなたはプロのシステムエンジニア兼プログラマーです。",
      "以下のHTMLを読み取り、JavaScriptのコードを作ります。",
      "作成するJavaScriptはブラウザ上で動作するコードです。",
      "外部モジュールは使わないで下さい。",
      "<script></script>タグは不要です。",
      "作成したコードに分かりやすいコメントを残してください。",
      "",
      "# 質問",
      question,
      "",
      "# HTMLの指定",
      labeledHTML.join('\n\n'),
    ].join("\n");

    GM_setClipboard(prompt);
    window.open(`https://chat.openai.com/?clipboard`, '_blank');
  }
})();
