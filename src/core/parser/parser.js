import puppeteer from 'puppeteer-extra'
import userAgent from 'user-agents'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

var browser

var end = async(page) => {
    await page.close();
    if (!browser) {
        return await browser.close();
    }
}

var initPage = async(url, screenName) => {
    if (!browser) {
        browser = await puppeteer.launch({
            args: [
                '--incognito',
                '--no-sandbox'
            ]
        });
    }
    StealthPlugin().onBrowser(browser)
    var page = await browser.newPage()
    await page.setUserAgent(userAgent.toString())
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto(url, { timeout: 30000 })
    try {
        if (screenName) {
            await page.screenshot({ path: (`./screens/${screenName.replace(/[/\\?%*:|"<>]/g, '-')}.png`) })
        }
    } catch (e) {
        console.warn('Error doing screen: ', e)
    }
    return await page;
}

var getBooksIn = async(url, screenName) => {
    var page = await initPage(url, screenName);
    var result = await page.evaluate(() => {
        var booksAndCompetitor = {
            books: []
        }
        var competitorsObj = document.querySelector('.resultsSummarySubheading')
        if (competitorsObj) {
            booksAndCompetitor['competitorsAU'] = competitorsObj.textContent
        }
        var bookItems = Array.from(document.querySelectorAll('.productListItem'))
        if (bookItems && bookItems.length > 0) {
            //bookItems = bookItems.slice(0, 3)
            bookItems.map(bookItem => {
                var book = {}
                var titleLinks = Array.from(bookItem.querySelectorAll('.bc-link'))
                if (titleLinks) {
                    var index = titleLinks.length > 1 ? 1 : 0
                    book['titleAU'] = titleLinks[index].textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/ +(?= )/g, '')
                    book['audibleUrlAU'] = titleLinks[index].href
                }
                var setField = (key, label, labelType) => {
                    var parentObj = bookItem.querySelector(label)
                    if (parentObj) {
                        var childObj = parentObj.querySelector(labelType)
                        if (childObj) {
                            book[key] = childObj.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/ +(?= )/g, '')
                        }
                    }
                }
                setField('subTitleAU', '.subtitle', '.bc-text')
                setField('authorAU', '.authorLabel', '.bc-link')
                setField('narratorAU', '.narratorLabel', '.bc-link');
                setField('lengthAU', '.runtimeLabel', '.bc-text');
                setField('releaseDateAU', '.releaseDateLabel', '.bc-text');
                setField('reviewsAU', '.ratingsLabel', '.bc-size-small')
                booksAndCompetitor.books.push(book)
                return bookItem
            })
        }
        return booksAndCompetitor
    }) /*.catch(e => console.log('Error retrieving the books from audible, please retry \n', e))*/
    await end(page);
    return result;
}

var getBookDetailsIn = async(url, screenName) => {
    var page = await initPage(url, screenName);
    var result = await page.evaluate(() => {
        var bookDetails = {}
        var audibleProductDetails = document.querySelector('#audibleProductDetails')
        if (audibleProductDetails) {
            var setField = (key, label) => {
                var parentObject = audibleProductDetails.querySelector(label)
                if (parentObject) {
                    var childObj = parentObject.querySelector('td')
                    if (childObj) {
                        var obj = childObj.querySelector(':first-child')
                        if (obj) {
                            bookDetails[key] = obj.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/ +(?= )/g, '')
                        }
                    }
                }
            }
            setField('lengthAM', '#detailsListeningLength')
            setField('authorAM', '#detailsauthor')
            setField('narratorAM', '#detailsnarrator')
            setField('whyspersyncForVoiceAM', '#detailsWhisperSyncForVoiceReady')
            setField('releaseDateAM', '#detailsReleaseDate')
            setField('publisherAM', '#detailspublisher')
            setField('programTypeAM', '#detailsProgramType')
            setField('versionAM', '#detailsVersion')
            setField('languageAM', '#detailsLanguage')
            setField('asinAM', '#detailsAsin')
            var bsrContainer = audibleProductDetails.querySelector('.prodDetSectionEntry+td')
            var bsrValues = Array.from(bsrContainer ? bsrContainer.querySelectorAll('span>span') : [])
            bookDetails['bsrAM'] = []
            bsrValues.map((bsrValue) => {
                bookDetails['bsrAM'].push(bsrValue.textContent.replace(/(\r\n|\n|\r)/gm, "").replace(/ +(?= )/g, ''))
                return bsrValue
            })
        }
        return bookDetails
    })
    await end(page);
    return result;
}

var getBookUrlIn = async(url, screenName) => {
    if(process.env.VERBOSE === 'true'){
        console.log('[parser.getBookUrlIn] The search url is: ',url) 
    }
    var page = await initPage(url, screenName);
    var result = await page.evaluate(() => {
        var itemsFound = Array.from(document.querySelectorAll('.s-result-item'));
        var tempBookUrl
        if (itemsFound.length > 0) {
            var itemFound = itemsFound[0]
            tempBookUrl = itemFound.querySelector(".a-link-normal.a-text-normal")
            if(!tempBookUrl && itemsFound.length > 1){
                itemFound = itemsFound[1]
                tempBookUrl = itemFound.querySelector(".a-link-normal.a-text-normal")
            }
            if(!tempBookUrl && itemsFound.length > 2){
                itemFound = itemsFound[2]
                tempBookUrl = itemFound.querySelector(".a-link-normal.a-text-normal")
            }
        }
        return tempBookUrl ? tempBookUrl.href : ''
    })
    await end(page);
    if(process.env.VERBOSE === 'true'){
        console.log('[parser.getBookUrlIn] The book url is: ',result) 
    }
    return result;
}

var parser = {
    getBooks: (url, name) => getBooksIn(url, name),
    getBookDetails: (url, name) => getBookDetailsIn(url, name),
    getBookUrl: (url, name) => getBookUrlIn(url, name)
}

export default parser