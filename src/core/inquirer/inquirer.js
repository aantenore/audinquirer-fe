import configurator from '../configurator/configurator'
import parser from '../parser/parser'
import pluralize from 'pluralize'


let statTemplate = {}
var config = {}
var output = {}

var setConfig = async () => {
    await configurator.getConfigJson(output => config = output).catch(e => { console.error('[inquirer.setConfig] Error for getConfigJson', process.env.VERBOSE === 'true' ? e : ""); throw e; })
    setLogMode()
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.setConfig] config props: ', config)
}

var setLogMode = () => {
    if (config.verbose !== true) {
        process.env.VERBOSE = false
    } else {
        process.env.VERBOSE = false
        console.log('Verbose mode')
    }
    if (!config.extendedLogs === true) {
        process.env.EXTENDEDLOGS = false
    } else {
        process.env.EXTENDEDLOGS = true
        console.log('Extended logs mode')
    }
}

var getBooks = async (url, name) => {
    let result;
    await parser.getBooks(url, config.DO_SCREEN_AUDIBLE && name).then(res => result = res.data).catch(e => { console.error('[inquirer.getBooks] Error for getBooks', process.env.VERBOSE === 'true' ? e : ""); throw e; })
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.getBooks] books: ', result)
    return result
}

var getBooksDetails = async (urls, name) => {
    let result
    await parser.getBookDetails(urls, config.DO_SCREEN_AMAZON && name).then(res => result = res.data).catch(e => {
        console.error('[inquirer.getBookDetails] Error for getBookDetails', process.env.VERBOSE === 'true' ? e : "");
        throw e;
    })
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.getBookDetails] book details :', result)
    return result
}


var getBookUrls = async (urls, name) => {
    let result
    await parser.getBookUrl(urls, config.DO_SCREEN_AMAZON && name).then(res => result = res.data).catch(e => { console.error('[inquirer.getBookUrl] Error for getBookUrl', process.env.VERBOSE === 'true' ? e : ""); throw e; })
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.getBookUrl] book url: ', result)
    return result
}

var getBookHaveBulletPointInDescription = async (url) => {
    let result
    await parser.getBookHaveBulletPointInDescription(url).then(res => result = res.data).catch(e => { console.error('[inquirer.getBookHaveBulletPointInDescription] Error for getBookHaveBulletPointInDescription', process.env.VERBOSE === 'true' ? e : ""); throw e; })
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.getBookHaveBulletPointInDescription] bookHaveBulletPointInDescription: ', result)
    return result
}


var processKeyword = async (keyword, goToProgressBarState = () => { }, keywordIndex = 0, totalKeywords = 1, setMessage) => {
    console.log('[inquirer.processKeyword] keyword: ', keyword)
    setMessage('Processing keyword: ' + keyword)
    let audibleUrl = config.AUDIBLE_URL.replace('{searchString}', encodeURIComponent(keyword))

    let booksAndCompetitor = await getBooks(audibleUrl, `Search results on Audible: ${keyword}`)
    goToProgressBarState((keywordIndex + 1) / (totalKeywords) * 33)
    let books = booksAndCompetitor.books

    //
    setMessage('Retrieving book\'s details from Amazon for ' + keyword)
    let bookUrls = {}
    for (let bookIndex = 0; bookIndex < books.length; bookIndex++) {
        let book = books[bookIndex]
        let bookId = book.titleAU + ((book.subTitleAU) ? (' ' + book.subTitleAU) : '') + ((book.authorAU) ? (' ' + book.authorAU) : '')
        let amazonSearchUrl = config.AMAZON_URL.replace('{searchString}', encodeURIComponent(bookId)).replace('{searchType}', 'audible')
        console.log('[inquirer.processBook] book: ', bookId)
        bookUrls[bookId]=amazonSearchUrl
    }

    let amazonBookUrls = await getBookUrls(bookUrls, `Search results on Amazon`)
    goToProgressBarState((keywordIndex + 1) / (totalKeywords) * 33)
    setMessage('Processing books for ' + keyword)
    setMessage('Retrieving book\'s details from Audible for ' + keyword)
    let details = await getBooksDetails(amazonBookUrls, `Book page on Amazon`)
    goToProgressBarState((keywordIndex + 1) / (totalKeywords) * 33)
    output[keyword] = output[keyword] ? output[keyword] : {}

    for (let bookIndex = 0; bookIndex < books.length; bookIndex++) {
        let book = books[bookIndex]
        let bookId = book.titleAU + ((book.subTitleAU) ? (' ' + book.subTitleAU) : '') + ((book.authorAU) ? (' ' + book.authorAU) : '')
        output[keyword][bookId] = { ...details[bookId], ...book }
    }
    //
    output[keyword]['competitors'] = booksAndCompetitor.competitorsAU
}


var processOutput = async (myName) => {

    let result = {}
    console.log('output: ', output)
    let keys = Object.keys(output)
    for (var i = 0; i < keys.length; i++) {
        let keyword = keys[i]
        let stat = { ...statTemplate }
        let day30 = 2592000000
        let booksAndCompetitor = output[keyword]
        let tempCompetitors = Array.from(booksAndCompetitor['competitors'] ? booksAndCompetitor['competitors'].replace('.', '').replace(',', '').matchAll(/[0-9]+/g) : [])
        let competitors = (tempCompetitors && tempCompetitors.length > 0) ? parseInt(tempCompetitors[tempCompetitors.length - 1]) : 0
        stat.C = competitors
        let bookIds = Object.keys(booksAndCompetitor).filter(key => key !== 'competitors')
        for (var j = 0; j < bookIds.length; j++) {
            let bookId = bookIds[j]
            let bookDetails = booksAndCompetitor[bookId]
            let title = bookDetails['titleAU']
            let bsrTemp = bookDetails['bsrAM'] && bookDetails['bsrAM'][0] ? bookDetails['bsrAM'][0].match(/(?<=#)(.*)(?= in Audible Books & Originals \()/) : []
            let bsr = bsrTemp && bsrTemp.length > 0 ? parseInt(bsrTemp[0].replace('.', '').replace(',', '')) : -1
            let releaseDate = Date.parse(bookDetails['releaseDateAM'])
            let reviewsNumber = -1
            if (bookDetails['reviewsAU'] === 'Not rated yet') {
                reviewsNumber = 0
            } else {
                let tempReviewsNumber = bookDetails['reviewsAU'] ? bookDetails['reviewsAU'].match(/[0-9]+/) : []
                reviewsNumber = tempReviewsNumber && tempReviewsNumber.length > 0 ? parseInt(tempReviewsNumber[0].replace(',', '')) : -1
            }
            let author = bookDetails['authorAM']
            let publisher = bookDetails['publisherAM']
            let narrator = bookDetails['narratorAM']
            let subTitle = bookDetails['subTitleAU']
            let isSelfPublished = publisher && publisher ? publisher.includes(author) : false
            let audibleLink = bookDetails['audibleUrlAU']
            let bsrLessThan30k = bsr < 30000 && bsr >= 0
            if (bsrLessThan30k) {
                stat.A++
            }
            if (bsr <= 15000 && bsr > 0 && (Date.now() - releaseDate > day30)) {
                stat.B++
            }
            if (Date.now() - releaseDate < day30) {
                stat.D++
            }
            /*if (bsrLessThan30k) {
                if (!isSelfPublished) {
                    let bookHaveBulletPointInDescriptionObj = await getBookHaveBulletPointInDescription(bookDetails.audibleUrlAU)
                    isSelfPublished = bookHaveBulletPointInDescriptionObj.bookHaveBulletPointInDescription
                }
                if (isSelfPublished)
                    stat.E++
            } else if (bsrLessThan30k) {
                stat.F.push(audibleLink)
            }*/
            if (bsrLessThan30k) {
                let splittedKeywordTemp = keyword.toLowerCase().split(" ")
                let splittedKeyword = []
                splittedKeywordTemp.map(word => splittedKeyword.push(pluralize.singular(word.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' '))))
                let bookInfo = [title ? title : '', subTitle ? subTitle : '', narrator ? narrator : '', author ? author : ''].join(" ").replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '')
                let bookInfoSingular = []
                bookInfo.split(" ").map(word => bookInfoSingular.push(pluralize.singular(word)))
                bookInfoSingular = bookInfoSingular.join(" ").toLowerCase()
                if (splittedKeyword.every(token => bookInfoSingular.includes(token))) {
                    stat.G++
                }
            }
            if (bsrLessThan30k && title && keyword && title.toLowerCase() === keyword.toLowerCase()) {
                stat.H++
            }
            if (author && myName && author.toLowerCase() === myName.toLowerCase()) {
                stat.I++
            }
            if (reviewsNumber < 100 && reviewsNumber >= 0) {
                stat.L++
            }
            if (bsrLessThan30k && (Date.now() - releaseDate > day30)) {
                stat.M++
            }
        }
        result[keyword] = stat
    }
    return result
}


var main = async (name, keywords = [], goToProgressBarState = () => { }, setMessage = () => { }) => {
    await setConfig()
    //await setKeywords()
    let errorKs = []
    let keywordPromises = []
    statTemplate = { ...config.template }
    let batchItems = 0
    let maxBatchSize = 5
    let batchSize = Math.min(maxBatchSize, keywords.length)
    for (let keywordIndex = 0; keywordIndex < keywords.length; keywordIndex++) {
        //if (batchItems < batchSize) {
        let keyword = keywords[keywordIndex]
        //keywordPromises.push(
        await processKeyword(keyword, goToProgressBarState, keywordIndex, keywords.length, setMessage).catch((e) => {
            console.error('[inquirer.main] Error for keyword: ', keyword, ', please retry', process.env.VERBOSE === 'true' ? e : "")
            errorKs.push(keyword)
        })
        //)
        /*batchItems++
        if (batchItems === batchSize) {
            await Promise.all(keywordPromises)
            batchItems = 0
            batchSize = Math.min(maxBatchSize, (keywords.length - keywordIndex - 1))
        }*/
        //}
    }
    setMessage('Finalizing, please wait some minutes')
    let stats = await processOutput(name)
    if (stats) {
        Object.keys(stats).map(k => {
            if (!keywords.includes(k)) {
                delete stats[k]
            }
            return k
        })
    }
    return {
        rows: [],
        stats: stats,
        errorKs: errorKs,
        keywords: keywords,
        statTemplate: statTemplate,
        config: config
    }
}


var inquirer = {
    inquire: main
    //updateKeywords: updateKeywordsIn
}

export default inquirer
