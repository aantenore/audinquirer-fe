import './App.css';
import { Component } from 'react';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {

  state = {
    spinnerActive: false
  }

  inquire = () => {
    let name = this.state.name
    let keywords = this.state.keywords

    if (name?.trim() !== "" && (keywords?.trim().indexOf(',') > 0 || (keywords?.trim() !== "" && keywords?.trim().indexOf(',') < 0))) {
      let splittedKeywords = keywords.split(',').filter(k => k.trim() !== "").map(k => encodeURIComponent(k));
      let url = process.env.REACT_APP_SERVER_URL + "/inquire?n=" + name + "&k=" + JSON.stringify(splittedKeywords)
      this.setState({ spinnerActive: true }, () => axios.get(url)
        .then(res => {
          console.log(res.data)
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.setState({ spinnerActive: false })
        })
      );
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

  render = () => (
    this.state.spinnerActive ?
      <div>
        <Spinner animation="grow" />
      </div>
      :
      <>
        <div>
          <label for="keywords">Keywords divided by commas (,): </label>
          <input type="text" id="keywords" name="keywords" onChange={this.handleTextChange} />
        </div>
        <div>
          <label for="keywords">Your Name: </label>
          <input type="text" id="name" name="name" onChange={this.handleTextChange} />
        </div>
        <input type="submit" value="Inquire" onClick={this.inquire} />
        <input type="submit" value="Test" onClick={this.test} />
      </>
  );
}

export default App;
