const fs = require('fs')

class ExcelHelper {

    static fillExcel = (data) => {

        let rows = data.rows
        let stats = data.stats
        let errorKs = data.errorKs
        let keywords = data.keywords
        let statTemplate = data.statTemplate
        let config = data.config

        let result = []
        rows = rows ? rows : []
        let existingKeywords = rows.length > 0 ? Object.keys(rows[0]).filter(k => k.trim() !== "") : []
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
        Object.keys(statTemplate).map((stat, rowIndex) => {
            if (stat !== "F") {
                let item = { '': config.translate[stat] }
                allKeywords.map(key => {
                    if (stats[key] && !errorKs.includes(key)) {
                        if (commonKeywords.includes(key)) {
                            //append data
                            let existingData = rows[rowIndex][key]
                            item[key] = existingData + '-' + stats[key][stat]
                        } else {
                            //new
                            item[key] = stats[key][stat]
                        }
                    } else if (existingKeywords.includes(key)) {
                        //report same data in input
                        let existingData = rows[rowIndex][key]
                        item[key] = existingData
                    }
                    return key
                })
                result.push(item)
            } else {
                let links = ''
                keywords.map(key => {
                    if (!errorKs.includes(key)) {
                        links = links.concat('keyword: ', key, '\n')
                        if (stats[key] && stats[key][stat]) {
                            stats[key][stat].map(link => {
                                links = links.concat('link: ', link, '\n')
                                return link
                            })
                        }
                    }
                    return key
                })
                if (fs.existsSync('links.txt')) {
                    fs.unlinkSync('links.txt')
                }
                fs.writeFileSync('links.txt', links)
            }
            return stat
        })
        return result
    }

}

export default ExcelHelper