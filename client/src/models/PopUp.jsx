import React from "react";
import ReactDOM from "react-dom";

import Token from "../auth/Token";

import "./PopUp.css"

class PopUp extends React.Component {
    state = {};

    handleChange = (e, { name, value }) => {
        this.setState({ [name]: value });
    }

    handleCheckbox = (e) => {
        this.setState({ public: !this.state.public })
    }

    componentDidMount() {        
        Token.expired().then((result) => {
            if (result) this.setState({ expired: true });
        });

        Token.getUser().then((result) => {
            if (result != null) this.setState({ username:  result });
        });
    }

    close() {
        ReactDOM.render(
            <React.StrictMode></React.StrictMode>,
            document.getElementById("popup")
        );
    }
}

export default PopUp;
