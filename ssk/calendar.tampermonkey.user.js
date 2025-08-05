// ==UserScript==
// @name         [Saaske] カレンダーの日付
// @namespace    https://my.saaske.com/
// @version      1.0.1
// @description  カレンダーの土日祝日に色を付ける
// @icon         https://www.google.com/s2/favicons?sz=64&domain=https://my.saaske.com
// @author       wineAk
// @match        https://my.saaske.com/*
// ==/UserScript==

(() => {
  // 日付項目の「項目キー」を記入
  const TARGET_ID = 'hasDatepicker'

  /**
   * スタイル
   */
  const style = `<style id="style_${TARGET_ID}">
:root {
--color-red-50: oklch(0.971 0.013 17.38);
--color-red-100: oklch(0.936 0.032 17.717);
--color-red-200: oklch(0.885 0.062 18.334);
--color-red-400: oklch(0.704 0.191 22.216);
--color-red-600: oklch(0.577 0.245 27.325);

--color-amber-50: oklch(0.987 0.022 95.277);
--color-amber-100: oklch(0.962 0.059 95.617);
--color-amber-200: oklch(0.924 0.12 95.746);
--color-amber-400: oklch(0.828 0.189 84.429);
--color-amber-600: oklch(0.666 0.179 58.318);

--color-pink-50: oklch(0.971 0.014 343.198);
--color-pink-100: oklch(0.948 0.028 342.258);
--color-pink-200: oklch(0.899 0.061 343.231);
--color-pink-400: oklch(0.718 0.202 349.761);
--color-pink-600: oklch(0.592 0.249 0.584);

--color-blue-50: oklch(0.97 0.014 254.604);
--color-blue-100: oklch(0.932 0.032 255.585);
--color-blue-200: oklch(0.882 0.059 254.128);
--color-blue-400: oklch(0.707 0.165 254.624);
--color-blue-600: oklch(0.546 0.245 262.881);
}
[title="日曜日"] {
color:var(--color-red-600) !important;
}
.calendar-sun span,
.calendar-sun a {
color:var(--color-red-600) !important;
background-image: linear-gradient(0deg, var(--color-red-200) 15%, var(--color-red-50) 50%, var(--color-red-100) 85%) !important;
border: 1px solid var(--color-red-400) !important;
}
[title="土曜日"] {
color:var(--color-blue-600) !important;
}
.calendar-sat span,
.calendar-sat a {
color:var(--color-blue-600) !important;
background-image: linear-gradient(0deg, var(--color-blue-200) 15%, var(--color-blue-50) 50%, var(--color-blue-100) 85%) !important;
border: 1px solid var(--color-blue-400) !important;
}
.calendar-hol span,
.calendar-hol a {
color:var(--color-pink-600) !important;
background-image: linear-gradient(0deg, var(--color-pink-200) 15%, var(--color-pink-50) 50%, var(--color-pink-100) 85%) !important;
border: 1px solid var(--color-pink-400) !important;
}
</style>`

  /**
   * 1桁の数値を2桁の文字列へ変更
   * @param {number} n 月(m)もしくは日(d)の数値
   * @return {string} 月(mm)もしくは日(dd)の文字列
   */
  function padding(n) {
      return (String(n).length === 1) ? `0${n}` : String(n)
  }

  /**
   * カレンダーを制御
   * @description 「Datepicker (jQuery UI) のカレンダーを制御できる配列」を返す関数
   * @type {function}
   * @param {date} date Datepickerから生成されたdate型
   * @return {[boolean, string, string]} [boolean(true:可, false:不可), string(class名), string(title属性)]
   */
  function getCalendarSetting(date, holidays) {
      const isHoliday = !/undefined/.test(typeof holidays)
      if (!isHoliday) console.error('エラー', 'holidays が正しくありません')
      const dateTxt = `${date.getFullYear()}-${padding(date.getMonth() + 1)}-${padding(date.getDate())}`
      const ary =
          // 祝日
          (isHoliday && holidays[dateTxt] != null) ? [true, 'calendar-hol', holidays[dateTxt]] :
          // 日曜日
          (date.getDay() === 0) ? [true, 'calendar-sun'] :
          // 土曜日
          (date.getDay() === 6) ? [true, 'calendar-sat'] :
          // それ以外
          [true]
      return ary
  }

  /*
  */
  async function setHolidays() {
      const response = await fetch('https://holidays-jp.github.io/api/v1/date.json')
      const holidays = await response.json()
      console.log('holidays', holidays)
      // 現在の値を保持しておく
      const $target = $(`.${TARGET_ID}`);
      const currentVal = $target.val();
      const today = new Date()
      const Y = today.getFullYear()
      const M = today.getMonth()
      const D = today.getDate()
      $(`.${TARGET_ID}`).datepicker('option', {
          // 来年の同月同日
          maxDate: `${Y + 1}/${M + 1}/${D}`,
          // 去年の同月同日
          minDate: `${Y - 1}/${M + 1}/${D}`,
          // 表示する際にスタイルシートを追加
          beforeShow: _ => document.head.insertAdjacentHTML('beforeEnd', style),
          // 閉じられた際にスタイルシートを削除
          onClose: _ => document.getElementById(`style_${TARGET_ID}`).remove(),
          // 日付ごとに処理を行う
          beforeShowDay: d => getCalendarSetting(d, holidays),
      })
      // 設定後に元の値を再代入
      if ($target.length > 0) $target.val(currentVal)
  }

  /**
  * TARGET_ID が存在するか監視
  */
  function callback(mutationList, observer) {
      // TARGET_IDが存在する？
      const targetList = mutationList.map(mutation => {
          const { target } = mutation
          const isTarget = target.querySelector(`.${TARGET_ID}`)
          return isTarget
      })
      const isTarget = targetList.some(value => value !== null)
      // カラーピッカーが存在する？
      const datepickerList = mutationList.map(mutation => {
          const { target } = mutation
          const isDatepicker = target.id === 'ui-datepicker-div'
          return isDatepicker
      })
      const isDatepicker = datepickerList.some(value => value)
      // ターゲットが存在する＆データピッカーが存在しない、時のみ実行
      if (isTarget && !isDatepicker) setHolidays()
  }
  const observer = new MutationObserver(callback)
  const config = { childList: true, subtree: true }
  observer.observe(document.body, config)
})()