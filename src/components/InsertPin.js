import { Component } from 'react';

class InsertPin extends Component {


    render = () => (
        <>
        <form onSubmit={this.props.verifyPin}>
            <div>
                <label>Pin: </label>
                <input type="password" id="pin" name="pin"/>
            </div>
            <div className="absoluteHorizontalCenteredDiv">
                <input type="submit" value="OK"/>
            </div>
        </form>
        </>
    );

}

export default InsertPin;