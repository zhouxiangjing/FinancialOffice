
export function generateOrderNumber () {
  const now = new Date()
  let year = now.getFullYear().toString()
  let month = (now.getMonth() + 1).toString().padEnd(2, '0')
  let day = now.getDate().toString().padEnd(2, '0')
  let hour = now.getHours().toString().padEnd(2, '0')
  let minutes = now.getMinutes().toString().padEnd(2, '0')
  let seconds = now.getSeconds().toString().padEnd(2, '0')
  return 'No' + year + month + day + hour + minutes + seconds + (Math.round(Math.random() * 23 + 100)).toString()
}

export function formatTimestamp (timestamp, format = 'yyyy-MM-dd hh:mm:ss') {
  const date = new Date(timestamp)
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  }
  let formatString = format
  if (/(y+)/.test(format)) {
    formatString = format.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length))
  }

  Object.keys(o).forEach((key) => {
    if (new RegExp(`(${key})`).test(format)) {
      formatString = formatString.replace(RegExp.$1, RegExp.$1.length === 1 ? o[key] : (`00${o[key]}`).substr(`${o[key]}`.length))
    }
  })
  return formatString
}

// 获取今天开始时间的时间戳
export function getDayStartDate () {
  let now = new Date()
  let nowDay = now.getDate()
  let nowMonth = now.getMonth()
  let nowYear = now.getFullYear()
  return new Date(nowYear, nowMonth, nowDay)
}

// 获取本周开始时间的时间戳
export function getWeekStartDate () {
  let now = new Date()
  let nowDayOfWeek = now.getDay()
  let nowDay = now.getDate()
  let nowMonth = now.getMonth()
  let nowYear = now.getFullYear()
  return new Date(nowYear, nowMonth, nowDay - nowDayOfWeek)
}

// 获取本月开始时间的时间戳
export function getMonthStartDate () {
  let now = new Date()
  let nowMonth = now.getMonth()
  let nowYear = now.getFullYear()
  return new Date(nowYear, nowMonth, 1)
}

// 获得本季度的开始月份
export function getQuarterStartMonth () {
  let now = new Date()
  let nowMonth = now.getMonth()
  let quarterStartMonth = 0
  if (nowMonth < 3) {
    quarterStartMonth = 0
  }
  if (nowMonth > 2 && nowMonth < 6) {
    quarterStartMonth = 3
  }
  if (nowMonth > 5 && nowMonth < 9) {
    quarterStartMonth = 6
  }
  if (nowMonth > 8) {
    quarterStartMonth = 9
  }
  return quarterStartMonth
}

// 获得本季度的开始日期
export function getQuarterStartDate () {
  let now = new Date()
  let nowYear = now.getFullYear()
  return new Date(nowYear, getQuarterStartMonth(), 1)
}
