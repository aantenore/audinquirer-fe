import { Component } from 'react';
import * as xlsx from 'xlsx'

class UploadExcel extends Component {

    readExcel = (file) => {
        let data = []
        const reader = new FileReader();
        reader.onload = (e) => {
            var bstr = e.target.result;
            var wb = xlsx.read(bstr, { type: 'binary' });
            var sheets = wb.SheetNames
            for (let i = 0; i < sheets.length; i++) {
                const temp = xlsx.utils.sheet_to_json(
                    wb.Sheets[wb.SheetNames[i]])
                temp.forEach((res) => {
                    data.push(res)
                })
            }
        }
        reader.readAsBinaryString(file)
        this.props.setExistingData(data)
    }

    render = () => <input type="file" onChange={(event)=>this.readExcel(event.target.files[0])} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>

}


export default UploadExcel;