import reader from 'xlsx'

const defaultFilePath = './test.xlsx'

class FileHelper {

    static writeExcel = (data, filePath = defaultFilePath, callback = () => { /*console.log('Content written to: ', filePath)*/ }, errorCallback = (err) => { console.log('Error writing excel', err) }, finallyCallback = () => { }) => {
        return new Promise((resolve, reject) => {
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
                finallyCallback()
            })
    }
}

export default FileHelper