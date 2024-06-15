import yts from 'youtube-search-api'

const dat = await yts.GetListByKeyword("hatuskoi gotoubun no")

console.log(dat.items)