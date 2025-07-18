// ==UserScript==
// @name         [B2] 管理画面に画像を一覧に出す
// @namespace    https://www.b2-online.jp/
// @version      1.0.0
// @description  管理画面に画像を一覧に出す
// @icon         https://www.google.com/s2/favicons?sz=64&domain=b2-online.jp
// @author       wineAk
// @match        https://www.b2-online.jp/ECM/event/cgi/admin.cgi
// ==/UserScript==

(function() {
  window.addEventListener("load", function() {
      const elm = document.querySelector('#application_list > tbody > tr > td:nth-child(12) > a')
      const href = elm.href
      elm.querySelector('img').src = href
      elm.querySelector('img').width = 60
      elm.querySelector('img').height = 89
  });
})();