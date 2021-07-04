class ExcelHelper {

    static fillExcel = (data) => {

        let rows = data.rows
        let stats = data.stats
        let errorKs = data.errorKs
        let keywords = data.keywords
        let statTemplate = data.statTemplate
        let config = data.config

        let resultAllK = {}
        rows = rows ? rows : {}
        let existingKeywords = Object.keys(rows)
        let commonKeywords = []
        let allKeywords = [...existingKeywords]
        keywords.map(keyword => {
            if (existingKeywords.includes(keyword) && !commonKeywords.includes(keyword)) {
                commonKeywords.push(keyword)
            }
            if (!allKeywords.includes(keyword)) {
                allKeywords.push(keyword)
            }
            return keyword
        })
        let linksDownloaded = false
        allKeywords.map(key => {
            let resultSingleK = []
            
            Object.keys(statTemplate).map((stat, rowIndex) => {
                let infoWritten = false
                let item = {}
                if(rowIndex===0){
                    item['KEYWORD']=key
                }
                if (stat !== "F") {
                    item['DAY'] = config.translate[stat]
                    config.days.map(day => {
                        let existingData = (rows[key]&&rows[key][rowIndex])?rows[key][rowIndex][day]:undefined
                        if (stats[key] && !errorKs.includes(key)) {
                            //day after
                            if(infoWritten){
                                item[day] = ''
                            }
                            //appenda data fro new day
                            else if (existingData !== 0 && (!existingData || existingData.toString().trim().length === 0) && !infoWritten) {
                                item[day] = stats[key][stat]
                                infoWritten = true
                            //previous day
                            }else{
                                //report same data in input
                                item[day] = existingData
                            }
                        //keyword not in input list but present in excel
                        } else if (!stats[key] && !errorKs.includes(key)) {
                            //report same data in input
                            item[day] = existingData
                        }
                        return day
                    })
                    resultSingleK.push(item)
                } else if(!linksDownloaded){
                    let links = ''
                    keywords.map(key => {
                        if (!errorKs.includes(key)) {
                            links = links.concat('keyword: ', key, '\n')
                            if (stats[key] && stats[key][stat] && !errorKs.includes(key)) {
                                stats[key][stat].map(link => {
                                    links = links.concat('link: ', link, '\n')
                                    return link
                                })
                            }
                        }
                        return key
                    })
                    ExcelHelper.writeDownloadLinksFile(links, key)
                    linksDownloaded = true
                }
                return stat
            })
            resultAllK[key] = resultSingleK
            return key
        })
        return resultAllK
    }


    static writeDownloadLinksFile(links) {
        const oldElement = document.querySelector('#linksDownloadId')
        if (oldElement) {
            oldElement.remove()
        }
        if (links && links.trim() !== '') {
            var element = document.createElement("a")
            element.setAttribute("id", "linksDownloadId")
            const file = new Blob([links], { type: 'text/plain' })
            element.href = URL.createObjectURL(file)
            element.download = "bookLinkstoCheckForSelfPublishing.txt"
            document.body.appendChild(element)
            element.click()
        }
    }
}

export default ExcelHelper