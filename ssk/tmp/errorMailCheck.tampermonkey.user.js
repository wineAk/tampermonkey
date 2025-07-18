// ==UserScript==
// @name         エラーメールチェック（管理画面）
// @namespace    https://my.saaske.com/
// @version      1.1
// @description  none
// @author       wineAk
// @match        https://*.saaske.com/*/cgi/index.cgi?task=return_mail&action=detail&rm_code=*
// @grant        none
// ==/UserScript==

(() => {
    const titleElm = document.querySelector('#contents > table:nth-child(4) > caption')
    const errorElm = document.querySelector('#contents > table:nth-child(4) > tbody > tr:nth-child(4) > td')
    if (!errorElm) return

    // エラー文章だけ抽出する処理
    const errorArray = errorElm.innerText.split('\n').filter(word => word.match(/^(\s+)?$/) == null) // 空欄は削除
    console.log('errorArray:', errorArray)
    const errorFilterArray = errorArray.filter(word => {
        // 日付、送信元ドメインがある場合配列は削除
        if (word.match(/\d{4} \d{2}:\d{2}:\d{2}/) || word.match(/\.saaske\.com/)) return false
        return true
    })
    console.log('errorFilterArray:', errorFilterArray)
    // RFCのエラーコード
    const errorCodeRFC = errorFilterArray.filter(word => word.match(/[45][01235]\d/))
    // オリジナルのエラーコード
    const errorCodeOriginal = errorFilterArray.filter(word => word.match(/[45]\.\d{1,2}\.\d{1,3}/))
    // テーブルに書き出し
    const createTableElm = (title, errors) => {
        const divElm = document.createElement('div')
        let tableDom = `<table cellspacing="1" cellpadding="2" border="0" class="table_detail" style="width: 960px;">`
        tableDom += `<caption align="top">${title}</caption><tbody>`
        tableDom += errors.map(e => {
            const text = (title, error) => {
                if (/RFC/.test(title)) {
                    /*
                    https://baremail.jp/blog/2021/02/25/1020/
                    https://doc.cloud.global.fujitsu.com/lib/iaas/jp/api-reference/v1/ap/concept_ap/C_msg_mail_responsecodes_0302020901.html
                    https://blastmail.jp/pdf/knowhow2.pdf
                    */
                    const errorText = 
                    // 4xx:一時的なエラー
                    // x0x:文法エラー
                    // x1x:ステータスやヘルプ要求への応答
                    // x2x:通信チャネルに関する応答
                    (/421/.test(error)) ? '宛先から拒否されました。<br>このホストのメール・サービスが利用できない、またはメール転送中にサーバがシャットダウンしたため通信チャネル（接続）を閉じる。' :
                    // x5x:受信側メールシステムの問題
                    (/450/.test(error)) ? '宛先のメールボックスが利用できません。<br>相手先のメールボックスが利用できない（ロックされているなど）ため、処理が実行できない。' :
                    (/451/.test(error)) ? '送信先のプロバイダーにお問合せください。処理中にエラーが発生しました。<br>処理中にエラーが発生したため、要求された処理が失敗した。<br>※多くの場合、受信側のサーバエラーが原因で発生。' :
                    (/452/.test(error)) ? '送信先のシステム容量がいっぱいです。' :
                    (/453/.test(error)) ? '送信先のプロバイダーにお問合せください。処理中にエラーが発生しました。' :
                    // 5xx:永続的なエラー
                    // x0x:文法エラー
                    (/500/.test(error)) ? '文法に間違いがある、もしくは行に対する文章が長すぎるため受け付けられません。' :
                    (/501/.test(error)) ? 'パラメータまたは引数の文法に誤りがあります。' :
                    (/502/.test(error)) ? '指定されたSMTPコマンドが実装されていない。' :
                    (/503/.test(error)) ? 'コマンドの発行順序が間違っています。' :
                    (/504/.test(error)) ? '指定されたSMTPコマンドのパラメータが実装されていない。' :
                    // x1x:ステータスやヘルプ要求への応答
                    // x2x:通信チャネルに関する応答
                    (/521/.test(error)) ? '送信先のメールボックスがいっぱいです。' :
                    // x3x:
                    (/530/.test(error)) ? '送信には暗号化が必要です。' :
                    // x5x:受信側メールシステムの問題
                    (/550/.test(error)) ? '宛先のメールボックスが存在しない、もしくはメールボックスが利用できないため、要求された処理は実行できない。' :
                    (/550.+reject/.test(error)) ? '送信先から受信拒否を受けました。' :
                    (/551/.test(error)) ? '送信先がありません。<br>受信者が存在しないため、[forward-path]で示されたアドレスへの転送を試す必要あり。' :
                    (/552/.test(error)) ? '送信先のメールボックスがいっぱい、またはシステムエラーが発生しています。' :
                    (/553/.test(error)) ? '送信先のメールボックスが利用できません。' :
                    (/554/.test(error)) ? '処理中にエラーが発生しました。送信先のプロバイダーにお問合せください。' :
                    ''
                    return `<p>${errorText}</p>`
                } else {
                    const errorText = 
                    (/550[ -]5.7.1/.test(error)) ? '中継が拒否されました' :
                    (/554[ -]5.0.0/.test(error)) ? 'サービスが利用できません' :
                    (/554[ -]5.7.1/.test(error)) ? '受信者アドレスが拒否されました' :
                    (/5.1.0/.test(error)) ? 'アドレスが拒否されました' :
                    (/5.7.26/.test(error)) ? 'セキュリティ上のリスクがありブロックされました' :
                    (/5.4.1/.test(error)) ? '受信者アドレスが拒否されました' :
                    (/4.2.2/.test(error)) ? '受信者のアカウント容量がオーバー' :
                    (/5.2.2/.test(error)) ? '受信者のアカウント容量がオーバー' :
                    (/5.0.0/.test(error)) ? '受信者のサーバー権限が不十分' :
                    (/5.6.0/.test(error)) ? 'データフォーマットエラー' :
                    (/5.7.13/.test(error)) ? '受信者のアドレスが無効化されている' :
                    (/5.1.1/.test(error)) ? 'ユーザーが存在しない' :
                    (/5.1.2/.test(error)) ? 'ホストが見つかりません' :
                    (/5.3.0/.test(error)) ? 'ユーザー不明' :
                    ''
                    return `<p>${errorText}</p>`
                }
                /*
        (/554 Mail from .* rejected for policy reasons/i.test(errorTxt)) ? '[554] ポリシー上の理由で拒否されました' :
        (/\(expanded from \): This address no longer accepts mail/i.test(errorTxt)) ? 'メールを受け付けなくなりました' :
        (/Permission denied/i.test(errorTxt)) ? 'アクセス拒否されました' :
        (/has been blocked/i.test(errorTxt)) ? 'ブロックされました' :
        
        (/mailbox for user is full/i.test(errorTxt)) ? 'メールボックスがいっぱいです' :
        (/Disk quota exceeded/i.test(errorTxt)) ? 'メールボックスがいっぱいです' :
        (/\(expanded from \): temporary failure/i.test(errorTxt)) ? '受信者のサーバーでエラーが発生' :
        (/Connection timed out with/i.test(errorTxt)) ? '接続がタイムアウトしました' :
        
        (/501[ -]unacceptable/.test(errorTxt)) ? '※ [501 unacceptable mail address] 受け入れ不可能なメールアドレス' :
        (/\(expanded from \): mail is not deliverable/i.test(errorTxt)) ? 'メールが配信できません' :
        
        (/the domain .* couldn't be found/i.test(errorTxt)) ? 'ドメインが見つかりませんでした' :
        (/This user doesn't have a .* account/i.test(errorTxt)) ? '該当アカウントを持っていません' :
        (/\(expanded from \): User unknown/i.test(errorTxt)) ? '不明なユーザー' :
        (/\(expanded from (<.+>)?\): unknown user/i.test(errorTxt)) ? '不明なユーザー' :
        (/The mail system: user unknown/i.test(errorTxt)) ? '不明なユーザー' :
        (/The mail system: unknown user/i.test(errorTxt)) ? '不明なユーザー' :
        (/Reason: unknown user/i.test(errorTxt)) ? '不明なユーザー' :
        (/550 Unknown user/i.test(errorTxt)) ? '[550] 不明なユーザー' :
        (/550 Invalid recipient/i.test(errorTxt)) ? '[550] 受信者のアドレスが無効化されている' :
        
        (/Will keep trying until message is \d days old/i.test(errorTxt)) ? '（お知らせ）メッセージを試行し続けます' :
        (/Message could not be delivered for \d days/i.test(errorTxt)) ? '（お知らせ）メッセージは配信されませんでした' :
        
        (/Reason: Delivery failed/i.test(errorTxt)) ? '配信に失敗しました' :
                */
            }
            return `<tr><td>${e}${text(title, e)}</td></tr>`
        }).join('')
        tableDom += '</tbody></table>'
        divElm.innerHTML = tableDom
        return divElm.firstElementChild
    }
    const errorElmRFC = createTableElm('errorCodeRFC [xxx]', errorCodeRFC)
    const errorElmORG = createTableElm('errorCodeOriginal [x.x.x]', errorCodeOriginal)
    document.querySelector('#contents > table').after(errorElmORG) // 先にオリジナルを入れる
    document.querySelector('#contents > table').after(errorElmRFC)
    //const errorCodeDivElm = document.createElement('div')
    //let errorCodeTableDom = '<table cellspacing="1" cellpadding="2" border="0" class="table_detail"><caption align="top">エラー解析</caption><tbody>'
    //errorCodeTableDom += `<tr><th>errorCodeRFC</th><td>${errorCodeRFC.map(e => `<p style="margin:.5rem 0;">${e}</p>`).join('')}</td></tr>`
    //errorCodeTableDom += `<tr><th>errorCodeOriginal</th><td>${errorCodeOriginal.map(e => `<p style="margin:.5rem 0;">${e}</p>`).join('')}</td></tr>`
    //errorCodeTableDom += '</tbody></table>'
    //errorCodeDivElm.innerHTML = errorCodeTableDom
    //document.querySelector('#contents > table').after(errorCodeDivElm.firstElementChild)
    /*
        const errorCode = errorFilterArray.filter(word => word.match(/\d{3}[ -]#?\d{1,3}\.\d{1,3}\.\d{1,3}/))
        const errorCodeParent = errorFilterArray.filter(word => word.match(/\d{3}/))
        const errorCodeChild = errorFilterArray.filter(word => word.match(/\d{1,3}\.\d{1,3}\.\d{1,3}/))
        console.log('errorCode:', errorCode[0])
        console.log('errorCodeParent:', errorCodeParent[0])
        console.log('errorCodeChild:', errorCodeChild[0])
        const tableParentElm = document.createElement('div')
        let tableElm = '<table cellspacing="1" cellpadding="2" border="0" class="table_detail"><caption align="top">エラー解析</caption><tbody>'
        tableElm += `<tr><th>errorCode</th><td>${errorCode[0]}</td></tr>`
        tableElm += `<tr><th>errorCodeParent</th><td>${errorCodeParent[0]}</td></tr>`
        tableElm += `<tr><th>errorCodeChild</th><td>${errorCodeChild[0]}</td></tr>`
        tableElm += '</tbody></table>'
        tableParentElm.innerHTML = tableElm
        document.querySelector('#contents > table').after(tableParentElm.firstElementChild)
    */

    const errorTxt = errorElm.textContent.replace(/\n/g, ' ').replace(/\n/g, ' ').replace(/ +/g, ' ')
    console.log('errorTxt:', errorTxt)
    const errorCause =
        // 拒否されているケース
        (/550[ -]#?5.1.0/.test(errorTxt)) ? '[550 5.1.0] アドレスが拒否されました' :
        (/550[ -]5.7.26/.test(errorTxt)) ? '[550 5.7.26] セキュリティ上のリスクがありブロックされました' :
        (/550[ -]5.4.1/.test(errorTxt)) ? '[550 5.4.1] 受信者アドレスが拒否されました' :
        (/550[ -]5.7.1/.test(errorTxt)) ? '[550 5.7.1] 中継が拒否されました' :
        (/554[ -]5.7.1/.test(errorTxt)) ? '[554 5.7.1] 受信者アドレスが拒否されました' :
        (/5.7.26/.test(errorTxt)) ? '[5.7.26] セキュリティ上のリスクがありブロックされました' :
        (/554 Mail from .* rejected for policy reasons/i.test(errorTxt)) ? '[554] ポリシー上の理由で拒否されました' :
        (/\(expanded from \): This address no longer accepts mail/i.test(errorTxt)) ? 'メールを受け付けなくなりました' :
        (/Permission denied/i.test(errorTxt)) ? 'アクセス拒否されました' :
        (/has been blocked/i.test(errorTxt)) ? 'ブロックされました' :
        // 相手方の問題
        (/452[ -]4.2.2/.test(errorTxt)) ? '[452 4.2.2] 受信者のアカウント容量がオーバー' :
        (/552[ -]5.2.2/.test(errorTxt)) ? '[552 5.2.2] 受信者のアカウント容量がオーバー' :
        (/550[ -]5.0.0/.test(errorTxt)) ? '[550 5.0.0] 受信者のサーバー権限が不十分' :
        (/mailbox for user is full/i.test(errorTxt)) ? 'メールボックスがいっぱいです' :
        (/Disk quota exceeded/i.test(errorTxt)) ? 'メールボックスがいっぱいです' :
        (/\(expanded from \): temporary failure/i.test(errorTxt)) ? '受信者のサーバーでエラーが発生' :
        (/Connection timed out with/i.test(errorTxt)) ? '接続がタイムアウトしました' :
        // 名前解決が出来てない？
        (/501[ -]5.6.0/.test(errorTxt)) ? '※ [501 5.6.0] データフォーマットエラー' :
        (/501[ -]unacceptable/.test(errorTxt)) ? '※ [501 unacceptable mail address] 受け入れ不可能なメールアドレス' :
        (/\(expanded from \): mail is not deliverable/i.test(errorTxt)) ? 'メールが配信できません' :
        // メアドが存在しないケース
        (/the domain .* couldn't be found/i.test(errorTxt)) ? 'ドメインが見つかりませんでした' :
        (/This user doesn't have a .* account/i.test(errorTxt)) ? '該当アカウントを持っていません' :
        (/\(expanded from \): User unknown/i.test(errorTxt)) ? '不明なユーザー' :
        (/\(expanded from (<.+>)?\): unknown user/i.test(errorTxt)) ? '不明なユーザー' :
        (/The mail system: user unknown/i.test(errorTxt)) ? '不明なユーザー' :
        (/The mail system: unknown user/i.test(errorTxt)) ? '不明なユーザー' :
        (/Reason: unknown user/i.test(errorTxt)) ? '不明なユーザー' :
        (/550 Unknown user/i.test(errorTxt)) ? '[550] 不明なユーザー' :
        (/550 Invalid recipient/i.test(errorTxt)) ? '[550] 受信者のアドレスが無効化されている' :
        (/525[ -]5.7.13/.test(errorTxt)) ? '[525 5.7.13] 受信者のアドレスが無効化されている' :
        (/550[ -]5.1.1/.test(errorTxt)) ? '[550 5.1.1] ユーザーが存在しない' :
        (/550[ -]5.1.2/.test(errorTxt)) ? '[550 5.1.2] ホストが見つかりません' :
        (/553[ -]5.3.0/.test(errorTxt)) ? '[553 5.3.0] ユーザー不明' :
        (/554[ -]5.0.0/.test(errorTxt)) ? '[554 5.0.0] サービスが利用できません' :
        // 再送系
        (/Will keep trying until message is \d days old/i.test(errorTxt)) ? '（お知らせ）メッセージを試行し続けます' :
        (/Message could not be delivered for \d days/i.test(errorTxt)) ? '（お知らせ）メッセージは配信されませんでした' :
        // それ以外
        (/Reason: Delivery failed/i.test(errorTxt)) ? '配信に失敗しました' :
        ''
    titleElm.textContent = errorCause
})()