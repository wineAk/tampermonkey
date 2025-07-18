// ==UserScript==
// @name         [Saaske - Salse] 案件クリックでページ上部へスクロール
// @namespace    https://my.saaske.com/
// @version      1.0.0
// @description  案件クリックでページ上部へスクロール
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://my.saaske.com/sfa/cgi/*
// ==/UserScript==

(() => {
  const projectsElms = document.querySelectorAll('[rel="projects_detail"]')
  if (projectsElms == null) return
  const opt = { top: 0, behavior: 'smooth' }
  projectsElms.forEach(e => e.addEventListener('click', _ => window.scroll(opt)))
})()