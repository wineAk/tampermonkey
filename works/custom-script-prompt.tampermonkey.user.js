// ==UserScript==
// @name         [Works] ChatGPT支援UI
// @namespace    https://*.works.app
// @version      1.0.4
// @description  ChatGPT支援UI（サイド一体型ロボットトグル iframe内要素選択対応版）
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://works.saaske.com
// @author       wineAk
// @match        https://*.works.app/*
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // 同一ウィンドウ内での二重実行防止
  if (window.self !== window.top || document.getElementById('chatgpt-assistant-toggle')) {
    return;
  }

  let selectedElements = [];
  let highlightBox;
  let isOpen = false;

  // --- サイドパネルの作成 ---
  const container = document.createElement('aside');
  container.id = 'chatgpt-assistant-container';
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    right: '-300px',
    width: '300px',
    height: '100%',
    zIndex: '99999',
    transition: 'right 0.3s ease',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    borderLeft: '2px solid #ccc',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  });

  const panel = document.createElement('section');
  Object.assign(panel.style, {
    width: '100%',
    height: '100%',
    color: '#000000',
    padding: '10px',
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
  document.body.appendChild(container);

  // --- 🤖 トグルボタン ---
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'chatgpt-assistant-toggle';
  toggleBtn.textContent = '🤖';
  Object.assign(toggleBtn.style, {
    width: '30px',
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
    transition: 'right 0.3s ease',
  });

  toggleBtn.onclick = () => {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.right = '0';
      toggleBtn.style.right = '300px';
    } else {
      container.style.right = '-300px';
      toggleBtn.style.right = '0';
    }
  };

  document.body.appendChild(toggleBtn);

  // イベントリスナーの登録
  const textarea = panel.querySelector('#gpt-question');
  panel.querySelector('#add-element').addEventListener('click', startElementSelection);
  panel.querySelector('#generate').addEventListener('click', generatePrompt);

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

    // 💡 1. イベントを登録する対象（メイン画面のdocument + 同一オリジンの全iframe内document）
    const documents = [document];
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        if (iframe.contentDocument) {
          documents.push(iframe.contentDocument);
        }
      } catch (e) {
        // クロスオリジン等でアクセス拒否されるiframeは安全にスキップ
      }
    });

    // 💡 2. 要素と「メインウィンドウ基準」の絶対座標を計算するヘルパー関数
    function getActualRectAndElement(e, doc) {
      const win = doc.defaultView;
      const el = doc.elementFromPoint(e.clientX, e.clientY);
      if (!el) return null;

      const rect = el.getBoundingClientRect();
      let top = rect.top;
      let left = rect.left;

      // 親ウィンドウを最上位(window.top)まで遡り、iframeの配置座標を合算していく
      let curWin = win;
      while (curWin !== window.top) {
        const iframeEl = curWin.frameElement;
        if (!iframeEl) break;
        const iframeRect = iframeEl.getBoundingClientRect();
        top += iframeRect.top;
        left += iframeRect.left;
        curWin = curWin.parent;
      }

      // 最後にメイン画面のスクロール量を足して絶対座標にする
      top += window.top.scrollY;
      left += window.top.scrollX;

      return {
        element: el,
        rect: { top, left, width: rect.width, height: rect.height }
      };
    }

    const mousemove = e => {
      const doc = e.currentTarget;
      const res = getActualRectAndElement(e, doc);
      if (!res) return;
      const { element: el, rect } = res;

      // iframe要素自体へのホバーは、内部ドキュメント側のイベントに任せるためスキップ
      if (el.tagName === 'IFRAME') return;
      if (container.contains(el) || toggleBtn.contains(el)) return;

      Object.assign(highlightBox.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    };

    const click = e => {
      const doc = e.currentTarget;
      const res = getActualRectAndElement(e, doc);
      if (!res) return;
      const { element: el } = res;

      if (el.tagName === 'IFRAME') return;
      if (container.contains(el) || toggleBtn.contains(el)) return;

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
      if (highlightBox) highlightBox.remove();
      documents.forEach(doc => {
        doc.removeEventListener('mousemove', mousemove);
        doc.removeEventListener('click', click, true);
      });
      document.removeEventListener('keydown', esc);
    };

    // すべての対象ドキュメントにイベントをバインド
    documents.forEach(doc => {
      doc.addEventListener('mousemove', mousemove);
      doc.addEventListener('click', click, true);
    });
    document.addEventListener('keydown', esc);
  }

  function redrawElementList() {
    const list = panel.querySelector('#element-list');
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

    navigator.clipboard.writeText(prompt).then(() => {
      window.open(`https://chat.openai.com/?clipboard`, '_blank');
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗しました: ', err);
      alert('コピーに失敗しました。手動でコピーしてください。');
    });
  }
})();