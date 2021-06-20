import reader from 'xlsx'
import fs from 'fs'

const defaultFilePath = './test.xlsx'
var reading = false
var writing = false

class FileHelper {

    static isExcelReadingComplete = () => !!!reading

    static readExcel = (filePath = defaultFilePath, callback = (rows) => { /*console.log('Excel read: ', workbook) */ }, errorCallback = (err) => { console.log('Error retrieving excel', err) }, finallyCallback = () => { }) => {
        reading = true;
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath)
            }
            const file = reader.readFile(filePath)
            let data = []
            const sheets = file.SheetNames
            for (let i = 0; i < sheets.length; i++) {
                const temp = reader.utils.sheet_to_json(
                    file.Sheets[file.SheetNames[i]])
                temp.forEach((res) => {
                    data.push(res)
                })
            }
            resolve(data)
        })
            .then((rows) => {
                callback(rows)
            })
            /*.catch((err) =>
                            errorCallback(err))*/
            .finally(() => {
                reading = false;
                finallyCallback()
            })
    }

    static isExcelWritingComplete = () => !!!writing

    static writeExcel = (data, filePath = defaultFilePath, callback = () => { /*console.log('Content written to: ', filePath)*/ }, errorCallback = (err) => { console.log('Error writing excel', err) }, finallyCallback = () => { }) => {
        writing = true;
        return new Promise((resolve, reject) => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            //fs.writeFileSync(filePath)
            //const file = reader.readFile(filePath)
            const file = reader.utils.book_new()
            const ws = reader.utils.json_to_sheet(data)
            reader.utils.book_append_sheet(file, ws, "keywords")
            reader.writeFile(file, filePath)
            resolve()
        })
            .then(() => {
                callback()
            })
            .catch((err) =>
                errorCallback(err))
            .finally(() => {
                writing = false;
                finallyCallback()
            })
    }

    static readFile = (path) =>
        new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })

    static writeFile = (path, content) =>
        new Promise((resolve, reject) => {
            fs.writeFile(path, content, (err, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
}

export default FileHelper