// ==UserScript==
// @name         [Saaske] ファビコン変更
// @namespace    https://my.saaske.com/
// @version      1.0.0
// @description  ファビコンをサービス毎に変更
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://*.saaske.com/*
// @match        https://*.work-s.app/*
// ==/UserScript==

(function() {
    'use strict';
    let num = 0
    let timer = null
    const FAVICON = {
        // main
        "admin": "admin",
        "lead": "lead",
        "sfa": "salse",
        "telapo": "telapo",
        "works": "works",
        // option
        "web": "web",
        "tracking": "tracking",
        "cti": "cti",
        "cti_call": "cti_call",
        "scan": "scan",
        "api": "api",
        // cgi
        "cgibin2": "cgi-bin2",
        "technology": "technology",
    }
    const replaceFavicon = (elms, favicon) => {
        for (let i = 0, n = elms.length; i < n; i++) elms[i].href = favicon
        num++
        timer = setTimeout(faviconCheck, 5000, favicon)
        if (num > 5) clearTimeout(timer)
    }
    const faviconCheck = (favicon) => {
        const elms1 = document.querySelectorAll('[rel="shortcut icon"]')
        const elms2 = document.querySelectorAll('[rel="icon"]')
        if (elms1.length) replaceFavicon(elms1, favicon)
        if (elms2.length) replaceFavicon(elms2, favicon)
        if (!elms1.length && !elms2.length) {
            const link = document.createElement('link')
            link.setAttribute('type', 'image/x-icon')
            link.setAttribute('rel', 'icon')
            link.setAttribute('href', favicon)
            document.getElementsByTagName('head')[0].append(link)
        }
    }
    const getParam = (name, param) => {
        name = name.replace(/[\[\]]/g, '\\$&')
        const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`)
        const results = regex.exec(param)
        if (!results) return null
        if (!results[2]) return ''
        return decodeURIComponent(results[2].replace(/\+/g, ' '))
    }
    const pathname = location.pathname
    const directory = pathname.split('/')[1].replace(/[\t\-]/, '')
    const param = location.search
    const taskParam = getParam('task', param)
    const target =
          (taskParam === 'cti') ? `${directory}_call` :
          (/admin.work-s.app/.test(location.href)) ? 'works' : directory
    const favicon = FAVICON[target]
    const log = {
        'pathname': pathname,
        'directory': directory,
        'param': param,
        'taskParam': taskParam,
        'target': target,
        'favicon': favicon,
    }
    console.log(log)
    if (favicon) faviconCheck(`https://wineak.github.io/tampermonkey/ssk/images/${favicon}.png`)
})()