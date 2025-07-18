// ==UserScript==
// @name         [Saaske - Home] アカウント自動発行
// @namespace    https://my.saaske.com/
// @version      1.0.0
// @description  アカウントを自動発行
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://my.saaske.com/home/cgi/*
// ==/UserScript==


(function() {
    const doit = function(){
        console.log('do!!');
        // アラート
        const realConfirm = window.confirm;
        window.confirm = function() {
            window.confirm = realConfirm;
            return true;
        };
        // チェック
        const account_list_json = sessionStorage.getItem('account_list');
        if (account_list_json == null || account_list_json == '[]') {
            console.log('終了！！', new Date());
            //clearInterval(timer);
            return;
        }
        // ボタンでそれぞれの処理を行う
        const $new = $('input[name="new"]');
        const $add = $('#main > form > div > input[type=submit]:nth-child(2)');
        const $bac = $('#main > div > form > input[type=submit]:nth-child(1)');
        if ($add.length) {
            console.log('アカウントの新規作成');
            // 変換
            const account_list_array = JSON.parse(account_list_json);
            const account_list_length = account_list_array.length;
            console.log('残', account_list_length);
            // 取り出し
            const account_list = account_list_array.shift();
            console.log('account_list', account_list);
            console.log('account_list_array', account_list_array);
            console.log('account_list_array.length', account_list_array.length);
            // 残りを保存
            sessionStorage["account_list"] = JSON.stringify(account_list_array);
            // 書き込み＆クリック
            const fnc = (trg, txt) => $(`[name=${trg}]`).val(txt);
            fnc('ac_name',  account_list.name);
            fnc('ac_id',    account_list.id);
            fnc('ac_pass',  account_list.pass);
            fnc('ac_pass2', account_list.pass);
            fnc('ac_email', account_list.email);
            if(/ユーザ/.test(account_list.authorize)) fnc('ac_authorize','0');
            $('[name=ac_section] option').each((i, e) => {
                if($(e).text() == account_list.section) fnc('ac_section',$(e).val());
            });
            if(/有/.test(account_list.mobile)) $('[name=ac_mobile]').prop('checked', true);
            (/男/.test(account_list.icon)) ? fnc('ac_icon','icon01') : fnc('ac_icon','icon11');
            $add.click();
        } else if ($new.length) {
            console.log('現在登録済みのアカウント');
            $new.click();
        } else if ($bac.length) {
            console.log('登録が完了しました');
            $bac.click();
        }
    };
    setTimeout(doit, 500);
    //const timer = setInterval(doit, 500);
})();

/*
name	id	pass	email	authorize	section	mobile	icon

=CLEAN(
"{"""&$A$1&""":"""&$A2&""",
"""&$B$1&""":"""&$B2&""",
"""&$C$1&""":"""&$C2&""",
"""&$D$1&""":"""&$D2&""",
"""&$E$1&""":"""&$E2&""",
"""&$F$1&""":"""&$F2&""",
"""&$G$1&""":"""&$G2&""",
"""&$H$1&""":"""&$H2&"""
},"
)
*/

/*
var obj = [
{"name":"あああ","section":"東京支社","email":"AAA@saaske.com","icon":"男性","authorize":"システム管理者","id":"AAA@saaske.com","pass":"AAA","mobile":"有",},
{"name":"いいい","section":"東京支社","email":"BBB@saaske.com","icon":"女性","authorize":"ユーザー","id":"BBB@saaske.com","pass":"BBB","mobile":"有",},
{"name":"ううう","section":"東京支社","email":"CCC@saaske.com","icon":"男性","authorize":"ユーザー","id":"CCC@saaske.com","pass":"CCC","mobile":"有",}
];
var json_text = JSON.stringify(obj);
sessionStorage.setItem("account_list" , json_text);
*/

/*
// A1セル
1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
// パスワード 12文字
=CONCATENATE(
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1),
MID($A$1,(RANDBETWEEN(1,LENB($A$1))),1))
*/