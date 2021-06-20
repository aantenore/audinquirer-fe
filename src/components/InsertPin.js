import { Component } from 'react';

class InsertPin extends Component {


    render = () => (
        <>
        <form onSubmit={this.props.verifyPin}>
            <div>
                <label>Pin: </label>
                <input type="password" id="pin" name="pin"/>
            </div>
            <input type="submit" value="OK"/>
        </form>
        </>
    );

}

export default InsertPin;