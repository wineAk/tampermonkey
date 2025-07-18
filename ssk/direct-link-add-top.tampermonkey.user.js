// ==UserScript==
// @name         [Saaske - Salse] ダイレクトリンクを上部に
// @namespace    https://my.saaske.com/
// @version      1.0.0
// @description  ダイレクトリンクを上部に
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://my.saaske.com/sfa/cgi/*
// ==/UserScript==

(function() {
  'use strict';
  const direct_link = document.querySelector('div.direct_link a')
  if (direct_link == null) return
  const styleObject = {
      'cursor': 'pointer',
      'border-radius': '0.5rem',
      'background-color': '#003300',
      'float': 'left',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'width': '25px'
  }
  const style = Object.entries(styleObject).map(([key, value]) => `${key}:${value};`).join('')
  const href = direct_link.href
  const html = `<a href="${href}" class="jq_copy" style="${style}"><i class="fas fa-link" style="color:#fff"></i></a>`
  const span = document.createElement('span')
  span.innerHTML = html
  const h1 = document.querySelector('#contents > div.page_title > h1')
  h1.prepend(span)
})();