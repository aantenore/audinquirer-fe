import reader from 'xlsx'

const defaultFilePath = './test.xlsx'

class FileHelper {

    static writeExcel = (header, data, filePath = defaultFilePath, callback = () => { /*console.log('Content written to: ', filePath)*/ }, errorCallback = (err) => { console.log('Error writing excel', err) }, finallyCallback = () => { }) => {
        return new Promise((resolve, reject) => {
            const file = reader.utils.book_new()
            Object.keys(data).map(keyword => {
                let candidateSheetName = keyword.length > 25 ? keyword.slice(0, 25) : keyword
                let sheetNameOk = false
                let sheetName = candidateSheetName
                let i = 0
                while (!sheetNameOk) {
                    if (file.SheetNames.includes(sheetName)) {
                        sheetName = sheetName+i
                        i=i+1
                    } else {
                        sheetNameOk = true
                    }
                }
                let sheet = reader.utils.json_to_sheet(data[keyword], { header: header })
                sheet['!cols'] = FileHelper.fitToColumn(data[keyword],header);
                reader.utils.book_append_sheet(file, sheet, sheetName)
                return keyword
            })
            reader.writeFile(file, filePath)
            resolve()
        })
            .then(() => {
                callback()
            })
            .catch((err) =>
                errorCallback(err))
            .finally(() => {
                finallyCallback()
            })
    }

    static fitToColumn = (data = [{}], header) => {
        // get maximum character of each column
        return header.map(col => {
            let a =  {
                wch: (Math.max(...data.map(row => {
                    return row[col] ? row[col].toString().length : 2
                })))
            }
            return a
        })
    }
}

export default FileHelper