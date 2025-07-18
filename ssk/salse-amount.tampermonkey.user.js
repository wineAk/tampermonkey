// ==UserScript==
// @name         [Saaske - Salse] 月額表のJSON取得
// @namespace    https://my.saaske.com/
// @version      1.0.0
// @description  固定売上集計からJSONを取得
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://my.saaske.com/sfa/cgi/*
// ==/UserScript==

(() => {

  // 特定のURL以外は処理しない
  const params = location.search.substring(1).split('&');
  const isAggrigate = params.includes('task=aggrigate');
  const isSalesMonth = params.includes('action=sales_month');
  if (!isAggrigate && !isSalesMonth) return;

  // ボタンを追加
  const button = document.createElement('button');
  button.textContent = 'JSON取得';
  button.title = "v2.0.0";
  button.onclick = _ => {
    const json = getProjectData();
    navigator.clipboard.writeText(json).then(_ => alert('JSONをコピーしました'));
  }
  document.querySelector('#main > table > caption').appendChild(button);

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

  /**
   * @typedef {Object} ProjectData
   * @property {string} saaske_code - サスケ顧客番号
   * @property {string} project_code - 整理番号
   * @property {string} company - 会社名
   * @property {number} amount - 金額
   * @property {string} project_name - 案件名
   * @property {string} project_name_company - 案件名内の会社名
  */

  /**
   * テーブル行から案件情報を抽出して返却
   *
   * @param {NodeListOf<HTMLTableRowElement>} trElms - 対象となるテーブル行
   * @returns {ProjectData[]} - 抽出された案件情報のリスト
   */
  function parseProjectTableRows(trElms) {
    const trArray = Array.from(trElms);
    const lists = trArray.map(elm => {
      // 合計の行は除外
      if (elm.classList.contains("sum")) return;
      const aElm = elm.querySelector("th:first-child > a:first-child");
      const url = aElm?.href ?? "";
      // サスケ顧客番号
      const saaske_code = getUrlParamValue(url, "dt_code") || "";
      // 整理番号
      const project_code = getUrlParamValue(url, "projects") || "";
      // 会社名
      const company = aElm?.textContent?.replace(/\n.+/g, '').trim() ?? "";
      // 金額
      const amountElm = elm.querySelector("td:nth-child(9)");
      const amount = amountElm ? Math.round(Number(amountElm.textContent.replace(/[\\,]/g, ""))) : 0;
      // 案件名
      const projectNameElm = elm.querySelector("td:nth-child(3)");
      const project_name = projectNameElm ? projectNameElm.textContent.replace(/\n.+/g, '').trim() : "";
      // 案件名内の会社名
      const project_name_company = project_name.match(/（(.+)）/)?.[1] ?? "";
      // 返却
      return { saaske_code, project_code, company, amount, project_name, project_name_company };
    });
    const filteredLists = lists.filter(Boolean);
    return filteredLists;
  }

  /**
   * テーブル行を取得し、案件情報を抽出
   *
   * @returns {string} - 案件情報のJSON文字列
   */
  function getProjectData() {
    const trElms = document.querySelectorAll("#main > table > tbody > tr");
    const lists = parseProjectTableRows(trElms);
    const json = JSON.stringify(lists, null, 2);
    return json;
  }

})()