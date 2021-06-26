import { Component } from 'react';

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
            </div>
        </>
    );
}

export default Form;