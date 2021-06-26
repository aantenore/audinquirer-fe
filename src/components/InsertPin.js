import { Component } from 'react';
import '../App.css';

class InsertPin extends Component {


    render = () => (
        <>
        <form onSubmit={this.props.verifyPin}>
            <div>
                <label>Pin: </label>
                <input type="password" id="pin" name="pin"/>
            </div>
            <div className="centeredDiv">
                <input type="submit" value="OK"/>
            </div>
        </form>
        </>
    );

}

export default InsertPin;