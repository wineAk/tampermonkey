// ==UserScript==
// @name         [Jobcan] 残業時間
// @namespace    https://ssl.jobcan.jp/
// @version      1.0.0
// @description  残業時間
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jobcan.jp
// @author       wineAk
// @match        https://ssl.jobcan.jp/employee/attendance
// ==/UserScript==

(function() {
  'use strict';

  // Your code here...
  document.querySelectorAll('#search-result > div.table-responsive.text-nowrap > table > tbody > tr').forEach(trElm => {
      const tdElm = trElm.querySelector('td:nth-child(8)')
      const hhmm = tdElm.innerText.split(":")
      const [hh, mm] = hhmm
      const isOver = Number(hh) >= 1 || Number(mm) >= 15
      if (isOver){
          tdElm.style.boxShadow = "inset -2px -2px 0px 0px rgba(255, 0, 0, 1), inset 2px 2px 0px 0px rgba(255, 0, 0, 1);"
           tdElm.style.color = "rgba(255, 0, 0, 1)"
          console.log(hhmm)
      }
  })
})();