// ==UserScript==
// @name         サスケ・アカウント数を出す！
// @namespace    https://my.saaske.com/
// @version      0.2
// @description  none
// @author       wineAk
// @match        https://my.saaske.com/*/cgi/index.cgi?task=report*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // セッションの呼び出し
    const SESSION = getSessionStorage();
    // ボタン（1ページ目ならボタンを追加。2ページ目以降でセッションがあれば自動処理を行う）
    const button = document.createElement('button');
    button.textContent = 'アカウント合計 算出';
    button.id = 'total-accounts';
    button.onclick = function() {
        const res = confirm('実行しますか？');
        if (res) saveSessionStorage();
    };
    const params = location.search.substring(1).split('&');
    const buttonTrg = document.querySelector('#contents');
    console.log('params',params);
    if (params.indexOf('tab=1') >= 0 || params.length === 1 && params[0] === 'task=report') {
        buttonTrg.parentNode.insertBefore(button, buttonTrg);
        sessionStorage.removeItem('accounts'); // 初期化
    } else if (SESSION.length > 0) {
        saveSessionStorage();
    }
    // セッションの保存＆次のページへ送る or CSVダウンロード
    function saveSessionStorage() {
        // アカウント数を取得
        const pickup = document.querySelectorAll('.pickup');
        const accounts = Array.from(pickup).map(function(e) {
            const text = e.querySelector('td:nth-child(1) > b > a').textContent;
            return Number(text);
        });
        const concat_session = SESSION.concat(accounts);
        sessionStorage.accounts = JSON.stringify(concat_session);
        const total = Array.from(concat_session).reduce(function(accumulator, currentValue) {
            return accumulator + currentValue
        });
        // ログ
        console.log('accounts', accounts);
        console.log('concat_session', concat_session);
        console.log('total', total);
        // 次のページへ
        const next = document.querySelector('.pagelink_b > a:last-child');
        if (next == null) {
            sessionStorage.accounts = [];
        } else {
            const nextText = next.textContent;
            if (/次の [0-9]+ 件/.test(nextText)) next.click();
        }
    }
    // セッションの配列を取得
    function getSessionStorage() {
        const session_subsc = sessionStorage.getItem('accounts');
        console.log('session_subsc', session_subsc);
        if (session_subsc == null || session_subsc == '') return []; // 1度も保存されていなければ空の配列を返す
        return JSON.parse(session_subsc);
    }
})();
