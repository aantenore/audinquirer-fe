import './App.css';
import { Component } from 'react';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from './components/Form';
import InsertPin from './components/InsertPin';
import ExcelHelper from './helper/ExcelHelper';
import FileHelper from './helper/FileHelper';
import { ProgressBar } from 'react-bootstrap';

class App extends Component {

  state = {
    spinnerActive: false,
    loggedIn: false,
    progress: 0
  }

  inquire = () => {
    let name = this.state.name
    let keywords = this.state.keywords

    if (name?.trim() !== "" && (keywords?.trim().indexOf(',') > 0 || (keywords?.trim() !== "" && keywords?.trim().indexOf(',') < 0))) {
      let splittedKeywords = keywords.split(',').filter(k => k.trim() !== "").map(k => encodeURIComponent(k));
      let url = process.env.REACT_APP_SERVER_URL + "/inquire?n=" + name + "&k=" + JSON.stringify(splittedKeywords)
      this.setState({ spinnerActive: true }, () => {
        let progressSpeed = ((splittedKeywords.length ? splittedKeywords.length : 0) * 1200)
        console.log(progressSpeed, 'speed')
        this.setState({ progress: 0 },()=>this.progressBar(0, progressSpeed))
        axios.get(url)
          .then(res => {
            let dataRes = res.data
            console.log(res.data)
            let config = dataRes.config
            let errorK = JSON.stringify(dataRes.errorKs)
            let k = JSON.stringify(dataRes.keywords)
            if (errorK === k) {
              alert('Error, no report can be downloaded')
            } else {
              FileHelper.writeExcel(ExcelHelper.fillExcel(dataRes), config.EXCEL_FILE_PATH, () => console.log('DONE!'), () => console.log('ERROR WRITING THE EXCEL!'))
            }
          })
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.setState({ spinnerActive: false })
          })
      }
      );
    }
  }

  progressBar = (progressNum = 0, progressSpeed = 1000, count = 0) => {
    //console.log(this.state.progress, 'progress')
    if (progressNum === this.state.progress) {
      count++;
    } else {
      count = 0;
    }
    if (this.state.progress < 100 && count < 4) {
      setTimeout(() => { this.setState({ progress: progressNum }, () => this.progressBar(progressNum + 10, progressSpeed, count)) }, progressSpeed)
    }
  }

  test = () => {
    let url = process.env.REACT_APP_SERVER_URL + '/test'
    this.setState({ spinnerActive: true }, () => axios.get(url)
      .then(res => {
        alert('OK')
        console.log(res.data)
      })
      .catch(err => {
        alert('Error')
        console.error(err)
      })
      .finally(() => {
        this.setState({ spinnerActive: false })
      })
    );
  }

  handleTextChange = (e) => {
    let newState = {}
    newState[e.target.id] = e.target.value
    this.setState(newState)
  }

  verifyPin = (e) => {
    let pin = e.target.pin.value
    this.setState({ loggedIn: ('_9salsiccia84' === pin) })
  }

  render = () => (
    !this.state.loggedIn ?
      <InsertPin verifyPin={this.verifyPin} />
      : this.state.spinnerActive ? (
        <>
          <Spinner animation="grow" variant="primary" />
          <Spinner animation="grow" variant="secondary" />
          <Spinner animation="grow" variant="success" />
          <Spinner animation="grow" variant="danger" />
          <Spinner animation="grow" variant="warning" />
          <Spinner animation="grow" variant="info" />
          <Spinner animation="grow" variant="light" />
          <Spinner animation="grow" variant="dark" />
          <ProgressBar animated variant="success" now={this.state.progress} />
        </>
      )
        :
        <Form handleTextChange={this.handleTextChange} inquire={this.inquire} test={this.test} />
  );
}

export default App;
