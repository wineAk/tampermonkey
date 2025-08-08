// ==UserScript==
// @name         [Saaske - Salse] タブを追加
// @namespace    https://my.saaske.com/
// @version      1.0.1
// @description  タブを追加
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://my.saaske.com/sfa/cgi/*
// ==/UserScript==

(() => {
    const titleElm = document.querySelector('[title="c00029295"]')
    if (titleElm == null) return
    const projectsElms = document.querySelectorAll('[rel="projects_detail"]')
    if (projectsElms == null) return
    projectsElms.forEach(elm => {
        const text = elm.innerText
        const isTarget = (_=>{
            if (/^\[完了\]/.test(text)) return false
            if (/(サスケ|職人).*?(サポート|ｻﾎﾟｰﾄ)/.test(text)) return true
            if (/(サポート|ｻﾎﾟｰﾄ).*?(サスケ|職人)/.test(text)) return true
            return false
        })()
        if (isTarget) {
            // ClassNameを追加
            const headElm = elm.closest('.project')
            headElm.classList.add('saaske_support')
            // タブを作成
            const tdElm = document.createElement('td')
            const newElm = elm.cloneNode(true)
            newElm.innerText = text.replace(/^\[.*?\]|\(.*?\)$/g, '').replace(/ｻﾎﾟｰﾄ/, 'サポート').trim()
            tdElm.appendChild(newElm)
            tdElm.classList.add('tab_support', 'send_tab')
            const storageElm = document.querySelector('.storage')
            storageElm.after(tdElm)
        }
    })
    const style = document.createElement('style');
    style.textContent = `
      .detail_tab .send_tab.tab_support {
          background-color: #E84855;
      }
      .detail_tab .send_tab.tab_support a {
          padding: 0 10px;
          display: flex;
          align-items: center;
      }
      /* タブを綺麗に並べる */
      .detail_tab tr {
          display: flex;
      }
      .detail_tab .send_tab {
          position: unset;
      }
      .detail_tab td:not([width="90"]) + [width="90"] {
          margin-left: auto;
      }
    `;
    document.head.appendChild(style);
})()