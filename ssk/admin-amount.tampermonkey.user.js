// ==UserScript==
// @name         [Saaske - Admin] 月額表のJSON取得
// @namespace    https://my.saaske.com/
// @version      1.0.1
// @description  月額表のJSON取得
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://*.saaske.com/*/cgi/index.cgi?task=bill*
// ==/UserScript==

(() => {

  // 特定のURL以外は処理しない
  const params = location.search.substring(1).split('&');
  const button = document.createElement('button');
  button.title = "v1.0.1";
  button.style.backgroundColor = "#2FA5CA";
  button.style.color = "#FFF";
  button.style.borderRadius = "0.5rem";
  button.style.border = "none";
  button.style.cursor = "pointer";
  if (params.includes('task=bill') && params.includes('bl_kind=1') || params.includes('bl_kind=2')) {
      button.textContent = 'TSV取得'
      button.onclick = _ => navigator.clipboard.writeText(getTsvData()).then(_ => alert('TSVをコピーしました'))
      document.querySelector('#contents > .tab_box').appendChild(button)
  } else if (params.includes('task=bill') && params.length == 1 || params.includes('tab=1') || params.includes('action=')) {
      button.textContent = 'JSON取得'
      button.onclick = _ => navigator.clipboard.writeText(getJsonData()).then(_ => alert('JSONをコピーしました'))
      document.querySelector('#contents > .tab_box').appendChild(button)
      // 先月以外の請求書は分かりやすくする
      document.querySelectorAll('#contents > table > tbody > tr:not(.pickup) > th').forEach(elm => {
        const givenDate = elm.innerText
        // 今日の日付から、先月末を作成
        const today = new Date()
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        const yyyy = lastDayOfLastMonth.getFullYear()
        const mm = String(lastDayOfLastMonth.getMonth() + 1).padStart(2, '0') // 月は0始まり
        const dd = String(lastDayOfLastMonth.getDate()).padStart(2, '0')
        const lastDate = `${yyyy}-${mm}-${dd}`;
        // 先月じゃないのは赤くする
        if (givenDate !== lastDate) {
          elm.style.background = '#ffc5c5'
          elm.style.color = 'red'
        }
      })
  }

  /**
   * URLから指定されたクエリパラメータの値を返却
   *
   * @param {string} url - 案件URL（例：https://example.com?foo=bar）
   * @param {string} param - パラメータ名（例：foo）
   * @returns {string | null} - パラメータ値（例：bar）
   */
  function getUrlParamValue(url, param) {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get(param);
  }

  // 処理
  function getJsonData() {
    const listElms = document.querySelectorAll('#contents > table > tbody > .pickup');
    const lists = Array.from(listElms).map(elm => {
      const aElm = elm.querySelector('td:first-child > a:first-child');
      const url = aElm?.href ?? "";
      // 登録番号
      const cl_code = getUrlParamValue(url, "cl_code") || "";
      // 金額
      const amountElm = elm.querySelector('td:nth-child(6)');
      const amount = amountElm ? Math.round(Number(amountElm.textContent.replace(/[\\,]/g, '')) / 1.1) : 0;
      // 会社名
      const company = aElm?.textContent?.replace(/\n.+/g, '').trim() ?? "";
      // 返却
      return { cl_code, company, amount }
    })
    return JSON.stringify(lists)
  }

  function getTsvData() {
      let tsv = ''
      document.querySelectorAll('#contents > table > tbody > .pickup').forEach(elm => {
          const amount = Math.round(Number(elm.querySelector('td:nth-child(4)').textContent.replace(/[\\,]/g, '')))
          const company = elm.querySelector('td:first-child > a:first-child').textContent
          tsv += `${company}	${amount}\n`
      })
      return tsv
  }
})()