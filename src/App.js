import './App.css';
import { Component } from 'react';
import axios from 'axios';

class App extends Component {

  state = {}

  inquire = () => {
    let name = this.state.name
    let keywords = this.state.keywords

    if (name?.trim() != "" && (keywords?.trim().indexOf(',') > 0 || (keywords?.trim() != "" && keywords?.trim().indexOf(',') < 0))) {
      let splittedKeywords = keywords.split(',').filter(k => k.trim() != "").map(k => encodeURIComponent(k));
      let url = process.env.REACT_APP_SERVER_URL+"/inquire?n=" + name + "&k=" + JSON.stringify(splittedKeywords)
      axios.get(url).then(res => console.log(res.data))
    }
  }

  handleTextChange = (e) => {
    let newState = {}
    newState[e.target.id]=e.target.value
    this.setState(newState)
  }

  render = () => (
    <>
      <div>
        <label for="keywords">Keywords divided by commas (,): </label>
        <input type="text" id="keywords" name="keywords" onChange={this.handleTextChange}/>
      </div>
      <div>
        <label for="keywords">Your Name: </label>
        <input type="text" id="name" name="name" onChange={this.handleTextChange}/>
      </div>
      <input type="submit" value="Inquire" onClick={this.inquire}/>
    </>
  );
}

export default App;
