import { Component } from 'react';
import axios from 'axios';

class Form extends Component {

    render = () => (
        <>
            <div>
                <label>Keywords divided by commas (,): </label>
            </div>
            <div>
                <input type="text" id="keywords" name="keywords" onChange={this.props.handleTextChange} />
            </div>
            <div>
                <label>Your Name: </label>
            </div>
            <div>
                <input type="text" id="name" name="name" onChange={this.props.handleTextChange} />
            </div>
            <br />
            <div>
                <input type="submit" value="Inquire" onClick={this.props.inquire} />
                <input type="submit" value="TestGET" onClick={()=>axios.get(process.env.REACT_APP_SERVER_URL+'/test')} />
                <input type="submit" value="TestPOST" onClick={()=>axios.post(process.env.REACT_APP_SERVER_URL+'/test')} />
                <input type="submit" value="TestPUT" onClick={()=>axios.put(process.env.REACT_APP_SERVER_URL+'/test')} />
                <input type="submit" value="TestDELETE" onClick={()=>axios.delete(process.env.REACT_APP_SERVER_URL+'/test')} />
            </div>
        </>
    );
}

export default Form;