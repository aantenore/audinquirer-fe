import configurator from '../configurator/configurator'
import parser from '../parser/parser'

let statTemplate = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    G: 0,
    H: 0,
    I: 0,
    L: 0,
    F: []
}

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
    await parser.getBooks(url, config.DO_SCREEN_AUDIBLE && name).then(res=>result=res.data).catch(e => { console.error('[inquirer.getBooks] Error for getBooks', process.env.VERBOSE === 'true' ? e : ""); throw e; })
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.getBooks] books: ', result)
    return result
}

var getBookDetails = async (url, name) => {
    let result
    await parser.getBookDetails(url, config.DO_SCREEN_AMAZON && name).then(res=>result=res.data).catch(e => {
        console.error('[inquirer.getBookDetails] Error for getBookDetails', process.env.VERBOSE === 'true' ? e : "");
        throw e;
    })
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.getBookDetails] book details :', result)
    return result
}


var getBookUrl = async (url, name) => {
    let result
    await parser.getBookUrl(url, config.DO_SCREEN_AMAZON && name).then(res=>result=res.data).catch(e => { console.error('[inquirer.getBookUrl] Error for getBookUrl', process.env.VERBOSE === 'true' ? e : ""); throw e; })
    if (process.env.EXTENDEDLOGS === 'true') console.log('[inquirer.getBookUrl] book url: ', result)
    return result
}


var processBook = async (book, keyword) => {
    let bookId = book.titleAU + ((book.subTitleAU) ? (' ' + book.subTitleAU) : '') + ((book.authorAU) ? (' ' + book.authorAU) : '')
    console.log('[inquirer.processBook] book: ', bookId)
    let amazonSearchUrl = config.AMAZON_URL.replace('{searchString}', encodeURIComponent(bookId)).replace('{searchType}', 'audible')
    let amazonBookUrl = await getBookUrl(amazonSearchUrl, `Search results on Amazon: ${book.titleAU}`)
    let details = await getBookDetails(amazonBookUrl, `Book page on Amazon: ${book.titleAU}`)
    output[keyword] = output[keyword] ? output[keyword] : {}
    output[keyword][bookId] = { ...details, ...book }
}


var processKeyword = async (keyword) => {
    console.log('[inquirer.processKeyword] keyword: ', keyword)
    let audibleUrl = config.AUDIBLE_URL.replace('{searchString}', encodeURIComponent(keyword))

    let booksAndCompetitor = await getBooks(audibleUrl, `Search results on Audible: ${keyword}`)
    let books = booksAndCompetitor.books

    for (let bookIndex = 0; bookIndex < books.length; bookIndex++) {
        let book = books[bookIndex]
        await processBook(book, keyword).catch(e => { console.error('[inquirer.processKeyword] processKeywordError for book: ', books[bookIndex].titleAU, '\n', e); throw e; })
    }
    output[keyword]['competitors'] = booksAndCompetitor.competitorsAU
}


var processOutput = (myName) => {

    let result = {}

    Object.keys(output).map(keyword => {
        let stat = { ...statTemplate }
        let day30 = 2592000000
        let booksAndCompetitor = output[keyword]
        let tempCompetitors = Array.from(booksAndCompetitor['competitors'] ? booksAndCompetitor['competitors'].replace('.', '').replace(',', '').matchAll(/[0-9]+/g) : [])
        let competitors = (tempCompetitors && tempCompetitors.length > 0) ? parseInt(tempCompetitors[tempCompetitors.length - 1]) : 0
        stat.C = competitors
        Object.keys(booksAndCompetitor).filter(key => key !== 'competitors').map(bookId => {
            let bookDetails = booksAndCompetitor[bookId]
            let title = bookDetails['titleAU']
            let bsrTemp = bookDetails['bsrAM'] && bookDetails['bsrAM'][0] ? bookDetails['bsrAM'][0].match(/(?<=#)(.*)(?= in Audible Books & Originals \()/) : []
            let bsr = bsrTemp && bsrTemp.length > 0 ? parseInt(bsrTemp[0].replace('.', '').replace(',', '')) : -1
            let releaseDate = Date.parse(bookDetails['releaseDateAM'])
            let tempReviewsNumber = bookDetails['reviewsAU'] ? bookDetails['reviewsAU'].match(/[0-9]+/) : []
            let reviewsNumber = tempReviewsNumber && tempReviewsNumber.length > 0 ? parseInt(tempReviewsNumber[0]) : -1
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
            if (bsrLessThan30k && isSelfPublished) {
                stat.E++
            } else if (bsrLessThan30k) {
                stat.F.push(audibleLink)
            }
            let splittedKeyword = keyword.toLowerCase().split(" ")
            if (splittedKeyword.every(token => title ? title.toLowerCase().includes(token) : false || subTitle ? subTitle.toLowerCase().includes(token) : false || narrator ? narrator.toLowerCase().includes(token) : false || author ? author.toLowerCase().includes(token) : false)) {
                stat.G++
            }
            if (bsrLessThan30k && title === keyword) {
                stat.H++
            }
            if (author === myName) {
                stat.I++
            }
            if (reviewsNumber < 100 && reviewsNumber >= 0) {
                stat.L++
            }
            return bookId
        })
        result[keyword] = stat
        return keyword
    })
    return result
}


var initDir = () => {
    /*if (fs.existsSync('screens')) {
        fs.rmdirSync('screens', { recursive: true, force: true })
    }
    fs.mkdirSync('screens')*/
}


var main = async (name, keywords = []) => {
    initDir()
    await setConfig()
    //await setKeywords()
    let errorKs = []
    for (let keywordIndex = 0; keywordIndex < keywords.length; keywordIndex++) {
        let keyword = keywords[keywordIndex]
        await processKeyword(keyword).catch((e) => {
            console.error('[inquirer.main] Error for keyword: ', keyword, ', please retry', process.env.VERBOSE === 'true' ? e : "")
            errorKs.push(keyword)
        })
    }
    let stats = processOutput(name)
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